import {
  BlockStack,
  Button,
  Grid,
  Image,
  Page,
  reactExtension,
  ResourceItem,
  SkeletonImage,
  SkeletonText,
  TextBlock,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";
import { useEffect, useState } from "react";

export default reactExtension("customer-account.page.render", () => (
  <FullPageExtension />
));
interface Product {
  id: string;
  title: string;
  onlineStoreUrl: string;
  handle: string;
  featuredImage: {
    url: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };
}

function FullPageExtension() {
  const { i18n, query } = useApi<"customer-account.page.render">();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  console.log("wishlist", wishlist);
  const [loading, setLoading] = useState(false);
  const [shopUrl, setShopUrl] = useState("");
  console.log("shopUrl", shopUrl);
  const [removeLoading, setRemoveLoading] = useState({
    id: null,
    loading: false,
  });
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await query<{ products: { nodes: Product[] } }>(
        `
          query($first:Int!) {
            products(first:$first) {
              nodes {
                id
                title
                onlineStoreUrl
                handle
                priceRange {
                  minVariantPrice {
                  amount
                  currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                }
              }
            }
          }
        `,
        {
          variables: {
            first: 10,
          },
        },
      );
      setLoading(false);
      setWishlist(data.data?.products?.nodes || []);
    } catch (error) {
      setLoading(false);
      console.log("error fetching wishlist", error);
    }
  };
  const fetchShopUrl = async () => {
    try {
      const data = await query<any>(`
        query {
          shop {
            primaryDomain {
              url
            }
          }
        }
      `);
      setShopUrl(data.data?.shop?.primaryDomain?.url || "");
    } catch (error) {
      console.log("error fetching shop url", error);
    }
  };
  const deleteWishlistItem = async (id: string) => {
    setRemoveLoading({ loading: true, id });
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setWishlist(wishlist.filter((item) => item.id !== id));
        setRemoveLoading({ loading: false, id: null });
        resolve();
      }, 1000);
    });
  };
  useEffect(() => {
    fetchWishlist();
    fetchShopUrl();
  }, []);
  return (
    <Page title="Wishlist">
      <Grid columns={["fill", "fill", "fill"]} rows="auto" spacing={"loose"}>
        {loading && (
          <ResourceItem loading>
            <BlockStack spacing={"base"}>
              <SkeletonImage
                inlineSize={"fill"}
                aspectRatio={1}
                blockSize={"fill"}
              />
              <BlockStack spacing={"none"}>
                <SkeletonText inlineSize="base" />
              </BlockStack>
              <SkeletonText inlineSize="small" />
            </BlockStack>
          </ResourceItem>
        )}
        {!loading &&
          wishlist.length > 0 &&
          wishlist.map((product) => (
            <ResourceItem
              key={product.id}
              action={
                <>
                  <Button
                    kind="primary"
                    to={`${shopUrl}/products/${product.handle}`}
                  >
                    View product
                  </Button>
                  <Button
                    kind="secondary"
                    loading={
                      removeLoading.loading && product.id === removeLoading.id
                    }
                    onPress={() => deleteWishlistItem(product.id)}
                  >
                    Remove
                  </Button>
                </>
              }
            >
              <BlockStack spacing={"base"}>
                <Image source={product.featuredImage.url} />
                <TextBlock emphasis="bold">{product.title}</TextBlock>
                <TextBlock appearance="subdued">
                  {i18n.formatCurrency(
                    product.priceRange.minVariantPrice.amount,
                    {
                      currency: product.priceRange.minVariantPrice.currencyCode,
                    },
                  )}
                </TextBlock>
              </BlockStack>
            </ResourceItem>
          ))}
        {!loading && wishlist.length === 0 && (
          <TextBlock>No items in your wishlist.</TextBlock>
        )}
      </Grid>
    </Page>
  );
}

// import {
//   BlockStack,
//   reactExtension,
//   TextBlock,
//   Banner,
//   useApi,
// } from "@shopify/ui-extensions-react/customer-account";

// export default reactExtension("customer-account.page.render", () => (
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
