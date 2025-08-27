import {
  Button,
  Card,
  InlineStack,
  reactExtension,
  useApi,
  useAuthenticationState,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order-status.block.render",
  () => <BlockLoyalty />,
);

function BlockLoyalty() {
  const { requireLogin } =
    useApi<"customer-account.order-status.block.render">();
  const viewPoints = async () => {
    await requireLogin();
  };
  const authenticationState = useAuthenticationState();
  return (
    <Card padding>
      <InlineStack inlineAlignment={"center"}>
        Points earned from your purchase.
        {authenticationState === "pre_authenticated" ? (
          <Button onPress={viewPoints} kind="plain">
            View rewards
          </Button>
        ) : (
          " 560 points"
        )}
      </InlineStack>
    </Card>
  );
}
