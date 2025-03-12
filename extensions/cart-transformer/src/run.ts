import type {
  RunInput,
  FunctionRunResult,
  CartOperation,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const operations = input.cart.lines.reduce(
    (acc: CartOperation[], cartLine) => {
      const expandOperation = optionallyBuildExpandOperation(cartLine);
      if (expandOperation) {
        return [...acc, { expand: expandOperation }];
      }
      return acc;
    },
    [],
  );
  return operations.length > 0 ? { operations } : NO_CHANGES;
}

function optionallyBuildExpandOperation({ id: cartLineId, merchandise }) {
  const hasExpandMetafields =
    !!merchandise.componentReferences && !!merchandise.componentQuantities;
  if (merchandise.__typename === "ProductVariant" && hasExpandMetafields) {
    const componentReferences = JSON.parse(
      merchandise.componentReferences.value,
    );
    const componentQuantities = JSON.parse(
      merchandise.componentQuantities.value,
    );
    if (
      componentReferences.length !== componentQuantities.length ||
      componentReferences.length === 0
    ) {
      throw new Error("Invalid bundle composition");
    }
    const expandedCartItems = componentReferences.map(
      (merchandiseId, index) => ({
        merchandiseId: merchandiseId,
        quantity: componentQuantities[index],
      }),
    );
    if (expandedCartItems.length > 0) {
      return {
        cartLineId,
        expandedCartItems,
        price: {
          percentageDecrease: { value: 10 },
        },
      };
    }
  }
  return null;
}
