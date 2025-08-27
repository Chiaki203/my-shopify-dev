import {
  Banner,
  reactExtension,
  Text,
  useApi,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const { i18n } = useApi();
  const translate = useTranslate();
  const balance = 9.99;
  const formattedBalance = i18n.formatCurrency(balance);
  const balanceRemainingMsg = translate("balanceRemaining", {
    formattedBalance,
  });
  const points = 10000;
  const formattedPoints = i18n.formatNumber(points);
  const loyaltyPointMsg = translate("loyaltyPoints", {
    count: points,
    formattedPoints,
  });
  return (
    <Banner title={loyaltyPointMsg}>
      <Text>{balanceRemainingMsg}</Text>
    </Banner>
  );
}

// import {
//   reactExtension,
//   Banner,
//   BlockStack,
//   Checkbox,
//   Text,
//   useApi,
//   useApplyAttributeChange,
//   useInstructions,
//   useTranslate,
// } from "@shopify/ui-extensions-react/checkout";

// // 1. Choose an extension target
// export default reactExtension("purchase.checkout.block.render", () => (
//   <Extension />
// ));

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
//       <Banner title="localize-checkout" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="localize-checkout">
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
