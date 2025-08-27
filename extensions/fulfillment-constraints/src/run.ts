import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const deliverableLineIds: string[] = [];
  console.log("input.cart.deliverableLines", input.cart.deliverableLines);
  for (const deliverableLine of input.cart.deliverableLines) {
    if (
      deliverableLine.merchandise.__typename === "ProductVariant" &&
      deliverableLine.merchandise.product.hasAnyTag
    ) {
      deliverableLineIds.push(deliverableLine.id);
    }
  }
  console.log("deliverableLineIds", deliverableLineIds);
  if (deliverableLineIds.length < 3) {
    return NO_CHANGES;
  }
  const japanLocation = input.locations.find(
    (location) => location.name === "Japan Warehouse",
  );
  if (japanLocation === undefined) {
    return NO_CHANGES;
  }
  let operations = [
    {
      mustFulfillFrom: {
        deliverableLineIds: deliverableLineIds,
        locationIds: [japanLocation.id],
      },
    },
  ];
  return { operations: operations };
}

// type Configuration = {};

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.fulfillmentConstraintRule?.metafield?.value ?? "{}"
//   );
//   return NO_CHANGES;
// };
