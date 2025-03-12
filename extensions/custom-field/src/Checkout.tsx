import {
  reactExtension,
  BlockStack,
  Checkbox,
  useMetafield,
  useApplyMetafieldsChange,
  useDeliveryGroupListTarget,
  TextField,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.shipping-option-list.render-after",
  () => <App />,
);

const App = () => {
  const [checked, setChecked] = useState(false);
  const metafieldNamespace = "custom_field";
  const metafieldKey = "delivery_instructions";
  const deliveryInstructions = useMetafield({
    namespace: metafieldNamespace,
    key: metafieldKey,
  });
  const applyMetafieldChange = useApplyMetafieldsChange();
  const deliveryGroupList = useDeliveryGroupListTarget();
  const handleChange = () => {
    setChecked(!checked);
  };
  if (!deliveryGroupList || deliveryGroupList.groupType !== "oneTimePurchase") {
    return null;
  }
  return (
    <BlockStack>
      <Checkbox checked={checked} onChange={handleChange}>
        Provide delivery instructions
      </Checkbox>
      {checked && (
        <TextField
          label="Delivery Instructions"
          multiline={3}
          value={(deliveryInstructions?.value as string) || ""}
          onChange={(value) => {
            applyMetafieldChange({
              namespace: metafieldNamespace,
              key: metafieldKey,
              type: "updateMetafield",
              valueType: "string",
              value,
            });
          }}
        />
      )}
    </BlockStack>
  );
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
//       <Banner title="custom-field" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="custom-field">
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
