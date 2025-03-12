import { Page, Text, Card, EmptyState, BlockStack } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";

export default function PreOrder() {
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Pre-orders">
        <button variant="primary" onClick={() => navigate("/app/create")}>
          Create a pre-order
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Card>
          <EmptyState
            heading="Create a pre-order"
            image="/images/empty-subscriptions-list-state.png"
            // image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <Text as="p" variant="bodyMd">
              Pre-orders enable customers to purchase products with deferred
              payments or deliveries
            </Text>
          </EmptyState>
        </Card>
        <Card>
          <Text as="p" variant="bodyMd">
            Pre-orders enable customers to purchase products with deferred
            payments or deliveries
          </Text>
        </Card>
      </BlockStack>
    </Page>
  );
}
