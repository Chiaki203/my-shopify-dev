import {
  reactExtension,
  useApplyShippingAddressChange,
  // reactExtension,
  // Banner,
  // BlockStack,
  // Checkbox,
  // Text,
  // useApi,
  // useApplyAttributeChange,
  // useInstructions,
  useBuyerJourneyIntercept,
  useShippingAddress,
  // useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { CountryCode } from "@shopify/ui-extensions/checkout";

import {
  splitAddress1,
  splitAddress2,
  concatenateAddress1,
  concatenateAddress2,
} from "@shopify/worldwide";
import { useEffect } from "react";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const address = useShippingAddress();
  const applyShippingAddressChange = useApplyShippingAddressChange();
  console.log("useShippingAddress", address);

  const updatedAddress1 = concatenateAddress1({
    countryCode: "BR",
    streetName: "Av. Paulista",
    streetNumber: "1578",
  });
  const updatedAddress2 = concatenateAddress2({
    countryCode: "BR",
    line2: "aparamento 42",
    neighborhood: "Centro",
  });
  const firstName = address?.firstName;
  useEffect(() => {
    const newAddress = {
      lastName: "Paulo",
      countryCode: "BR" as CountryCode,
      address1: updatedAddress1,
      address2: updatedAddress2,
    };
    if (firstName === "Pedro") {
      applyShippingAddressChange({
        type: "updateShippingAddress",
        address: newAddress,
      });
    }
  }, [firstName, applyShippingAddressChange, updatedAddress1, updatedAddress2]);
  return null;
}

// export default reactExtension(
//   "purchase.checkout.delivery-address.render-before",
//   () => <Extension />,
// );

// function Extension() {
//   const address = useShippingAddress();
//   console.log("useShippingAddress address", address);
//   const countryCode = address?.countryCode;
//   console.log("useShippingAddress countryCode", countryCode);
//   const address1 = address?.address1;
//   console.log("useShippingAddress address1", address1);
//   const address2 = address?.address2;
//   console.log("useShippingAddress address2", address2);
//   const errors = [];
//   useBuyerJourneyIntercept(({ canBlockProgress }) => {
//     if (canBlockProgress && countryCode === "BR") {
//       if (address1) {
//         const additionalFieldsAddress1 = splitAddress1(countryCode, address1);
//         console.log("additionalFieldsAddress1", additionalFieldsAddress1);
//         if (additionalFieldsAddress1) {
//           const { streetNumber } = additionalFieldsAddress1;
//           if (streetNumber && streetNumber === "1001") {
//             errors.push({
//               message: "We don't deliver to street number 1001",
//               target: "$.cart.deliveryGroups[0].deliveryAddress.address1",
//             });
//           }
//         }
//       }
//       if (address2) {
//         const additionalFieldsAddress2 = splitAddress2(countryCode, address2);
//         console.log("additionalFieldsAddress2", additionalFieldsAddress2);
//         if (additionalFieldsAddress2) {
//           const { neighborhood } = additionalFieldsAddress2;
//           if (neighborhood && neighborhood === "Vila Olimpia") {
//             errors.push({
//               message: "We don't deliver to Vila Olimpia",
//               target: "$.cart.deliveryGroups[0].deliveryAddress.address2",
//             });
//           }
//         }
//       }
//       if (errors.length > 0) {
//         return {
//           behavior: "block",
//           reason: "Invalid shipping address",
//           errors,
//         };
//       }
//     }
//     return {
//       behavior: "allow",
//     };
//   });
//   return null;
// }

// 1. Choose an extension target

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
//       <Banner title="additional address" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="additional address">
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

// "resourceId": "gid://shopify/Product/15021924614493",
// "translatableContent": [
//   {
//     "digest": "cf50feb5c877d74ff8deff42d7447cbcd5229691e374b713b2a41f81efdf328b",
//     "key": "title",
//     "locale": "en",
//     "type": "SINGLE_LINE_TEXT_FIELD",
//     "value": "The Complete Snowboard"
//   },
//   {
//     "digest": "9c1f5299f9c4610a2bf475a82f7a08216253ea7e026e04da08771999ee96212c",
//     "key": "body_html",
//     "locale": "en",
//     "type": "HTML",
//     "value": "This <b>PREMIUM</b> <i>snowboard</i> is so <b>SUPER</b><i>DUPER</i> awesome!"
//   },
//   {
