import type { RunInput, FunctionRunResult } from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

export function run(input: RunInput): FunctionRunResult {
  const configuration = JSON.parse(input.discountNode.metafield?.value ?? "{}");
  console.log("input.discountNode.metafield?.value", configuration);
  if (!configuration.collections || !configuration.percentage) {
    return EMPTY_DISCOUNT;
  }
  const targets = input.cart.lines
    .filter((line) => {
      if (line.merchandise.__typename === "ProductVariant") {
        const variant = line.merchandise;
        return !variant.product.inAnyCollection;
      } else {
        return false;
      }
    })
    .map((line) => {
      const variant = line.merchandise;
      return {
        productVariant: {
          id: variant.id,
        },
      };
    });
  if (!targets.length) {
    return EMPTY_DISCOUNT;
  }
  console.log("discount metafield targets", targets);
  return {
    discounts: [
      {
        targets,
        value: {
          percentage: {
            value: configuration.percentage.toString(),
          },
        },
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.All,
  };
}

// type Configuration = {};

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.discountNode?.metafield?.value ?? "{}"
//   );
//   return EMPTY_DISCOUNT;
// };
