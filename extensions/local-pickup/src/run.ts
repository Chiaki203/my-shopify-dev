import { RunInput, FunctionRunResult } from "../generated/api";

export function run(input: RunInput): FunctionRunResult {
  const hasBulkyVariant = input.cart.lines.some((line) => {
    if (line.merchandise.__typename === "ProductVariant") {
      return line.merchandise.product.hasAnyTag;
    }
    return false;
  });
  const cost = hasBulkyVariant ? 2.99 : 0.0;
  const pickupInstruction = hasBulkyVariant
    ? "Ready for pickup next business day."
    : "Ready for pickup now!";
  return {
    operations: input.locations.map((location) => ({
      add: {
        title: location.name,
        cost: cost,
        pickupLocation: {
          locationHandle: location.handle,
          pickupInstruction: pickupInstruction,
        },
      },
    })),
  };
}

// type Configuration = {};

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.deliveryOptionGenerator?.metafield?.value ?? "{}"
//   );

//   return {
//     operations: [
//       {
//         add: {
//           title: "Main St.",
//           cost: 1.99,
//           pickupLocation: {
//             locationHandle: "2578303",
//             pickupInstruction: "Usually ready in 24 hours."
//           }
//         }
//       }
//     ],
//   };
// }
