import {
  BlockStack,
  Button,
  Card,
  Form,
  Heading,
  Icon,
  InlineStack,
  Modal,
  reactExtension,
  Text,
  TextField,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

export default reactExtension(
  "customer-account.profile.block.render",
  async () => {
    const { customerId, nickname } = await getCustomerPreferences();
    return <ProfilePreference customerId={customerId} nickname={nickname} />;
  },
);

interface ProfilePreferenceProps {
  customerId: string;
  nickname?: string;
}

function ProfilePreference({ customerId, nickname }: ProfilePreferenceProps) {
  const { i18n, ui } = useApi();
  const [nickName, setNickName] = useState(nickname ?? "");
  const handleSubmit = async () => {
    await setCustomerPreferences(customerId, nickName);
    ui.overlay.close("edit-preferences-modal");
  };
  const handleCancel = () => {
    ui.overlay.close("edit-preferences-modal");
  };
  return (
    <Card padding>
      <BlockStack spacing={"loose"}>
        <Heading level={3}>
          <InlineStack>
            <Text>{i18n.translate("preferenceCard.heading")}</Text>
            <Button
              kind="plain"
              accessibilityLabel={i18n.translate("preferenceCard.edit")}
              overlay={
                <Modal
                  id="edit-preferences-modal"
                  padding
                  title={i18n.translate("preferenceCard.modalHeading")}
                >
                  <Form onSubmit={handleSubmit}>
                    <BlockStack>
                      <TextField
                        label={i18n.translate("preferenceCard.nickName.label")}
                        value={nickName}
                        onChange={(value) => setNickName(value)}
                      />
                      <InlineStack
                        blockAlignment={"center"}
                        inlineAlignment={"end"}
                      >
                        <Button kind="plain" onPress={handleCancel}>
                          {i18n.translate("preferenceCard.cancel")}
                        </Button>
                        <Button accessibilityRole="submit">
                          {i18n.translate("preferenceCard.save")}
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Form>
                </Modal>
              }
            >
              <Icon source="pen" size="small" appearance="monochrome" />
            </Button>
          </InlineStack>
        </Heading>
        <BlockStack spacing={"none"}>
          <Text appearance="subdued">
            {i18n.translate("preferenceCard.nickName.label")}
          </Text>
          <Text>{nickName}</Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

const getCustomerPreferences = async () => {
  const response = await fetch(
    "shopify://customer-account/api/unstable/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query preferences($key:String!, $namespace:String!) {
          customer {
            id
            metafield(namespace: $namespace, key: $key) {
              value
            }
          }
        }
      `,
        variables: {
          key: "nickname",
          namespace: "$app:preferences",
        },
      }),
    },
  );
  const customerData = await response.json();
  console.log("fetched customer preferences", customerData);
  return {
    customerId: customerData.data.customer.id,
    nickname: customerData.data.customer.metafield?.value,
  };
};

const setCustomerPreferences = async (
  customerId: string,
  nickname?: string,
) => {
  await fetch("shopify://customer-account/api/unstable/graphql.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        mutation setPreferences($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields:$metafields) {
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        metafields: [
          {
            key: "nickname",
            namespace: "$app:preferences",
            ownerId: customerId,
            value: nickname ?? "",
          },
        ],
      },
    }),
  });
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
