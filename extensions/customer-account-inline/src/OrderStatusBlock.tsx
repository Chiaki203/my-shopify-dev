import {
  BlockStack,
  reactExtension,
  TextBlock,
  Banner,
  useApi,
  Link,
  Divider,
  Button,
  Card,
  Heading,
  InlineLayout,
} from "@shopify/ui-extensions-react/customer-account";

const bannerBlock = reactExtension(
  "customer-account.order-status.block.render",
  () => <PromotionBanner />,
);

const fulfillmentBlock = reactExtension(
  "customer-account.order-status.fulfillment-details.render-after",
  () => <FulfillmentDetailsDelivery />,
);

const profileBlock = reactExtension(
  "customer-account.profile.block.render",
  () => <ProfileBlockExtension />,
);

export { bannerBlock, fulfillmentBlock, profileBlock };

function PromotionBanner() {
  const { i18n } = useApi();

  return (
    <Banner>
      <BlockStack inlineAlignment="center">
        <TextBlock>
          {i18n.translate("earnPoints")} <Link>View rewards</Link>
        </TextBlock>
      </BlockStack>
    </Banner>
  );
}

function FulfillmentDetailsDelivery() {
  return (
    <BlockStack>
      <Divider />
      <TextBlock>Tell us how we did for a chance to win 1000 points</TextBlock>
      <BlockStack maxInlineSize={150}>
        <Button appearance="monochrome" kind="secondary">
          Write a review
        </Button>
      </BlockStack>
    </BlockStack>
  );
}

function ProfileBlockExtension() {
  const { i18n } = useApi<"customer-account.profile.block.render">();
  return (
    <Card padding>
      <BlockStack spacing="loose">
        <Heading level={2}>Rewards</Heading>
        <InlineLayout>
          <BlockStack>
            <TextBlock appearance="subdued">Points</TextBlock>
            <TextBlock emphasis="bold" size="large">
              43,0000
            </TextBlock>
          </BlockStack>
          <BlockStack>
            <TextBlock appearance="subdued">Store credit</TextBlock>
            <TextBlock emphasis="bold" size="large">
              {i18n.formatCurrency(450, { currency: "EUR" })}
            </TextBlock>
          </BlockStack>
          <BlockStack>
            <TextBlock appearance="subdued">Referrals</TextBlock>
            <TextBlock emphasis="bold" size="large">
              3
            </TextBlock>
          </BlockStack>
          <BlockStack>
            <TextBlock appearance="subdued">Referral bonus</TextBlock>
            <TextBlock emphasis="bold" size="large">
              600
            </TextBlock>
          </BlockStack>
        </InlineLayout>
        <BlockStack maxInlineSize={140}>
          <Button appearance="monochrome" kind="secondary">
            View rewards
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
