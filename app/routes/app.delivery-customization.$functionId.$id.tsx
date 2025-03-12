import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  json,
  Form,
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

export const loader = async (args: LoaderFunctionArgs) => {
  console.log("args", args);
  const { params, request } = args;

  const { functionId, id } = params;
  console.log("functionId", functionId);
  const { admin } = await authenticate.admin(request);
  if (id !== "new") {
    const gid = `gid://shopify/DeliveryCustomization/${id}`;
    const response = await admin.graphql(
      `#graphql
        query getDeliveryCustomization($id: ID!) {
          deliveryCustomization(id: $id) {
            id
            title
            enabled
            metafield(namespace: "$app:delivery-customization", key: "function-configuration") {
              id
              value
            }
          }
        }
      `,
      {
        variables: {
          id: gid,
        },
      },
    );
    const responseJson = await response.json();
    console.log("deliveryCustomization response.json", responseJson);
    const deliveryCustomization = responseJson.data.deliveryCustomization;
    console.log(
      "deliveryCustomization.metafield.value",
      deliveryCustomization.metafield.value,
    );
    const metafieldValue = JSON.parse(deliveryCustomization.metafield.value);
    console.log(
      "JSON.parse(deliveryCustomization.metafield.value)",
      metafieldValue,
    );
    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: metafieldValue.countryCode,
        message: metafieldValue.message,
      }),
    };
  }
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      countryCode: "",
      message: "",
    }),
  };
};

export const action = async (args: ActionFunctionArgs) => {
  console.log("args", args);
  const { params, request } = args;
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  console.log("action formData", formData);
  const countryCode = formData.get("countryCode") as string;
  const message = formData.get("message") as string;
  const deliveryCustomizationInput = {
    functionId,
    title: `Change ${countryCode} delivery message`,
    enabled: true,
    metafields: [
      {
        namespace: "$app:delivery-customization",
        key: "function-configuration",
        type: "json",
        value: JSON.stringify({
          countryCode,
          message,
        }),
      },
    ],
  };
  if (id !== "new") {
    const response = await admin.graphql(
      `#graphql
        mutation updateDeliveryCustomization($id: ID!, $input: DeliveryCustomizationInput!) {
          deliveryCustomizationUpdate(id: $id, deliveryCustomization: $input) {
            deliveryCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }
      `,
      {
        variables: {
          id: `gid://shopify/DeliveryCustomization/${id}`,
          input: deliveryCustomizationInput,
        },
      },
    );
    const responseJson = await response.json();
    console.log("updateDeliveryCustomization responseJson", responseJson);
    const errors = responseJson.data.deliveryCustomizationUpdate?.userErrors;
    return json({ errors });
  } else {
    const response = await admin.graphql(
      `#graphql
        mutation createDeliveryCustomization($input: DeliveryCustomizationInput!) {
          deliveryCustomizationCreate(deliveryCustomization: $input) {
            deliveryCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }
      `,
      {
        variables: {
          input: deliveryCustomizationInput,
        },
      },
    );
    const responseJson = await response.json();
    console.log("createDeliveryCustomization responseJson", responseJson);
    const errors = responseJson.data.deliveryCustomizationCreate?.userErrors;
    return json({ errors });
  }
};

export default function DeliveryCustomization() {
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");
  const [countryCodeFocused, setCountryCodeFocused] = useState(true);
  const [messageFocused, setMessageFocused] = useState(true);
  console.log("delivery customization loaderData", loaderData);
  useEffect(() => {
    if (loaderData) {
      const parsedData = JSON.parse(loaderData.body);
      setCountryCode(parsedData.countryCode);
      setMessage(parsedData.message);
    }
  }, [loaderData]);
  const isLoading = navigation.state === "submitting";
  useEffect(() => {
    if (actionData?.errors.length === 0) {
      open(`shopify:admin/settings/shipping/customizations`, "_top");
    }
  }, [actionData?.errors]);
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
  const handleSubmit = () => {
    submit({ countryCode, message }, { method: "post" });
  };
  return (
    <Page
      title="Change delivery message"
      backAction={{
        content: "Delivery Customization",
        onAction: () =>
          open("shopify:admin/settings/shipping/customizations", "_top"),
        // open("shopify:admin/settings/shipping/customizations"),
      }}
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit,
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
                    name="countryCode"
                    type="text"
                    label="Country Code"
                    value={countryCode}
                    onChange={setCountryCode}
                    disabled={isLoading}
                    requiredIndicator
                    autoComplete="on"
                    onFocus={() => setCountryCodeFocused(true)}
                    onBlur={() => setCountryCodeFocused(false)}
                    error={
                      countryCode.length === 0 && !countryCodeFocused
                        ? "Country Code is required"
                        : ""
                    }
                  />
                  <TextField
                    name="message"
                    type="text"
                    label="Message"
                    value={message}
                    onChange={setMessage}
                    disabled={isLoading}
                    requiredIndicator
                    autoComplete="off"
                    onFocus={() => setMessageFocused(true)}
                    onBlur={() => setMessageFocused(false)}
                    error={
                      message.length === 0 && !messageFocused
                        ? "Message is required"
                        : ""
                    }
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
