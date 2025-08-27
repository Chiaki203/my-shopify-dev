import type {
  RunInput,
  FunctionRunResult,
  CartOperation,
} from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  console.log("presentmentCurrencyRate", input.presentmentCurrencyRate);
  const operations = input.cart.lines.reduce(
    (acc: CartOperation[], cartLine) => {
      const expandOperation = optionallyBuildExpandOperation(
        cartLine,
        input.presentmentCurrencyRate,
      );
      if (expandOperation) {
        return [...acc, { expand: expandOperation }];
      }
      return acc;
    },
    [],
  );
  return operations.length > 0 ? { operations } : NO_CHANGES;
}

function optionallyBuildExpandOperation(
  { id: cartLineId, merchandise },
  presentmentCurrencyRate,
) {
  if (
    merchandise.__typename === "ProductVariant" &&
    merchandise.bundledComponentData
  ) {
    const bundleData = JSON.parse(merchandise.bundledComponentData.value);
    if (bundleData.length === 0) {
      throw new Error("Invalid bundle composition");
    }
    const expandedCartItems = bundleData.map((component) => {
      console.log("component.price", component.price);
      console.log(
        "fixedPricePerUnit",
        (component.price * presentmentCurrencyRate).toFixed(2),
      );
      return {
        merchandiseId: component.id,
        quantity: component.quantity || 1,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: (component.price * presentmentCurrencyRate).toFixed(2),
            },
          },
        },
      };
    });
    if (expandedCartItems.length > 0) {
      return { cartLineId, expandedCartItems };
    }
  }
  console.log("No expand operation for cartLineId", cartLineId);
  return null;
}

// export function run(input: RunInput): FunctionRunResult {
//   const operations = input.cart.lines.reduce(
//     (acc: CartOperation[], cartLine) => {
//       const expandOperation = optionallyBuildExpandOperation(cartLine);
//       if (expandOperation) {
//         return [...acc, { expand: expandOperation }];
//       }
//       return acc;
//     },
//     [],
//   );
//   console.log("cart expand operations", operations);
//   return operations.length > 0 ? { operations } : NO_CHANGES;
// }

// function optionallyBuildExpandOperation({ id: cartLineId, merchandise }) {
//   const hasExpandMetafields =
//     !!merchandise.componentReferences && !!merchandise.componentQuantities;
//   if (merchandise.__typename === "ProductVariant" && hasExpandMetafields) {
//     const componentReferences = JSON.parse(
//       merchandise.componentReferences.value,
//     );
//     const componentQuantities = JSON.parse(
//       merchandise.componentQuantities.value,
//     );
//     if (
//       componentReferences.length !== componentQuantities.length ||
//       componentReferences.length === 0
//     ) {
//       throw new Error("Invalid bundle composition");
//     }
//     const expandedCartItems = componentReferences.map(
//       (merchandiseId, index) => ({
//         merchandiseId: merchandiseId,
//         quantity: componentQuantities[index],
//       }),
//     );
//     if (expandedCartItems.length > 0) {
//       return {
//         cartLineId,
//         expandedCartItems,
//         price: {
//           percentageDecrease: { value: 10 },
//         },
//       };
//     }
//   }
//   return null;
// }

// "linkedMetafield": {
//         "namespace": "shopify",
//         "key": "color-pattern",
//         "values": [
//           "gid://shopify/Metaobject/335602712925",
//           "gid://shopify/Metaobject/335575646557",
//           "gid://shopify/Metaobject/335577219421",
//           "gid://shopify/Metaobject/335577481565",
//           "gid://shopify/Metaobject/315195392349"
//         ]
//       }

// "productsAdded": [
//     {
//       "childProductId": "gid://shopify/Product/15231525749085",
//       "selectedParentOptionValues": {
//         "name": "Color",
//         "value": "Yellow",
//         "linkedMetafieldValue": "gid://shopify/Metaobject/335602712925"
//       }
//     }
//   ],

// "linkedMetafield": {
//         "namespace": "shopify",
//         "key": "color-pattern",
//         "values": "[\"gid://shopify/Metaobject/335602712925\", \"gid://shopify/Metaobject/335575646557\", \"gid://shopify/Metaobject/335577219421\", \"gid://shopify/Metaobject/335577481565\", \"gid://shopify/Metaobject/315195392349\"]"
//       }

// [
//   {
//     "id": "gid://shopify/ProductVariant/56795327463773",
//     "component_reference": {
//       "value": [
//         "gid://shopify/ProductVariant/56795348664669",
//         "gid://shopify/ProductVariant/56795360395613"
//       ]
//     },
//     "component_quantities": {
//       "value": [
//         1,
//         1
//       ]
//     }
//   }
// ]

// [
//   {
//     "id": "",
//     "quantity": 1,
//     "price": 7.99
//   }
// ]
