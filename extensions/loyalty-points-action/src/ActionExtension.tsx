import { useCallback, useEffect, useState } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  Button,
  Text,
  NumberField,
} from "@shopify/ui-extensions-react/admin";
import { updateLoyaltyPoints } from "./utils";

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.customer-segment-details.action.render";

export default reactExtension(TARGET, () => <App />);

function App() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(TARGET);
  console.log({ data });
  const [segmentName, setSegmentName] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const onSubmit = useCallback(async () => {
    await updateLoyaltyPoints(data.selected[0].id, loyaltyPoints);
    close();
  }, [data.selected, loyaltyPoints]);
  useEffect(() => {
    const getSegmentInfo = async () => {
      const getSegmentQuery = {
        query: `
          query Segment($id:ID!) {
            segment(id: $id) {
              name
            }
          }
        `,
        variables: { id: data.selected[0].id },
      };
      const res = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        body: JSON.stringify(getSegmentQuery),
      });
      if (!res.ok) {
        console.error("Network error");
      }
      const segmentData = await res.json();
      console.log("segmentData", segmentData);
      setSegmentName(segmentData.data.segment.name);
    };
    getSegmentInfo();
  }, [data.selected]);

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <AdminAction
      primaryAction={
        <Button onPress={onSubmit}>
          {i18n.translate("done")}
          {/* {i18n.translate("done", { TARGET })} */}
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            console.log("closing");
            close();
          }}
        >
          {i18n.translate("close")}
          {/* {i18n.translate("close", { TARGET })} */}
        </Button>
      }
    >
      <BlockStack gap>
        <Text>
          {i18n.translate("description", {
            segment: segmentName,
          })}
        </Text>
        <NumberField
          inputMode="numeric"
          max={100}
          label={i18n.translate("label")}
          value={loyaltyPoints}
          onChange={setLoyaltyPoints}
        />
      </BlockStack>
    </AdminAction>
  );
}

// function App() {
//   // The useApi hook provides access to several useful APIs like i18n, close, and data.
//   const { i18n, close, data,  } = useApi(TARGET);
//   console.log({ data });
//   const [productTitle, setProductTitle] = useState("");
//   // Use direct API calls to fetch data from Shopify.
//   // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
//   useEffect(() => {
//     (async function getProductInfo() {
//       const getProductQuery = {
//         query: `query Product($id: ID!) {
//           product(id: $id) {
//             title
//           }
//         }`,
//         variables: { id: data.selected[0].id },
//       };

//       const res = await fetch("shopify:admin/api/graphql.json", {
//         method: "POST",
//         body: JSON.stringify(getProductQuery),
//       });

//       if (!res.ok) {
//         console.error("Network error");
//       }

//       const productData = await res.json();
//       setProductTitle(productData.data.product.title);
//     })();
//   }, [data.selected]);
//   return (
//     // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
//     <AdminAction
//       primaryAction={
//         <Button
//           onPress={() => {
//             console.log("saving");
//             close();
//           }}
//         >
//           Done
//         </Button>
//       }
//       secondaryAction={
//         <Button
//           onPress={() => {
//             console.log("closing");
//             close();
//           }}
//         >
//           Close
//         </Button>
//       }
//     >
//       <BlockStack>
//         {/* Set the translation values for each supported language in the locales directory */}
//         <Text fontWeight="bold">{i18n.translate("welcome", { TARGET })}</Text>
//         <Text>Current product: {productTitle}</Text>
//       </BlockStack>
//     </AdminAction>
//   );
// }
