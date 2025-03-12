import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useEffect, useState } from "react";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { id } = params;

  // If the ID is `new`, then we are creating a new customization and there's no data to load.
  if (id === "new") {
    return {
      paymentMethodName: "",
      cartTotal: "0",
    };
  }

  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      query getPaymentCustomization($id: ID!) {
        paymentCustomization(id: $id) {
          id
          metafield(namespace: "$app:payment-customization", key: "function-configuration") {
            value
          }
        }
      }`,
    {
      variables: {
        id: `gid://shopify/PaymentCustomization/${id}`,
      },
    },
  );

  const responseJson = await response.json();
  const metafield =
    responseJson.data.paymentCustomization?.metafield?.value &&
    JSON.parse(responseJson.data.paymentCustomization.metafield.value);

  return json({
    paymentMethodName: metafield?.paymentMethodName ?? "",
    cartTotal: metafield?.cartTotal ?? "0",
  });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  console.log("PaymentCustomization formData", formData);
  const paymentMethodName = formData.get("paymentMethodName");
  const cartTotal = parseFloat(formData.get("cartTotal") as string);
  const paymentCustomizationInput = {
    functionId,
    title: `Hide ${paymentMethodName} if cart total is larger than ${cartTotal}`,
    enabled: true,
    metafields: [
      {
        namespace: "$app:payment-customization",
        key: "function-configuration",
        type: "json",
        value: JSON.stringify({ paymentMethodName, cartTotal }),
      },
    ],
  };
  if (id === "new") {
    const response = await admin.graphql(
      `#graphql
        mutation createPaymentCustomization($input: PaymentCustomizationInput!) {
          paymentCustomizationCreate(paymentCustomization: $input) {
            paymentCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }`,
      {
        variables: {
          input: paymentCustomizationInput,
        },
      },
    );
    const responseJson = await response.json();
    const errors = responseJson.data.paymentCustomizationCreate?.userErrors;
    return json({ errors });
  } else {
    const response = await admin.graphql(
      `#graphql
        mutation updatePaymentCustomization($id: ID!, $input: PaymentCustomizationInput!) {
          paymentCustomizationUpdate(id: $id, paymentCustomization: $input) {
            paymentCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }`,
      {
        variables: {
          id: `gid://shopify/PaymentCustomization/${id}`,
          input: paymentCustomizationInput,
        },
      },
    );
    const responseJson = await response.json();
    const errors = responseJson.data.paymentCustomizationUpdate?.userErrors;
    return json({ errors });
  }
};

export default function PaymentCustomization() {
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  console.log("payment customization loaderData", loaderData);
  const [paymentMethodName, setPaymentMethodName] = useState(
    loaderData.paymentMethodName,
  );
  const [cartTotal, setCartTotal] = useState(loaderData.cartTotal);
  const isLoading = navigation.state === "submitting";
  const handleSubmit = () => {
    submit({ paymentMethodName, cartTotal }, { method: "post" });
  };
  const errorBanner = actionData?.errors.length ? (
    <Layout.Section>
      <Banner
        title="There was an error creating the customization."
        tone="critical"
      >
        <ul>
          {actionData?.errors.map((error: any, index: any) => (
            <li key={`${index}`}>{error.message}</li>
          ))}
        </ul>
      </Banner>
    </Layout.Section>
  ) : null;
  useEffect(() => {
    if (actionData?.errors.length === 0) {
      console.log("payment customization created");
      // open(`shopify:admin/settings/payments/customizations`, "_top");
    }
  }, [actionData?.errors]);
  return (
    <Page
      title="Hide payment method"
      backAction={{
        content: "Payment customizations",
        onAction: () =>
          open("shopify:admin/settings/payments/customizations", "_top"),
      }}
      primaryAction={{
        content: "Save",
        onAction: handleSubmit,
        loading: isLoading,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    name="paymentMethodName"
                    label="Payment method"
                    type="text"
                    value={paymentMethodName}
                    onChange={setPaymentMethodName}
                    disabled={isLoading}
                    autoComplete="on"
                    requiredIndicator
                    // error="Payment method is required"
                  />
                  <TextField
                    name="cartTotal"
                    label="Cart total"
                    type="number"
                    value={cartTotal}
                    onChange={setCartTotal}
                    disabled={isLoading}
                    autoComplete="on"
                    requiredIndicator
                    // error="Cart total is required"
                  />
                </FormLayout.Group>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
