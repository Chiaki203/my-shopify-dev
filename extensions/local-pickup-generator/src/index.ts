import { InputQuery, FunctionResult } from "../generated/api";

export default (input: InputQuery): FunctionResult => {
  const hasBulkyVariant = input.cart.lines.some((line) => {
    switch (line.merchandise.__typename) {
      case "ProductVariant":
        return line.merchandise.product.hasAnyTag;
      case "CustomProduct":
        return false;
      default:
        return false;
    }
  });
  let cost: number;
  let pickupInstruction: string;
  if (hasBulkyVariant) {
    cost = 2.99;
    pickupInstruction = "Ready for pickup next business day.";
  } else {
    cost = 0.0;
    pickupInstruction = "Ready for pickup now!";
  }
  console.log("location id", input.locations[0].id);
  console.log("location handle", input.locations[0].handle);
  console.log("location name", input.locations[0].name);
  const operations = input.locations.map((location) => ({
    add: {
      title: location.name,
      cost: cost,
      pickupLocation: {
        locationHandle: location.handle,
        pickupInstruction: pickupInstruction,
      },
    },
  }));
  return { operations };
};

// const DELIVERY_OPTION: FunctionResult = {
//   operations: [
//     {
//       add: {
//         title: "Main St.",
//         cost: 1.99,
//         pickupLocation: {
//           locationHandle: "2578303",
//           pickupInstruction: "Usually ready in 24 hours."
//         }
//       }
//     }
//   ],
// };

// type Configuration = {};

// export default (input: InputQuery): FunctionResult => {
//   const configuration: Configuration = JSON.parse(
//     input?.deliveryOptionGenerator?.metafield?.value ?? "{}"
//   );
//   return DELIVERY_OPTION;
// };
