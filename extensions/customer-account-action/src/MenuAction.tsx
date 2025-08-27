import {
  Button,
  reactExtension,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";

export default reactExtension(
  "customer-account.order.action.menu-item.render",
  () => <MenuAction />,
);

function MenuAction() {
  const { orderId } =
    useApi<"customer-account.order.action.menu-item.render">();
  console.log("orderId", orderId);
  const [hasFulfillments, setHasFulfillments] = useState(false);
  useEffect(() => {
    const getProductsData = async () => {
      const orderQuery = {
        query: `
        query {
          order(id: "${orderId}") {
            id
            createdAt
            fulfillments(first: 1) {
              nodes {
                latestShipmentStatus
              }
            }
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      `,
      };
      const result = await fetch(
        "shopify://customer-account/api/unstable/graphql.json",
        // "https://shopify.com/pitarin-zero/account/customer/api/2025-04/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderQuery),
        },
      );
      const resultData = await result.json();
      console.log("fulfillments result", resultData);
      const { data } = resultData;
      // if (data?.order?.fulfillments?.nodes) {
      setHasFulfillments(data.order.fulfillments.nodes.length !== 0);
      // }
    };
    getProductsData();
  }, [orderId]);
  if (!hasFulfillments) {
    return null;
  }
  return <Button>Report a problem3</Button>;
}

// export default reactExtension(
//   "customer-account.order.action.menu-item.render",
//   async (api) => {
//     const { orderId } = api;
//     console.log("orderId", orderId);
//     let hasFulfillments = false;
//     try {
//       const orderQuery = {
//         query: `
//         query {
//           order(id: "${orderId}") {
//             id
//             createdAt
//             fulfillments(first: 1) {
//               nodes {
//                 latestShipmentStatus
//               }
//             }
//             lineItems(first: 10) {
//               edges {
//                 node {
//                   id
//                   title
//                 }
//               }
//             }
//           }
//         }
//       `,
//       };
//       const result = await fetch(
//         "shopify://customer-account/api/unstable/graphql.json",
//         // "https://shopify.com/pitarin-zero/account/customer/api/2025-04/graphql",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(orderQuery),
//         },
//       );
//       const { data } = await result.json();
//       console.log("fulfillments data", data);
//       hasFulfillments = data.order.fulfillments.nodes.length !== 0;
//     } catch (error) {
//       console.log("error", error);
//       hasFulfillments = false;
//     }
//     return <MenuAction showAction={hasFulfillments} />;
//   },
// );

// function MenuAction({ showAction }) {
//   if (!showAction) {
//     return null;
//   }
//   return <Button>Report a problem2</Button>;
// }

// import {
//   BlockStack,
//   reactExtension,
//   TextBlock,
//   Banner,
//   useApi
// } from "@shopify/ui-extensions-react/customer-account";

// export default reactExtension(
//   "customer-account.order-status.block.render",
//   () => <PromotionBanner />
// );

// function PromotionBanner() {
//   const { i18n } = useApi();

//   return (
//     <Banner>
//       <BlockStack inlineAlignment="center" >
//         <TextBlock>
//           {i18n.translate("earnPoints")}
//         </TextBlock>
//       </BlockStack>
//     </Banner>
//   );
// }
