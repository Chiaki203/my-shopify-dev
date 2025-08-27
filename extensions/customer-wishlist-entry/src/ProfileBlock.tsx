import {
  Card,
  InlineStack,
  Link,
  reactExtension,
  Text,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension("customer-account.profile.block.render", () => (
  <ProfileBlock />
));

function ProfileBlock() {
  return (
    <Card padding>
      <InlineStack inlineAlignment={"center"} spacing={"tight"}>
        <Text>Browse Your Wishlist</Text>
        <Link to="extension:customer-account-wishlist/">{" → "}</Link>
      </InlineStack>
    </Card>
  );
}

// import {
//   BlockStack,
//   reactExtension,
//   TextBlock,
//   Banner,
//   useApi,
// } from "@shopify/ui-extensions-react/customer-account";

// export default reactExtension("customer-account.profile.block.render", () => (
//   <PromotionBanner />
// ));

// function PromotionBanner() {
//   const { i18n } = useApi();

//   return (
//     <Banner>
//       <BlockStack inlineAlignment="center">
//         <TextBlock>{i18n.translate("earnPoints")}</TextBlock>
//       </BlockStack>
//     </Banner>
//   );
// }
