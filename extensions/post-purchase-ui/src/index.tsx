/**
 * Extend Shopify Checkout with a custom Post Purchase user experience.
 * This template provides two extension points:
 *
 *  1. ShouldRender - Called first, during the checkout process, when the
 *     payment page loads.
 *  2. Render - If requested by `ShouldRender`, will be rendered after checkout
 *     completes
 */
import React, { useEffect, useState } from "react";

import {
  extend,
  render,
  BlockStack,
  Button,
  CalloutBanner,
  Heading,
  Image,
  Layout,
  Text,
  TextBlock,
  TextContainer,
  View,
  useExtensionInput,
  PostPurchaseRenderApi,
  Separator,
  Tiles,
  BuyerConsent,
  Select,
} from "@shopify/post-purchase-ui-extensions-react";
import { get } from "http";
// import {CalculatedPurchase} from '@shopify/post-purchase-ui-extensions/src/extension-points/api/post-purchase/post-purchase'

const APP_URL = "https://rubber-nh-conventional-clay.trycloudflare.com";

extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({ inputData, storage }) => {
    console.log("Checkout::PostPurchase::ShouldRender inputData", inputData);
    console.log("Checkout::PostPurchase::ShouldRender storage", storage);
    const postPurchaseOffer = await fetch(`${APP_URL}/api/offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
      }),
    }).then((response) => response.json());
    console.log("postPurchaseOffer", postPurchaseOffer);
    await storage.update(postPurchaseOffer);
    return { render: true };
  },
);

render("Checkout::PostPurchase::Render", () => <App />);

export function App() {
  const { storage, inputData, calculateChangeset, applyChangeset, done } =
    useExtensionInput<"Checkout::PostPurchase::Render">();
  const [loading, setLoading] = useState(true);
  const [calculatedPurchase, setCalculatedPurchase] = useState<any>();
  const [buyerConsent, setBuyerConsent] = useState(false);
  const [buyerConsentError, setBuyerConsentError] = useState("");
  const [selectedPurchaseOption, setSelectedPurchaseOption] = useState(0);
  const { offers } = storage.initialData as any;
  const purchaseOptions = offers;
  const purchaseOption = purchaseOptions[selectedPurchaseOption];
  useEffect(() => {
    async function calculatePurchase() {
      const result = await calculateChangeset({
        changes: purchaseOption.changes,
      });
      console.log("calculatePurchase, result", result);
      console.log(
        "calculatePurchase, result calculatePurchase ",
        result.calculatedPurchase,
      );
      setCalculatedPurchase(result.calculatedPurchase);
      setLoading(false);
    }
    calculatePurchase();
  }, [purchaseOption.changes, calculateChangeset]);
  const shipping =
    calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney
      ?.amount;
  console.log("shipping calculated", shipping);
  const taxes =
    calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
  console.log("taxes calculated", taxes);
  const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
  console.log("total calculated", total);
  const discountedPrice =
    calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney
      .amount;
  console.log("discountedPrice calculated", discountedPrice);
  const originalPrice =
    calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;
  console.log("originalPrice calculated", originalPrice);
  async function acceptOffer() {
    setLoading(true);
    console.log("acceptOffer inputData", inputData);
    const token = await fetch(`${APP_URL}/api/sign-changeset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: purchaseOption.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => data.token)
      .catch((error) => console.log("token fetch Error:", error));
    console.log("acceptOffer token", token);
    const applyChangesetResult = await applyChangeset(token, {
      buyerConsentToSubscriptions: buyerConsent,
    });
    console.log("applyChangesetResult", applyChangesetResult);
    if (
      applyChangesetResult.errors.find(
        (error) => error.code === "buyer_consent_required",
      )
    ) {
      setBuyerConsentError("You need to accept the subscription policy");
      setLoading(false);
    } else {
      console.log("done");
      setLoading(false);

      // done();
    }
  }
  function declineOffer() {
    setLoading(true);
    done();
  }
  return (
    <BlockStack spacing="loose">
      <CalloutBanner>
        <BlockStack spacing="xtight">
          <TextContainer>
            <Text size="medium" emphasized>
              It&#39;s not too late to add this to your order
            </Text>
          </TextContainer>
          <TextContainer>
            <Text size="medium">
              Add the {purchaseOption.productTitle} to your order and get{" "}
            </Text>
            <Text size="medium" emphasized>
              {purchaseOption.changes[0].discount.title}
            </Text>
          </TextContainer>
        </BlockStack>
      </CalloutBanner>
      <Layout
        media={[
          { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
          { viewportSize: "medium", sizes: [532, 0, 1], maxInlineSize: 420 },
          { viewportSize: "large", sizes: [560, 38, 340] },
        ]}
      >
        <Image
          description="product photo"
          source={purchaseOption.productImageURL}
        />
        <BlockStack />
        <BlockStack>
          <BlockStack>
            <Heading>{purchaseOption.productTitle}</Heading>
            <PriceHeader
              discountedPrice={discountedPrice}
              originalPrice={originalPrice}
              // loading={!calculatedPurchase}
            />
            <ProductDescription textLines={purchaseOption.productDescription} />
          </BlockStack>
          {purchaseOptions.length > 1 && (
            <Select
              label="Puechase options"
              onChange={(value) =>
                setSelectedPurchaseOption(parseInt(value, 10))
              }
              value={selectedPurchaseOption.toString()}
              options={purchaseOptions.map((option: any, index: number) => ({
                label: option.title,
                value: index.toString(),
              }))}
            />
          )}
          {purchaseOption.changes[0].type === "add_subscription" && (
            <BlockStack spacing="xtight">
              <TextBlock subdued size="small">
                Delivery{" "}
                {getBillingInterval(purchaseOption.sellingPlanInterval)}, save{" "}
                {purchaseOption.changes[0].discount.value}%
              </TextBlock>
              <TextBlock subdued size="small">
                Auto-renews, skip or cancel anytime
              </TextBlock>
            </BlockStack>
          )}
          <BlockStack spacing="tight">
            <Separator />
            <MoneyLine
              label="Subtotal"
              amount={discountedPrice}
              loading={!calculatedPurchase}
            />
            <MoneyLine
              label="Shipping"
              amount={shipping}
              loading={!calculatedPurchase}
            />
            <MoneyLine
              label="Taxes"
              amount={taxes}
              loading={!calculatedPurchase}
            />
            <Separator />
            <BlockStack spacing="tight">
              <MoneySummary label="Total" amount={total} />
              {purchaseOption.sellingPlanInterval && (
                <RecurringSummary
                  label="Reccuring subtotal"
                  amount={discountedPrice}
                  interval={purchaseOption.sellingPlanInterval}
                />
              )}
            </BlockStack>
          </BlockStack>
          {purchaseOption.changes[0].type === "add_subscription" && (
            <BuyerConsent
              policy="subscriptions"
              checked={buyerConsent}
              onChange={setBuyerConsent}
              error={buyerConsentError}
            />
          )}
          <BlockStack>
            <Button onPress={acceptOffer} submit loading={loading}>
              Pay now · {formatCurrency(total)}
            </Button>
            <Button onPress={declineOffer} loading={loading} subdued>
              Decline this offer
            </Button>
          </BlockStack>
        </BlockStack>
      </Layout>
    </BlockStack>
  );
}

function PriceHeader({ discountedPrice, originalPrice }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text role="deletion" size="large">
        {formatCurrency(originalPrice)}
      </Text>
      <Text emphasized size="large" appearance="critical">
        {" "}
        {formatCurrency(discountedPrice)}
      </Text>
    </TextContainer>
  );
}

function ProductDescription({ textLines }) {
  return (
    <BlockStack spacing="xtight">
      {textLines.map((text, index) => (
        <TextBlock key={index} subdued>
          {text}
        </TextBlock>
      ))}
    </BlockStack>
  );
}

function MoneyLine({ label, amount, loading = false }) {
  return (
    <Tiles>
      <TextBlock size="small">{label}</TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock size="small" emphasized>
          {loading ? "-" : formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function MoneySummary({ label, amount }) {
  return (
    <Tiles>
      <TextBlock size="medium" emphasized>
        {label}
      </TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock size="medium" emphasized>
          {formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function formatCurrency(amount) {
  if (!amount || parseInt(amount, 10) === 0) {
    return "Free";
  }
  return `€${amount}`;
}

function getBillingInterval(interval: string) {
  switch (interval) {
    case "DAY":
      return "every day";
    case "WEEK":
      return "every week";
    case "MONTH":
      return "every month";
    case "YEAR":
      return "every year";
  }
}

function RecurringSummary({ label, amount, interval }) {
  return (
    <BlockStack spacing="xtight">
      <Tiles>
        <TextBlock size="small">{label}</TextBlock>
        <TextContainer alignment="trailing">
          <TextBlock size="small" subdued>
            {formatCurrency(amount)} {getBillingInterval(interval)}
          </TextBlock>
        </TextContainer>
      </Tiles>
      <TextBlock size="small" subdued>
        Does&apos;t include shipping, tax, duties, or any applicable discounts,
        sorry.
      </TextBlock>
    </BlockStack>
  );
}

/**
 * Entry point for the `ShouldRender` Extension Point.
 *
 * Returns a value indicating whether or not to render a PostPurchase step, and
 * optionally allows data to be stored on the client for use in the `Render`
 * extension point.
 */
//  extend("Checkout::PostPurchase::ShouldRender", async ({ storage }) => {
//   const initialState = await getRenderData();
//   const render = true;

//   if (render) {
//     // Saves initial state, provided to `Render` via `storage.initialData`
//     await storage.update(initialState);
//   }

//   return {
//     render,
//   };
// });

// // Simulate results of network call, etc.
// async function getRenderData() {
//   return {
//       couldBe: "anything",
//   };
// }

// /**
// * Entry point for the `Render` Extension Point
// *
// * Returns markup composed of remote UI components.  The Render extension can
// * optionally make use of data stored during `ShouldRender` extension point to
// * expedite time-to-first-meaningful-paint.
// */
// render("Checkout::PostPurchase::Render", App);

// // Top-level React component
// export function App({ extensionPoint, storage }) {
//   const initialState = storage.initialData;

//   return (
//       <BlockStack spacing="loose">
//       <CalloutBanner title="Post-purchase extension template">
//           Use this template as a starting point to build a great post-purchase
//           extension.
//       </CalloutBanner>
//       <Layout
//           maxInlineSize={0.95}
//           media={[
//           { viewportSize: "small", sizes: [1, 30, 1] },
//           { viewportSize: "medium", sizes: [300, 30, 0.5] },
//           { viewportSize: "large", sizes: [400, 30, 0.33] },
//           ]}
//       >
//           <View>
//           <Image source="https://cdn.shopify.com/static/images/examples/img-placeholder-1120x1120.png" />
//           </View>
//           <View />
//           <BlockStack spacing="xloose">
//           <TextContainer>
//               <Heading>Post-purchase extension</Heading>
//               <TextBlock>
//               Here you can cross-sell other products, request a product review
//               based on a previous purchase, and much more.
//               </TextBlock>
//           </TextContainer>
//           <Button
//               submit
//               onPress={() => {
//               // eslint-disable-next-line no-console
//               console.log(`Extension point ${extensionPoint}`, initialState);
//               }}
//           >
//               Primary button
//           </Button>
//           </BlockStack>
//       </Layout>
//       </BlockStack>
//   );
// }
