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
} from "@shopify/ui-extensions-react/customer-account";
import { useCallback, useEffect, useState } from "react";

const orderDetailsBlock = reactExtension(
  "customer-account.order-status.block.render",
  () => <ProductReview />,
);

export { orderDetailsBlock };

function ProductReview() {
  const [productReview, setProductReview] = useState<string | string[]>("5");
  const [loading, setLoading] = useState(false);
  const [productReviewed, setProductReviewed] =
    useStorageState("product-reviewed2");
  const handleSubmit = async () => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("submitted", productReview);
        setLoading(false);
        setProductReviewed({ data: productReview, loading: false });
        console.log("product-reviewed", productReviewed);
        resolve();
      }, 1000);
    });
  };
  if (productReviewed.loading || productReviewed.data) {
    return null;
  }
  return (
    <Survey
      title="How do you like your purchase?"
      description="We would like to learn if you are enjoying your purchase."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ChoiceList
        name="product-review"
        value="5"
        onChange={(value) => {
          console.log("product review choice list value", value);
          setProductReview(value);
        }}
      >
        <BlockStack>
          <Choice id="5">Amazing! Very happy with it.</Choice>
          <Choice id="4">It's okay, I expected more.</Choice>
          <Choice id="3">Eh, There are better options out there.</Choice>
          <Choice id="2">I regret the purchase.</Choice>
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
      console.log("query storage value", value);
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
//   BlockStack,
//   reactExtension,
//   TextBlock,
//   Banner,
//   useApi
// } from "@shopify/ui-extensions-react/customer-account";

// export default reactExtension(
//   "customer-account.order-status.block.render",
//   () => <PromotionBanner />
// );

// function PromotionBanner() {
//   const { i18n } = useApi();

//   return (
//     <Banner>
//       <BlockStack inlineAlignment="center" >
//         <TextBlock>
//           {i18n.translate("earnPoints")}
//         </TextBlock>
//       </BlockStack>
//     </Banner>
//   );
// }
