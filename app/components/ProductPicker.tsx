// import { Link } from '@remix-run/react';
import {
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineStack,
  Link,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { ImageIcon, SearchIcon } from "@shopify/polaris-icons";
import { type Product } from "app/types/appBridgeType";

type Props = {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
};

export default function ProductPicker({
  selectedProducts,
  setSelectedProducts,
}: Props) {
  const selectProducts = async (
    selectedProducts: Product[],
    searchQuery = "",
  ) => {
    const selectedItems = await shopify.resourcePicker({
      selectionIds: selectedProducts.map(({ id }) => ({ id })),
      multiple: true,
      query: searchQuery,
      type: "product",
      action: "select",
    });
    console.log("shopify.resourcePicker selectedItems", selectedItems);
    if (selectedItems) {
      setSelectedProducts(selectedItems as Product[]);
    }
  };
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="400" align="start">
          {/* <InlineStack gap="400"> */}
          <div style={{ flexGrow: 1 }}>
            {/* <div> */}
            <TextField
              label=""
              prefix={<Icon source={SearchIcon} />}
              type="search"
              id="productSearch"
              placeholder="Search products"
              name="productSearch"
              autoComplete="off"
              value={""}
            />
          </div>
          <Button onClick={() => selectProducts([], "")}>Browse</Button>
        </InlineStack>
        {selectedProducts && selectedProducts.length ? (
          <BlockStack gap="400">
            {selectedProducts.map(
              ({ id, images, variants, title, totalVariants }, index) => {
                const hasImage = images && images.length;
                return (
                  <InlineStack
                    key={`${id}-${index}`}
                    gap="400"
                    blockAlign="center"
                    wrap={false}
                  >
                    <Box width="1500">
                      <Thumbnail
                        source={hasImage ? images[0].originalSrc : ImageIcon}
                        alt={
                          hasImage && images[0].altText
                            ? images[0].altText
                            : "product image"
                        }
                        size="medium"
                      />
                    </Box>
                    <div style={{ flexGrow: 1 }}>
                      <BlockStack>
                        <Text as="span">{title}</Text>
                        {totalVariants !== undefined ? (
                          <Text as="span" tone="subdued">
                            ({variants?.length || totalVariants} of{" "}
                            {totalVariants} variants selected)
                          </Text>
                        ) : null}
                      </BlockStack>
                    </div>
                    <Link
                      removeUnderline
                      onClick={() => selectProducts(selectedProducts)}
                    >
                      Edit
                    </Link>
                  </InlineStack>
                );
              },
            )}
          </BlockStack>
        ) : null}
      </BlockStack>
    </Card>
  );
}
