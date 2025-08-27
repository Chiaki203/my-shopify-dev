// [[extensions.targeting]]
// module = "./src/MenuActionItemButton.tsx"
// target = "customer-account.order.action.menu-item.render"

// [[extensions.targeting]]
// module = "./src/MenuActionModal.tsx"
// target = "customer-account.order.action.render"

// import {
//   Button,
//   reactExtension,
// } from "@shopify/ui-extensions-react/customer-account";

// export default reactExtension(
//   "customer-account.order.action.menu-item.render",
//   () => <MenuActionItemButton />,
// );

// function MenuActionItemButton() {
//   return <Button>Add note</Button>;
// }

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
