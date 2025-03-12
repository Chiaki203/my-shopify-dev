import {
  Banner,
  BlockStack,
  Text,
  Image,
  extension,
  Divider,
  Heading,
  InlineLayout,
  InlineStack,
  SkeletonImage,
  SkeletonText,
  Button,
} from "@shopify/ui-extensions/checkout";
import type { RemoteRoot } from "@remote-ui/core/src/types";

// 1. Choose an extension target
// export default reactExtension("purchase.checkout.block.render", () => (
//   <Extension />
// ));

export default extension(
  "purchase.checkout.block.render",
  (root, { lines, applyCartLinesChange, query, i18n }) => {
    let products = [];
    let loading = true;
    let appRendered = false;
    fetchProducts(query).then((fetchedProducts) => {
      console.log("fetchedProducts", fetchedProducts);
      products = fetchedProducts;
      loading = false;
      renderApp();
    });
    lines.subscribe(() => renderApp());
    const loadingState = createLoadingState(root);
    if (loading) {
      root.append(loadingState);
    }
    const { imageComponent, titleMarkup, priceMarkup, merchandise } =
      createProductComponents(root);
    const addButtonComponent = createAddButtonComponent(
      root,
      applyCartLinesChange,
      merchandise,
    );
    const app = createApp(
      root,
      imageComponent,
      titleMarkup,
      priceMarkup,
      addButtonComponent,
    );
    function renderApp() {
      if (loading) return;
      if (!loading && products.length === 0) {
        root.removeChild(loadingState);
        return;
      }
      const productsOnOffer = filterProductsOnOffer(lines, products);
      if (!loading && productsOnOffer.length === 0) {
        if (loadingState.parent) {
          root.removeChild(loadingState);
        }
        if (root.children) {
          root.removeChild(root.children[0]);
        }
        return;
      }
      updateProductComponents(
        productsOnOffer[0],
        imageComponent,
        titleMarkup,
        priceMarkup,
        addButtonComponent,
        merchandise,
        i18n,
      );
      if (!appRendered) {
        root.removeChild(loadingState);
        root.append(app);
        appRendered = true;
      }
    }
  },
);

let errorContainer;

function createApp(
  root: RemoteRoot,
  imageComponent,
  titleMarkup,
  priceMarkup,
  addButtonComponent,
) {
  errorContainer = root.createComponent(InlineStack, { spacing: "none" });
  return root.createComponent(BlockStack, { spacing: "loose" }, [
    root.createComponent(Divider),
    errorContainer,
    root.createComponent(Heading, { level: 2 }, "You might also like"),
    root.createComponent(BlockStack, { spacing: "loose" }, [
      root.createComponent(
        InlineLayout,
        {
          spacing: "base",
          columns: [64, "fill", "auto"],
          blockAlignment: "center",
        },
        [
          imageComponent,
          root.createComponent(BlockStack, { spacing: "none" }, [
            root.createComponent(Text, { size: "medium", emphasis: "bold" }, [
              titleMarkup,
            ]),
            root.createComponent(Text, { appearance: "subdued" }, [
              priceMarkup,
            ]),
          ]),
          addButtonComponent,
        ],
      ),
    ]),
  ]);
}

function createLoadingState(root: RemoteRoot) {
  return root.createComponent(
    BlockStack,
    {
      spacing: "loose",
    },
    [
      root.createComponent(Divider),
      root.createComponent(Heading, { level: 2 }, ["You might also like"]),
      root.createComponent(BlockStack, { spacing: "loose" }, [
        root.createComponent(
          InlineLayout,
          {
            spacing: "base",
            columns: [64, "fill", "auto"],
            blockAlignment: "center",
          },
          [
            root.createComponent(SkeletonImage, { aspectRatio: 1 }),
            root.createComponent(BlockStack, { spacing: "none" }, [
              root.createComponent(SkeletonText, { inlineSize: "large" }),
              root.createComponent(SkeletonText, { inlineSize: "small" }),
            ]),
            root.createComponent(
              Button,
              { kind: "secondary", disabled: true },
              [root.createText("Add")],
            ),
          ],
        ),
      ]),
    ],
  );
}

const displayErrorBanner = (root: RemoteRoot, message: string) => {
  const errorComponent = root.createComponent(Banner, { status: "critical" }, [
    message,
  ]);
  errorContainer.append(errorComponent);
  setTimeout(() => errorContainer.removeChild(errorComponent), 8000);
};

const handleAddButtonPress = async (
  root: RemoteRoot,
  applyCartLinesChange,
  merchandise,
) => {
  const result = await applyCartLinesChange({
    type: "addCartLine",
    merchandiseId: merchandise.id,
    quantity: 1,
  });
  console.log("applyCartLinesChange result", result);
  if (result.type === "success") {
    displayErrorBanner(
      root,
      "There was an issue adding this product. Please try again.",
    );
  }
};

const createAddButtonComponent = (
  root: RemoteRoot,
  applyCartLinesChange,
  merchandise,
) => {
  return root.createComponent(
    Button,
    {
      kind: "secondary",
      loading: false,
      onPress: async () => {
        await handleAddButtonPress(root, applyCartLinesChange, merchandise);
      },
    },
    ["Add"],
  );
};

const createProductComponents = (root: RemoteRoot) => {
  const imageComponent = root.createComponent(Image, {
    border: "base",
    borderWidth: "base",
    borderRadius: "loose",
    source: "",
    accessibilityDescription: "",
    aspectRatio: 1,
  });
  const titleMarkup = root.createText("");
  const priceMarkup = root.createText("");
  const merchandise = { id: "" };
  return { imageComponent, titleMarkup, priceMarkup, merchandise };
};

const fetchProducts = (query) => {
  return query(
    `query ($first:Int!) {
      products(first:$first, , reverse: true) {
        nodes {
          id
          title
          images(first:1) {
            nodes {
              url
            }
          }
          variants(first:1) {
            nodes {
              id
              price {
                amount
              }
            }
          }
        }
      }
    }
    `,
    {
      variables: { first: 5 },
    },
  )
    .then(({ data }) => data.products.nodes)
    .catch((err) => {
      console.log("error fetching products", err);
      return [];
    });
};

const filterProductsOnOffer = (lines, products) => {
  const cartLineProductVariantIds = lines.current.map(
    (item) => item.merchandise.id,
  );
  return products.filter((product) => {
    const isProductVariantInCart = product.variants.nodes.some(({ id }) =>
      cartLineProductVariantIds.includes(id),
    );
    return !isProductVariantInCart;
  });
};

const updateProductComponents = (
  product,
  imageComponent,
  titleMarkup,
  priceMarkup,
  addButtonComponent,
  merchandise,
  i18n,
) => {
  const { images, title, variants } = product;
  const renderPrice = i18n.formatCurrency(variants.nodes[0].price.amount);
  const imageUrl =
    images.nodes[0]?.url ??
    "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png?format=webp&v=1530129081";
  imageComponent.updateProps({ source: imageUrl });
  titleMarkup.updateText(title);
  addButtonComponent.updateProps({
    accessibilityLabel: `Add ${title} to cart`,
  });
  priceMarkup.updateText(renderPrice);
  merchandise.id = variants.nodes[0].id;
};

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
//       <Banner title="pre-purchase-offer" status="warning">
//         {translate("attributeChangesAreNotSupported")}
//       </Banner>
//     );
//   }

//   // 3. Render a UI
//   return (
//     <BlockStack border={"dotted"} padding={"tight"}>
//       <Banner title="pre-purchase-offer">
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
