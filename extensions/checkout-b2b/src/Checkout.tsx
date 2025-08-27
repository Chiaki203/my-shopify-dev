import {
  Banner,
  reactExtension,
  useAppMetafields,
  useCheckoutSettings,
  useCustomer,
  usePurchasingCompany,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const metafields = useAppMetafields();
  const isHighValueClient = metafields.some(
    (entry) =>
      entry.target.type === "company" &&
      entry.metafield.key === "high_value" &&
      entry.metafield.value === "true",
  );
  console.log("app metafields", metafields);
  const customer = useCustomer();
  const checkoutSettings = useCheckoutSettings();
  const purchasingCompany = usePurchasingCompany();
  console.log("customer", customer);
  console.log("purchasingCompany", purchasingCompany);
  console.log("checkoutSettings", checkoutSettings);
  if (!purchasingCompany) return null;
  if (checkoutSettings.orderSubmission === "ORDER") return null;
  if (checkoutSettings.orderSubmission === "DRAFT_ORDER") {
    const message = isHighValueClient
      ? `${customer.firstName}, even during the holidays we will serve ${purchasingCompany.company.name} promptly, expect the usual turnaround time of 2-3 business days.`
      : `Sorry ${customer.firstName}, there will be delays in draft order reviews during this holiday season. Expect a turnaround time of 5-10 business days.`;
    const status = isHighValueClient ? "info" : "warning";
    return (
      <Banner status={status} title="Holiday impacts on draft orders">
        {message}
      </Banner>
    );
  }
  return null;
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
//       <Banner title="checkout-b2b" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="checkout-b2b">
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
