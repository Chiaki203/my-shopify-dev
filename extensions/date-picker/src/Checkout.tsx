import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useApplyMetafieldsChange,
  useDeliveryGroupListTarget,
  Heading,
  DatePicker,
} from "@shopify/ui-extensions-react/checkout";
// import { title } from "process";
import { useCallback, useMemo, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.shipping-option-list.render-after",
  () => <Extension />,
);

const Extension = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [yesterday, setYesterday] = useState("");
  const checkOutApi = useApi();
  console.log("checkOut useApi", checkOutApi);
  const { extension } = checkOutApi;
  const { target } = extension;
  console.log("date picker target", target);
  const applyMetafieldsChange = useApplyMetafieldsChange();
  const deliveryGroupList = useDeliveryGroupListTarget();
  console.log("deliveryGroupList", deliveryGroupList);
  const metafieldNamespace = "app_custom";
  const metafieldKey = "delivery_schedule";
  useMemo(() => {
    const today = new Date();
    console.log("today", today);
    const yesterday = new Date(today);
    console.log("yesterday", yesterday);
    yesterday.setDate(today.getDate() - 1);
    console.log("yesterday.setDate", yesterday);
    const tomorrow = new Date(today);
    console.log("tomorrow", tomorrow);
    tomorrow.setDate(today.getDate() + 1);
    console.log("tomorrow.setDate", tomorrow);
    const deliveryDate = today.getDay() === 0 ? tomorrow : today;
    setSelectedDate(formatDate(deliveryDate));
    setYesterday(formatDate(yesterday));
    console.log("selectedDate", selectedDate);
    console.log("yesterday", yesterday);
  }, []);
  const handleChangeDate = useCallback((selectedDate: string) => {
    setSelectedDate(selectedDate);
    applyMetafieldsChange({
      type: "updateMetafield",
      namespace: metafieldNamespace,
      key: metafieldKey,
      valueType: "string",
      value: selectedDate,
    });
  }, []);
  if (!deliveryGroupList || deliveryGroupList.groupType !== "oneTimePurchase") {
    return null;
  }
  const { deliveryGroups } = deliveryGroupList;
  console.log("deliveryGroups", deliveryGroups);
  const isExpressSelected = () => {
    const expressHandles = new Set(
      deliveryGroups
        .map(
          ({ deliveryOptions }) =>
            deliveryOptions.find(({ title }) => title === "Express").handle,
        )
        .filter(Boolean),
    );
    return deliveryGroups.some(({ selectedDeliveryOption }) =>
      expressHandles.has(selectedDeliveryOption?.handle),
    );
  };
  return isExpressSelected() ? (
    <>
      <Heading>Select a date for delivery</Heading>
      <DatePicker
        selected={selectedDate}
        onChange={handleChangeDate}
        disabled={["Sunday", { end: yesterday }]}
      />
    </>
  ) : null;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
//       <Banner title="date-picker" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="date-picker">
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
