import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  PageActions,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useEffect, useState } from "react";
import { type Product } from "app/types/appBridgeType";
import CheckoutCharge from "app/components/CheckoutCharge";
import ProductPicker from "app/components/ProductPicker";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();
  const sellingPlanName = form.get("sellingPlanName");
  console.log('form.get("sellingPlanName")', sellingPlanName);
  const initialCheckoutCharge = form.get("initialCheckoutCharge");
  console.log('form.get("initialCheckoutCharge")', initialCheckoutCharge);
  const selectedProducts = form.get("selectedProducts") as string;
  console.log('form.get("selectedProducts")', selectedProducts);
  const selectedProductsArray = selectedProducts
    ? selectedProducts.split(",")
    : [];
  console.log("selectedProductsArray", selectedProductsArray);
  const selectedDates = form.get("selectedDates") as string;
  console.log('form.get("selectedDates")', selectedDates);
  const haveRemainingBalance = Number(initialCheckoutCharge) < 100;
  const response = await admin.graphql(
    `#graphql
      mutation sellingPlanGroupCreate($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput!) {
        sellingPlanGroupCreate(input: $input, resources: $resources) {
          sellingPlanGroup {
            id
            name
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        input: {
          name: sellingPlanName,
          merchantCode: "Pre-order",
          options: ["pre-order"],
          position: 1,
          sellingPlansToCreate: [
            {
              name: "Pre-order with deposit",
              options: "Pre-order with deposit",
              category: "PRE_ORDER",
              billingPolicy: {
                fixed: {
                  checkoutCharge: {
                    type: "PERCENTAGE",
                    value: {
                      percentage: Number(initialCheckoutCharge),
                    },
                  },
                  remainingBalanceChargeTrigger: haveRemainingBalance
                    ? "EXACT_TIME"
                    : "NO_REMAINING_BALANCE",
                  remainingBalanceChargeExactTime: haveRemainingBalance
                    ? new Date(selectedDates).toISOString()
                    : null,
                },
              },
              deliveryPolicy: {
                fixed: {
                  fulfillmentTrigger: "UNKNOWN",
                },
              },
              inventoryPolicy: {
                reserve: "ON_FULFILLMENT",
              },
            },
          ],
        },
        resources: {
          productIds: selectedProductsArray,
        },
      },
    },
  );
  const responseJson = await response.json();
  console.log("sellingPlanGroupCreate responseJson", responseJson);
  return json({
    sellingPlanGroup:
      responseJson.data?.sellingPlanGroupCreate?.sellingPlanGroup?.name,
  });
};

// type SelectedDates = {
//   start: Date;
//   end: Date;
// };

export default function CreatePage() {
  const nav = useNavigation();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [sellingPlanName, setSellingPlanName] = useState("");
  const [initialCheckoutCharge, setInitialCheckoutCharge] = useState(0);
  const handleSellingNameChange = (newValue: string) =>
    setSellingPlanName(newValue);
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const today = new Date();
  const [selectedDates, setSelectedDates] = useState({
    start: today,
    end: today,
  });
  console.log("selectedDates", selectedDates);
  const createPreOrder = () =>
    submit(
      {
        selectedProducts: selectedProducts.map((product) => product.id),
        sellingPlanName,
        initialCheckoutCharge,
        // selectedDates: initialCheckoutCharge < 100 ? selectedDates.start : null
        selectedDates:
          initialCheckoutCharge < 100 ? (selectedDates.start as any) : null,
      },
      { replace: true, method: "POST" },
    );

  useEffect(() => {
    if (actionData?.sellingPlanGroup) {
      console.log(
        "Pre-order created actionData.sellingPlanGroup",
        actionData.sellingPlanGroup,
      );
      shopify.toast.show("Pre-order created", {
        isError: false,
      });
    }
  }, [actionData?.sellingPlanGroup]);
  return (
    <Page>
      <TitleBar title="Create a pre-order" />
      <>
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <FormLayout>
                <Card>
                  <BlockStack gap="200">
                    <TextField
                      label="Pre-order name"
                      name="sellingPlanName"
                      value={sellingPlanName}
                      onChange={handleSellingNameChange}
                      autoComplete="off"
                    />
                  </BlockStack>
                </Card>
                <CheckoutCharge
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                  initialCheckoutCharge={initialCheckoutCharge}
                  setInitialCheckoutCharge={setInitialCheckoutCharge}
                />
                <ProductPicker
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                />
              </FormLayout>
            </BlockStack>
          </Layout.Section>
        </Layout>
        <Layout.Section>
          <PageActions
            primaryAction={
              <Button
                variant="primary"
                loading={isLoading}
                onClick={createPreOrder}
              >
                Create
              </Button>
            }
          />
        </Layout.Section>
      </>
    </Page>
  );
}
