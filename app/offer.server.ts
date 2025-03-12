const OFFERS = [
  {
    id: 1,
    title: "One time offer",
    productTitle: "The S-Series Snowboard",
    // productImageURL:
    //   "https://cdn.shopify.com/s/files/1/0928/1932/5277/files/Main_0a40b01b-5021-48c1-80d1-aa8ab4876d3d.jpg?v=1737495380", // Replace this with the product image's URL.
    productImageURL:
      "https://cdn.shopify.com/s/files/1/0928/1932/5277/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1737495381", // Replace this with the product image's URL.
    productDescription: ["This PREMIUM snowboard is so SUPER DUPER awesome!"],
    originalPrice: "799.95",
    discountedPrice: "799.95",
    changes: [
      {
        type: "add_variant",
        // variantID: 55926879912285, // Replace with the variant ID.
        variantID: 55926879945053, // Replace with the variant ID.
        quantity: 1,
        discount: {
          value: 15,
          valueType: "percentage",
          title: "15% off",
        },
      },
    ],
  },
  {
    id: 2,
    title: "Weekly subscription offer",
    productTitle: "The S-Series Snowboard",
    productImageURL:
      "https://cdn.shopify.com/s/files/1/0928/1932/5277/files/Main_589fc064-24a2-4236-9eaf-13b2bd35d21d.jpg?v=1737495381", // Replace with the product image's URL.
    productDescription: ["This PREMIUM snowboard is so SUPER DUPER awesome!"],
    originalPrice: "594.96",
    discountedPrice: "594.96",
    sellingPlanName: "Subscribe and save",
    sellingPlanInterval: "WEEK",
    changes: [
      {
        type: "add_subscription",
        variantID: 55926879945053, // Replace with the variant ID.
        quantity: 1,
        sellingPlanId: 689555800413, // Replace with the selling plan ID.
        initialShippingPrice: 10,
        recurringShippingPrice: 10,
        discount: {
          value: 15,
          valueType: "percentage",
          title: "15% off",
        },
        shippingOption: {
          title: "Subscription shipping line",
          presentmentTitle: "Subscription shipping line",
        },
      },
    ],
  },
];

export function getOffers() {
  return OFFERS;
}

export function getSelectedOffer(offerId: number) {
  return OFFERS.find((offer) => offer.id === offerId);
}
