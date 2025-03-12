// [START discounts-allocator.add-ui]
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { Page, Layout, BlockStack, Card, Banner, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// [START discounts-allocator.action]
export const action = async ({ params, request }) => {
  const functionExtensionId = params.functionId;

  const registerDiscountsAllocatorMutation = `
    #graphql
      mutation registerDiscountsAllocator($functionExtensionId: String!) {
        discountsAllocatorFunctionRegister(functionExtensionId: $functionExtensionId) {
          userErrors {
            code
            message
            field
          }
        }
      }
    `;

  if (functionExtensionId !== null) {
    const { admin } = await authenticate.admin(request);

    const registerResponse = await admin.graphql(
      registerDiscountsAllocatorMutation,
      {
        variables: {
          functionExtensionId: functionExtensionId,
        },
      },
    );

    const registerResponseJson = await registerResponse.json();
    const registerErrors =
      registerResponseJson.data.discountsAllocatorFunctionRegister?.userErrors;
    return json({ registerErrors });
  }

  return json({ errors: ["No functionExtensionId provided"] });
};
// [END discounts-allocator.action]

export default function DiscountsAllocator() {
  const actionData = useActionData();
  // [START discounts-allocator.ui-configuration]
  const submitForm = useSubmit();
  // [END discounts-allocator.ui-configuration]
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.errors && actionData?.errors.length === 0) {
      shopify.toast.show(
        "Discounts Allocator Function registered successfully!",
      );
    }
  }, [actionData]);

  const errorBanner = actionData?.errors.length ? (
    <Layout.Section>
      <Banner
        title="There were some issues with your form submission"
        tone="critical"
      >
        <ul>
          {actionData?.errors?.map((error, index) => {
            return <li key={`${index}`}>{error.message}</li>;
          })}
        </ul>
      </Banner>
    </Layout.Section>
  ) : null;

  // [START discounts-allocator.ui-configuration]
  const actions = {
    backAction: {
      content: "Home",
      onAction: () => navigate("/app"),
    },
    primaryAction: {
      content: "Register Discounts allocator",
      onAction: () => submitForm({}, { method: "post" }),
    },
  };
  // [END discounts-allocator.ui-configuration]

  return (
    // [START discounts-allocator.ui-configuration]
    <Page title="Register Discounts Allocator Function" {...actions}>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="bodyMd">
                Add more awesome details about your allocator here! (Like
                ability to add metafields)
              </Text>
            </Card>
          </Layout.Section>
          {errorBanner}
        </Layout>
      </BlockStack>
    </Page>
    // [END discounts-allocator.ui-configuration]
  );
}
// [END discounts-allocator.add-ui]

// import { ActionFunctionArgs, json } from "@remix-run/node";
// import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
// import { Banner, BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
// import { authenticate } from "app/shopify.server";
// import { useEffect } from "react";

// export const action = async ({ params, request }: ActionFunctionArgs) => {
//   const functionExtensionId = params.functionId;
//   const registerDiscountsAllocatorMutation = `
//     #graphql
//       mutation registerDiscountsAllocator($functionExtensionId: ID!) {
//         discountsAllocatorFunctionRegister(functionExtensionId: $functionExtensionId) {
//           userErrors {
//             code
//             message
//             field
//           }
//         }
//   }
//   `;
//   if (functionExtensionId !== null) {
//     const { admin } = await authenticate.admin(request);
//     const response = await admin.graphql(registerDiscountsAllocatorMutation, {
//       variables: {
//         functionExtensionId: functionExtensionId,
//       },
//     });
//     const responseJson = await response.json();
//     console.log("responseJson", responseJson);
//     const errors =
//       responseJson.data.discountsAllocatorFunctionRegister?.userErrors;
//     return json({ errors });
//   }
//   return json({ errors: ["No functionExtensionId provided"] });
// };

// export default function DiscountsAllocator() {
//   const actionData = useActionData<typeof action>();
//   const submitForm = useSubmit();
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (actionData?.errors && actionData?.errors.length === 0) {
//       shopify.toast.show(
//         "Discounts Allocator Function registered successfully",
//       );
//     }
//   }, [actionData]);
//   const errorBanner = actionData?.errors.length ? (
//     <Layout.Section>
//       <Banner
//         title="There were some issues with your form submission"
//         tone="critical"
//       >
//         <ul>
//           {actionData?.errors?.map((error, index) => (
//             <li key={`${index}`}>{error.message}</li>
//           ))}
//         </ul>
//       </Banner>
//     </Layout.Section>
//   ) : null;
//   const pageAction = {
//     backAction: {
//       content: "Home",
//       onAction: () => navigate("/app"),
//     },
//     primaryAction: {
//       content: "Register Discount allocator",
//       onAction: () => submitForm({}, { method: "post" }),
//     },
//   };
//   return (
//     <Page title="Register Discounts Allocator Function" {...pageAction}>
//       <BlockStack gap="500">
//         <Layout>
//           <Layout.Section>
//             <Card>
//               <Text as="h2" variant="bodyMd">
//                 Add more awesome details about your allocator here! (Like
//                 ability to add metafields)
//               </Text>
//             </Card>
//           </Layout.Section>
//           {errorBanner}
//         </Layout>
//       </BlockStack>
//     </Page>
//   );
// }
