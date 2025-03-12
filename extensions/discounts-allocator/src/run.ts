import type {
  RunInput,
  FunctionRunResult,
  DisplayableError,
} from "../generated/api";

import { Decimal } from "decimal.js";

const TOTAL_DISCOUNTS_CAP_REACHED =
  "Maximum discount limit reached for this cart";
const SINGLE_DISCOUNT_CAP_REACHED =
  "Maximum discount limit reached for this item";

function getTargetLineIndex(target) {
  console.log("target.cartLineId", target.cartLineId);
  return parseInt(target.cartLineId.slice(-1));
}

function calculateCurrentTargetPrice(inputCartLines, target) {
  const targetLineIndex = getTargetLineIndex(target);
  console.log("targetLineIndex", targetLineIndex);
  console.log("target.quantity", target.quantity);
  const targetLine = inputCartLines[targetLineIndex];
  console.log("targetLine", targetLine);
  console.log(
    "targetLine.merchandise.title",
    targetLine.merchandise.product.title,
  );
  console.log(
    "targetLine.cost.amountPerQuantity.amount",
    targetLine.cost.amountPerQuantity.amount,
  );
  console.log(
    "targetLine.cost.subtotalAmount.amount",
    targetLine.cost.subtotalAmount.amount,
  );
  console.log(
    "targetLine.cost.totalAmount.amount",
    targetLine.cost.totalAmount.amount,
  );

  return targetLine.cost.amountPerQuantity.amount * target.quantity;
}

type TargetAllocation = {
  discountProposalId: string;
  amount: Decimal;
};

export function run(input: RunInput): FunctionRunResult {
  let totalDiscountCap = parseFloat(input.shop.metafield?.value ?? "-1");
  let totalDiscount = 0.0;

  let allLinesOutputDiscounts = input.cart.lines.map((line) => ({
    cartLineId: line.id,
    quantity: line.quantity,
    allocations: [] as TargetAllocation[],
  }));
  let displayableErrors: DisplayableError[] = [];
  if (!input.discounts || input.discounts?.length === 0) {
    return {
      lineDiscounts: [],
      displayableErrors: [],
    };
  }
  for (const discount of input.discounts) {
    let currentDiscountCap = parseFloat(discount.metafield?.value ?? "-1");
    let currentDiscountTotal = 0.0;
    console.log("discount id", discount.id);
    for (const proposal of discount.discountProposals) {
      console.log("proposal targets", proposal.targets);
      const totalTargetsPrice = proposal.targets.reduce((total, target) => {
        return total + calculateCurrentTargetPrice(input.cart.lines, target);
      }, 0);
      console.log("totalTargetsPrice", totalTargetsPrice);
      for (const target of proposal.targets) {
        const currentTargetPrice = calculateCurrentTargetPrice(
          input.cart.lines,
          target,
        );
        console.log("currentTargetPrice", currentTargetPrice);
        const currentTargetRatio = currentTargetPrice / totalTargetsPrice;
        console.log("currentTargetRatio", currentTargetRatio);
        let lineDiscountAmount = 0.0;
        if (proposal.value.__typename === "FixedAmount") {
          if (proposal.value.appliesToEachItem) {
            lineDiscountAmount = proposal.value.amount * target.quantity;
            console.log("appliesToEachItem");
          } else {
            lineDiscountAmount = proposal.value.amount * currentTargetRatio;
            console.log("across all items");
          }
        } else if (proposal.value.__typename === "Percentage") {
          lineDiscountAmount =
            (proposal.value.value / 100.0) *
            totalTargetsPrice *
            currentTargetRatio;
        }
        console.log("lineDiscountAmount", lineDiscountAmount);

        if (
          currentDiscountCap >= 0.0 &&
          currentDiscountTotal + lineDiscountAmount > currentDiscountCap
        ) {
          lineDiscountAmount = currentDiscountCap - currentDiscountTotal;
          console.log(
            "reduced lineDiscountAmount (currentDiscountCap)",
            lineDiscountAmount,
          );

          displayableErrors.push({
            discountId: discount.id.toString(),
            reason: SINGLE_DISCOUNT_CAP_REACHED,
          });
        }
        if (
          totalDiscountCap >= 0.0 &&
          totalDiscount + lineDiscountAmount > totalDiscountCap
        ) {
          lineDiscountAmount = totalDiscountCap - totalDiscount;
          console.log(
            "reduced lineDiscountAmount (totalDiscountCap) ",
            lineDiscountAmount,
          );

          displayableErrors.push({
            discountId: discount.id.toString(),
            reason: TOTAL_DISCOUNTS_CAP_REACHED,
          });
        }
        if (lineDiscountAmount === 0.0) {
          continue;
        }
        totalDiscount += lineDiscountAmount;
        currentDiscountTotal += lineDiscountAmount;
        console.log("currentDiscountTotal", currentDiscountTotal);
        console.log("totalDiscount", totalDiscount);
        const targetLineIndex = getTargetLineIndex(target);
        const targetAllocation = {
          discountProposalId: proposal.handle,
          amount: new Decimal(lineDiscountAmount),
        };
        console.log("targetAllocation", targetAllocation);
        allLinesOutputDiscounts[targetLineIndex].allocations.push(
          targetAllocation,
        );
      }
    }
  }
  const lineDiscounts = allLinesOutputDiscounts.filter(
    (outputDiscount) => outputDiscount.allocations.length > 0,
  );
  console.log("lineDiscounts", lineDiscounts);
  const output = {
    lineDiscounts,
    displayableErrors,
  };
  return output;
}

// const EMPTY_RESULT: FunctionRunResult = {
//   displayableErrors: [],
//   lineDiscounts: [],
// };

// export function run(input: RunInput): FunctionRunResult {
//   return EMPTY_RESULT
// }
