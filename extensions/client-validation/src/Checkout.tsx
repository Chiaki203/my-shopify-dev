import {
  reactExtension,
  TextField,
  useExtensionCapability,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";
// Set the entry point for the extension
export default reactExtension("purchase.checkout.contact.render-after", () => (
  <App />
));

const App = () => {
  const ageTarget = 18;
  const [age, setAge] = useState("");
  const [validationError, setValidationError] = useState("");
  const canBlockProgress = useExtensionCapability("block_progress");
  console.log("canBlockProgress", canBlockProgress);
  const isAgeSet = () => age !== "";
  const isAgeValid = () => Number(age) >= ageTarget;
  const clearValidationErrors = () => setValidationError("");
  const label = canBlockProgress ? "Your age" : "Your age (optional)";
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress && !isAgeSet()) {
      return {
        behavior: "block",
        reason: "Age is required",
        perform: (result) => {
          if (result.behavior === "block") {
            setValidationError("Enter your age");
          }
        },
      };
    }
    if (canBlockProgress && !isAgeValid()) {
      return {
        behavior: "block",
        reason: `Age is less than ${ageTarget}.`,
        errors: [
          {
            message:
              "You're not legally old enough to buy some of the items in your cart.",
          },
        ],
      };
    }
    return {
      behavior: "allow",
      perform: () => {
        clearValidationErrors();
      },
    };
  });
  return (
    <TextField
      label={label}
      type="number"
      value={age}
      onChange={setAge}
      onInput={clearValidationErrors}
      required={canBlockProgress}
      error={validationError}
    />
  );
};

// function App() {
//   console.log("contact render after");
//   // Set the target age that a buyer must be to complete an order
//   const ageTarget = 18;

//   // Set up the app state
//   const [age, setAge] = useState("");
//   const [validationError, setValidationError] = useState("");
//   // Merchants can toggle the `block_progress` capability behavior within the checkout editor
//   const canBlockProgress = useExtensionCapability("block_progress");
//   const label = canBlockProgress ? "Your age" : "Your age (optional)";
//   // Use the `buyerJourney` intercept to conditionally block checkout progress
//   useBuyerJourneyIntercept(({ canBlockProgress }) => {
//     // Validate that the age of the buyer is known, and that they're old enough to complete the purchase
//     if (canBlockProgress && !isAgeSet()) {
//       return {
//         behavior: "block",
//         reason: "Age is required",
//         perform: (result) => {
//           // If progress can be blocked, then set a validation error on the custom field
//           if (result.behavior === "block") {
//             setValidationError("Enter your age");
//           }
//         },
//       };
//     }

//     if (canBlockProgress && !isAgeValid()) {
//       return {
//         behavior: "block",
//         reason: `Age is less than ${ageTarget}.`,
//         errors: [
//           {
//             // Show a validation error on the page
//             message:
//               "You're not legally old enough to buy some of the items in your cart.",
//           },
//         ],
//       };
//     }

//     return {
//       behavior: "allow",
//       perform: () => {
//         // Ensure any errors are hidden
//         clearValidationErrors();
//       },
//     };
//   });
//   function isAgeSet() {
//     return age !== "";
//   }

//   function isAgeValid() {
//     return Number(age) >= ageTarget;
//   }

//   function clearValidationErrors() {
//     setValidationError("");
//   }
//   // Render the extension
//   return (
//     <TextField
//       label={label}
//       type="number"
//       value={age}
//       onChange={setAge}
//       onInput={clearValidationErrors}
//       required={canBlockProgress}
//       error={validationError}
//     />
//   );
// }

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
// export default reactExtension("purchase.checkout.contact.render-after", () => (
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
//       <Banner title="client-validation" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="client-validation">
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
