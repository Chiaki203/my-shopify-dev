import type { RunInput, FunctionRunResult } from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

// type Configuration = {};

type Line = {
  id: string;
  quantity: number;
};

export function run(input: RunInput): FunctionRunResult {
  const configuration = JSON.parse(input.discountNode.metafield?.value ?? "{}");
  console.log("volume discount configuration: ", configuration);
  if (!configuration.quantity || !configuration.percentage) {
    console.log("Invalid volume discount configuration.");
    return EMPTY_DISCOUNT;
  }
  const targets = input.cart.lines
    .filter((line: Line) => line.quantity >= configuration.quantity)
    .map((line: Line) => ({
      cartLine: {
        id: line.id,
      },
    }));
  if (!targets.length) {
    console.log("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }
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

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.discountNode?.metafield?.value ?? "{}"
//   );
//   return EMPTY_DISCOUNT;
// };
