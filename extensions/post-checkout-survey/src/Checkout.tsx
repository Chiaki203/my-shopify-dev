import {
  reactExtension,
  useStorage,
  View,
  BlockStack,
  Heading,
  Text,
  Button,
  ChoiceList,
  Choice,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useEffect, useState } from "react";

const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => (
  <Attribution />
));

// const orderDetailsBlock = reactExtension('customer-account.order-status.block.render', () => <ProductReview/>)

export { thankYouBlock };

function Attribution() {
  const [attribution, setAttribution] = useState<string | string[]>();
  const [loading, setLoading] = useState(false);
  const [attributionSubmitted, setAttributionSubmitted] = useStorageState(
    "attribution-submitted",
  );
  const handleSubmit = async () => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Submitted:", attribution);
        setLoading(false);
        setAttributionSubmitted({ data: attribution, loading: false });
        console.log("attribution-submitted", attributionSubmitted);
        resolve();
      }, 1000);
    });
  };
  if (attributionSubmitted.loading || attributionSubmitted.data) {
    return null;
  }
  console.log("attributionSubmitted", attributionSubmitted);

  return (
    <Survey
      title="How did you hear about us?"
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ChoiceList
        name="sale-attribution"
        value="tv"
        // onChange={setAttribution}
        onChange={(value) => {
          console.log("ChoiceList onChange value", value);
          setAttribution(value);
        }}
        variant="group"
      >
        <BlockStack>
          <Choice id="tv">TV</Choice>
          <Choice id="podcast">Podcast</Choice>
          <Choice id="family">From a friend or family member</Choice>
          <Choice id="tiktok">Tiktok</Choice>
        </BlockStack>
      </ChoiceList>
    </Survey>
  );
}

const Survey = ({ title, description = "", onSubmit, children, loading }) => {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async () => {
    await onSubmit();
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          <Heading>Thanks for your feedback!</Heading>
          <Text>Your response has been submitted</Text>
        </BlockStack>
      </View>
    );
  }
  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack>
        <Heading>{title}</Heading>
        <Text>{description}</Text>
        {children}
        <Button kind="secondary" onPress={handleSubmit} loading={loading}>
          Submit feedback
        </Button>
      </BlockStack>
    </View>
  );
};

const useStorageState = (key: string): [any, (value: any) => void] => {
  const storage = useStorage();
  const [data, setData] = useState<string | string[]>("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const queryStorage = async () => {
      const value = (await storage.read(key)) as any;
      if (value) {
        setData(value.data || "");
      }
      console.log("value", value);
      setLoading(false);
    };
    queryStorage();
  }, [storage, key, setData, setLoading]);
  const setStorage = useCallback(
    (value: any) => {
      storage.write(key, value);
    },
    [storage, key],
  );
  return [{ data, loading }, setStorage];
};

// import {
//   reactExtension,
//   Banner,
//   BlockStack,
//   Checkbox,
//   Text,
//   useApi,
//   useApplyAttributeChange,
//   useInstructions,
//   useTranslate,
// } from "@shopify/ui-extensions-react/checkout";

// // 1. Choose an extension target
// export default reactExtension("purchase.checkout.block.render", () => (
//   <Extension />
// ));

// function Extension() {
//   const translate = useTranslate();
//   const { extension } = useApi();
//   const instructions = useInstructions();
//   const applyAttributeChange = useApplyAttributeChange();

//   // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
//   if (!instructions.attributes.canUpdateAttributes) {
//     // For checkouts such as draft order invoices, cart attributes may not be allowed
//     // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
//     return (
//       <Banner title="post-checkout-survey" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="post-checkout-survey">
//         {translate("welcome", {
//           target: <Text emphasis="italic">{extension.target}</Text>,
//         })}
//       </Banner>
//       <Checkbox onChange={onCheckboxChange}>
//         {translate("iWouldLikeAFreeGiftWithMyOrder")}
//       </Checkbox>
//     </BlockStack>
//   );

//   async function onCheckboxChange(isChecked) {
//     // 4. Call the API to modify checkout
//     const result = await applyAttributeChange({
//       key: "requestedFreeGift",
//       type: "updateAttribute",
//       value: isChecked ? "yes" : "no",
//     });
//     console.log("applyAttributeChange result", result);
//   }
// }
