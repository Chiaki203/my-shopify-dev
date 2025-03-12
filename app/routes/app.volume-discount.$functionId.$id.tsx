import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  DiscountMethod,
  DiscountStatus,
  MethodCard,
  RequirementType,
  SummaryCard,
  UsageLimitsCard,
} from "@shopify/discount-app-components";
import {
  Banner,
  BlockStack,
  Box,
  Card,
  Layout,
  Page,
  PageActions,
  Text,
  TextField,
} from "@shopify/polaris";
import { useField, useForm } from "@shopify/react-form";
import { useEffect, useMemo } from "react";
import { CurrencyCode } from "@shopify/react-i18n";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import shopify from "../shopify.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  console.log("volume discount params", params);
  console.log("volume discount request", request);
  const { functionId, id } = params;
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  console.log("volume discount formData", formData);
  const {
    title,
    method,
    code,
    combinesWith,
    usageLimit,
    appliesOncePerCustomer,
    startsAt,
    endsAt,
    configuration,
  } = JSON.parse(formData.get("discount") as string);
  const baseDiscount = {
    functionId,
    title,
    combinesWith,
    startsAt: new Date(startsAt),
    endsAt: endsAt && new Date(endsAt),
  };
  const metafields = [
    {
      namespace: "$app:volume-discount",
      key: "function-configuration",
      type: "json",
      value: JSON.stringify({
        quantity: configuration.quantity,
        percentage: configuration.percentage,
      }),
    },
  ];
  if (id === "new") {
    if (method === DiscountMethod.Code) {
      const baseCodeDiscount = {
        ...baseDiscount,
        title: code,
        code,
        usageLimit,
        appliesOncePerCustomer,
      };
      const response = await admin.graphql(
        `#graphql
          mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
            discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
              codeAppDiscount {
                discountId
                title
              }
              userErrors {
                code
                message
                field
              }
            }
          }
        `,
        {
          variables: {
            discount: {
              ...baseCodeDiscount,
              metafields,
            },
          },
        },
      );
      const responseJson = await response.json();
      console.log("CreateCodeDiscount responseJson", responseJson);
      const errors = responseJson.data.discountCreate?.userErrors;
      const discount = responseJson.data.discountCreate?.codeAppDiscount;
      return json({ errors, discount: { ...discount, functionId } });
    } else {
      const response = await admin.graphql(
        `#graphql
          mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
            discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
              automaticAppDiscount {
                discountId
                title
              }
              userErrors {
                code
                message
                field
              }
            }
          }
        `,
        {
          variables: {
            discount: {
              ...baseDiscount,
              metafields,
            },
          },
        },
      );
      const responseJson = await response.json();
      console.log("CreateAutomaticDiscount responseJson", responseJson);
      const errors = responseJson.data.discountCreate?.userErrors;
      const discount = responseJson.data.discountCreate?.automaticAppDiscount;
      return json({ errors, discount: { ...discount, functionId } });
    }
  } else {
    console.log("update discount metafields");
    // if (method === DiscountMethod.Code) {
    const response = await admin.graphql(
      `#graphql
          mutation UpdateMetafields($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                id
                value
              }
              userErrors {
                code
                message
                field
              }
            }
          }
        `,
      {
        variables: {
          metafields: [
            {
              key: "function-configuration",
              namespace: "$app:volume-discount",
              ownerId: "gid://shopify/DiscountAutomaticNode/2157439517050",
              type: "json",
              value: JSON.stringify({
                quantity: configuration.quantity,
                percentage: configuration.percentage,
              }),
            },
          ],
        },
      },
    );
    console.log("update metafields");
    // const response = await admin.graphql(
    //   `#graphql
    //     mutation UpdateCodeDiscount($id: ID!, $discount: DiscountCodeAppInput!) {
    //       discountUpdate: discountCodeAppUpdate(id: $id, codeAppDiscount: $discount) {
    //         codeAppDiscount {
    //           discountId
    //           title
    //         }
    //         userErrors {
    //           code
    //           message
    //           field
    //         }
    //       }
    //     }
    //   `,
    //   {
    //     variables: {
    //       id: `gid://shopify/DiscountCodeApp/${id}`,
    //       discount: {
    //         ...baseDiscount,
    //         title: code,
    //         code,
    //         usageLimit,
    //         appliesOncePerCustomer,
    //         metafields,
    //       },
    //     },
    //   },
    // );
    const responseJson = await response.json();
    console.log("UpdateCodeDiscount responseJson", responseJson);
    const errors = responseJson.data.metafieldsSet?.userErrors;
    const updatedMetafields = responseJson.data.metafieldsSet?.metafields;
    return json({ errors, metafields: updatedMetafields });
    // } else {
    //   const response = await admin.graphql(
    //     `#graphql
    //       mutation UpdateMetafields($metafields: [MetafieldsSetInput!]!) {
    //         metafieldsSet(metafields: $metafields) {
    //           metafields {
    //             id
    //             value
    //           }
    //           userErrors {
    //             code
    //             message
    //             field
    //           }
    //         }
    //       }
    //     `,
    //     {
    //       variables: {
    //         metafields: [
    //           {
    //             key: "function-configuration",
    //             namespace: "$app:volume-discount",
    //             ownerId: "gid://shopify/DiscountAutomaticNode/2157439517050",
    //             type: "json",
    //             value: JSON.stringify({
    //               quantity: configuration.quantity,
    //               percentage: configuration.percentage,
    //             }),
    //           },
    //         ],
    //       },
    //     },
    //   );
    //   console.log("update metafields");
    // const response = await admin.graphql(
    //   `#graphql
    //     mutation UpdateAutomaticDiscount($id: ID!, $discount: DiscountAutomaticAppInput!) {
    //       discountUpdate: discountAutomaticAppUpdate(id: $id, automaticAppDiscount: $discount) {
    //         automaticAppDiscount {
    //           discountId
    //           title
    //         }
    //         userErrors {
    //           code
    //           message
    //           field
    //         }
    //       }
    //     }
    //   `,
    //   {
    //     variables: {
    //       id: `gid://shopify/DiscountAutomaticApp/${id}`,
    //       discount: {
    //         ...baseDiscount,
    //         metafields,
    //       },
    //     },
    //   },
    // );
    //   const responseJson = await response.json();
    //   console.log("UpdateCodeDiscount responseJson", responseJson);
    //   const errors = responseJson.data.metafieldsSet?.userErrors;
    //   const updatedMetafields = responseJson.data.metafieldsSet?.metafields;
    //   return json({ errors, metafields: updatedMetafields });
    // }
  }
};

export default function VolumeNew() {
  const submitForm = useSubmit();
  const actionData = useActionData<typeof action>();
  console.log("actionData", actionData);
  const navigation = useNavigation();
  const todaysDate = useMemo(() => new Date(), []);
  console.log("todaysDate", todaysDate);
  const isLoading = navigation.state === "submitting";
  const currencyCode = CurrencyCode.Eur;
  const submitErrors = actionData?.errors || [];
  const returnToDiscounts = () => open("shopify://admin/discounts", "_top");
  // useEffect(() => {
  //   if (actionData?.errors.length === 0 && actionData?.discount) {
  //     returnToDiscounts();
  //   }
  // }, [actionData]);
  const {
    fields: {
      discountTitle,
      discountMethod,
      discountCode,
      combinesWith,
      requirementType,
      requirementSubtotal,
      requirementQuantity,
      usageLimit,
      appliesOncePerCustomer,
      startDate,
      endDate,
      configuration,
    },
    submit,
  } = useForm({
    fields: {
      discountTitle: useField(""),
      discountMethod: useField(DiscountMethod.Code),
      discountCode: useField(""),
      combinesWith: useField({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      requirementType: useField(RequirementType.None),
      requirementSubtotal: useField("0"),
      requirementQuantity: useField("0"),
      usageLimit: useField(null),
      appliesOncePerCustomer: useField(false),
      startDate: useField(todaysDate),
      endDate: useField(null),
      configuration: {
        quantity: useField("1"),
        percentage: useField("0"),
      },
    },
    onSubmit: async (form) => {
      const discount = {
        title: form.discountTitle,
        method: form.discountMethod,
        code: form.discountCode,
        combinesWith: form.combinesWith,
        usageLimit: form.usageLimit === null ? null : parseInt(form.usageLimit),
        // usageLimit: form.usageLimit === null ? null : form.usageLimit,
        appliesOncePerCustomer: form.appliesOncePerCustomer,
        startsAt: form.startDate,
        endsAt: form.endDate,
        configuration: {
          quantity: parseInt(form.configuration.quantity),
          percentage: parseFloat(form.configuration.percentage),
        },
      };
      submitForm({ discount: JSON.stringify(discount) }, { method: "post" });
      return { status: "success" };
    },
  });

  console.log("discountTitle", discountTitle);
  console.log("discountMethod", discountMethod);
  console.log("discountCode", discountCode);
  console.log("combinesWith", combinesWith);
  console.log("requirementType", requirementType);
  console.log("requirementSubtotal", requirementSubtotal);
  console.log("requirementQuantity", requirementQuantity);
  console.log("usageLimit", usageLimit);
  console.log("appliesOncePerCustomer", appliesOncePerCustomer);
  console.log("startDate", startDate);
  console.log("endDate", endDate);
  console.log("configuration", configuration);

  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner tone="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }: any, index: any) => (
              <li key={`${message}${index}`}>
                {field.join(".")} {message}
              </li>
            ))}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;
  return (
    <Page>
      <TitleBar title="Create volume discount">
        <button variant="breadcrumb" onClick={returnToDiscounts}>
          Discounts
        </button>
        <button variant="primary" onClick={submit}>
          Save discount
        </button>
      </TitleBar>
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Form method="post">
            <BlockStack align="space-around" gap="200">
              <MethodCard
                title="Volume"
                discountTitle={discountTitle}
                discountMethod={discountMethod}
                discountCode={discountCode}
                discountClass={DiscountClass.Product}
              />
              <Box paddingBlockEnd="300">
                <Card>
                  <BlockStack>
                    <Text variant="headingMd" as="h2">
                      Volume
                    </Text>
                    <TextField
                      label="Minimum quantity"
                      autoComplete="on"
                      {...configuration.quantity}
                    />
                    <TextField
                      label="Discount percentage"
                      autoComplete="on"
                      {...configuration.percentage}
                      suffix="%"
                    />
                  </BlockStack>
                </Card>
              </Box>
              {discountMethod.value === DiscountMethod.Code && (
                <UsageLimitsCard
                  totalUsageLimit={usageLimit as any}
                  oncePerCustomer={appliesOncePerCustomer}
                />
              )}
              <CombinationCard
                combinableDiscountTypes={combinesWith}
                discountClass={DiscountClass.Product}
                discountDescriptor={"Discount"}
              />
              <ActiveDatesCard
                startDate={startDate as any}
                endDate={endDate as any}
                timezoneAbbreviation="CET"
              />
            </BlockStack>
          </Form>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: "Volume",
              isEditing: false,
            }}
            performance={{
              status: DiscountStatus.Scheduled,
              usageCount: 0,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubtotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
            }}
            usageLimits={{
              oncePerCustomer: appliesOncePerCustomer.value,
              totalUsageLimit: usageLimit.value,
            }}
            activeDates={{
              startDate: startDate.value as any,
              endDate: endDate.value,
            }}
          />
        </Layout.Section>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: "Save discount",
              loading: isLoading,
              onAction: submit,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: returnToDiscounts,
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
