import type { RunInput, FunctionRunResult } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

export function run(input: RunInput): FunctionRunResult {
  const rate = parseFloat(input.presentmentCurrencyRate);
  console.log("payment methods", input.paymentMethods);
  for (const paymentMethod of input.paymentMethods) {
    console.log("payment method", paymentMethod.name);
  }
  console.log("currency rate", rate);
  const configuration = JSON.parse(
    input.paymentCustomization.metafield?.value ?? "{}",
  );
  console.log("configuration cartTotal", configuration.cartTotal);
  console.log(
    "configuration paymentMethodName",
    configuration.paymentMethodName,
  );
  if (!configuration.paymentMethodName || !configuration.cartTotal) {
    return NO_CHANGES;
  }
  const cartTotal =
    parseFloat(input.cart.cost.totalAmount.amount ?? "0.0") * rate;
  if (cartTotal < configuration.cartTotal * rate) {
    console.log(
      "Cart total is not high enough, no need to hide the payment method.",
    );
    return NO_CHANGES;
  }
  const hidePaymentMethod = input.paymentMethods.find((method) =>
    method.name.includes(configuration.paymentMethodName),
  );
  if (!hidePaymentMethod) {
    return NO_CHANGES;
  }
  return {
    operations: [
      {
        hide: {
          paymentMethodId: hidePaymentMethod.id,
        },
      },
    ],
  };
}

// type Configuration = {};

// export function run(input: RunInput): FunctionRunResult {
//   const configuration: Configuration = JSON.parse(
//     input?.paymentCustomization?.metafield?.value ?? "{}"
//   );
//   return NO_CHANGES;
// };
