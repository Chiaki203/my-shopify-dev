import type {
  RunInput,
  FunctionRunResult,
  FunctionError,
} from "../generated/api";

export function run({ cart, validation }: RunInput): FunctionRunResult {
  const configuration = JSON.parse(validation.metafield?.value ?? "{}");
  console.log("checkout function configuration:", configuration);
  // console.log("cart lines", cart.lines);
  const errors: FunctionError[] = [];
  for (const { quantity, merchandise } of cart.lines) {
    if ("id" in merchandise) {
      const limit = configuration[merchandise.id] ?? Infinity;
      const title = merchandise.product.title || "Unknown product";
      if (quantity > limit) {
        errors.push({
          localizedMessage: `Orders are limited to a maximum of ${limit} of ${title}`,
          target: "cart",
        });
      }
    }
  }
  return { errors };
}

// export function run(input: RunInput): FunctionRunResult {
//   const errors: FunctionError[] = input.cart.lines
//     .filter(({ quantity }) => quantity > 1)
//     .map(() => ({
//       localizedMessage: "Not possible to order more than one of each",
//       target: "$.cart",
//     }));

//   return {
//     errors
//   }
// };
