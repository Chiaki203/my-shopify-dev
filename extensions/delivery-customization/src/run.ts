import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES = {
  operations: [],
};

export const run = (input: RunInput) => {
  const configuration = JSON.parse(
    input?.deliveryCustomization?.metafield?.value ?? "{}",
  );
  if (!configuration.countryCode || !configuration.message) {
    return NO_CHANGES;
  }
  console.log("input cart deliveryGroups", input.cart.deliveryGroups);
  // const message = "Maybe delayed due to weather conditions";
  let toRename = input.cart.deliveryGroups
    .filter(
      (group) =>
        group.deliveryAddress?.countryCode &&
        group.deliveryAddress?.countryCode === configuration.countryCode,
    )
    .flatMap((group) => group.deliveryOptions)
    .map((option) => ({
      rename: {
        deliveryOptionHandle: option.handle,
        title: option.title
          ? `${option.title} - ${configuration.message}`
          : configuration.message,
      },
    }));
  console.log(
    "toRename",
    toRename.map((op) => op.rename.title),
  );
  return {
    operations: toRename,
  };
};

// const NO_CHANGES: FunctionRunResult = {
//   operations: [],
// };

// type Configuration = {};

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.deliveryCustomization?.metafield?.value ?? "{}"
//   );
//   return NO_CHANGES;
// };
