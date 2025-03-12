import {
  reactExtension,
  // Banner,
  // BlockStack,
  // Checkbox,
  Text,
  // useApi,
  // useApplyAttributeChange,
  // useInstructions,
  // useTranslate,
  useAppMetafields,
  useCartLineTarget,
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

const Extension = () => {
  const wateringMetafields = useAppMetafields({
    type: "product",
    namespace: "instructions",
    key: "watering",
  });
  // console.log("wateringMetafields", wateringMetafields);
  const cartLineTarget = useCartLineTarget();
  const [wateringInstructions, setWateringInstructions] = useState("");
  useEffect(() => {
    const productId = cartLineTarget?.merchandise?.product?.id;
    if (!productId) return;
    const wateringMetafield = wateringMetafields.find(
      ({ target }) => `gid://shopify/Product/${target.id}` === productId,
    );
    // console.log("wateringMetafield", wateringMetafield);
    if (typeof wateringMetafield?.metafield?.value === "string") {
      setWateringInstructions(wateringMetafield.metafield.value);
    }
  }, [cartLineTarget, wateringMetafields]);
  if (wateringInstructions) {
    return <Text>{wateringInstructions}</Text>;
  }
  return <Text>Water</Text>;
};

// function Extension() {
//   const translate = useTranslate();
//   const { extension } = useApi();
//   const instructions = useInstructions();
//   const applyAttributeChange = useApplyAttributeChange();

//   // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
//   if (!instructions.attributes.canUpdateAttributes) {
//     // For checkouts such as draft order invoices, cart attributes may not be allowed
//     // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
//     return (
//       <Banner title="checkout-ui" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="checkout-ui">
//         {translate("welcome", {
//           target: <Text emphasis="italic">{extension.target}</Text>,
//         })}
//       </Banner>
//       <Checkbox onChange={onCheckboxChange}>
//         {translate("iWouldLikeAFreeGiftWithMyOrder")}
//       </Checkbox>
//     </BlockStack>
//   );

//   async function onCheckboxChange(isChecked) {
//     // 4. Call the API to modify checkout
//     const result = await applyAttributeChange({
//       key: "requestedFreeGift",
//       type: "updateAttribute",
//       value: isChecked ? "yes" : "no",
//     });
//     console.log("applyAttributeChange result", result);
//   }
// }
