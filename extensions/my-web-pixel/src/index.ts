import { register } from "@shopify/web-pixels-extension";

register(({ analytics, browser, init, settings }) => {
  const baseUrl = "https://tuning-aids-interim-regarded.trycloudflare.com";
  // Bootstrap and insert pixel script tag here

  // Sample subscribe to page view
  // analytics.subscribe("page_viewed", (event) => {
  //   // browser.cookie.set("kodama_user_id", "1234");
  //   // console.log("Page viewed", event);
  //   console.log("settings", settings);
  //   console.log("init data", init.data);
  //   console.log("init context", init.context);
  //   console.log("init customerPrivacy", init.customerPrivacy);
  // });
  analytics.subscribe("cart_viewed", (event) => {
    // Example for accessing event data
    const totalCartCost = event.data.cart?.cost.totalAmount.amount;

    const firstCartLineItemName =
      event.data.cart?.lines[0]?.merchandise.product.title;

    const payload = {
      event_name: event.name,
      event_data: {
        cartCost: totalCartCost,
        firstCartItemName: firstCartLineItemName,
      },
    };

    console.log("cart viewed payload", payload);

    // Example for sending event data to third party servers
    // fetch("/apps/subpath/web_proxy", {
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // keepalive: true,
      // mode: "cors",
    });
  });
  analytics.subscribe("checkout_address_info_submitted", (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const payload = {
      event_name: event.name,
      event_data: {
        addressLine1: checkout.shippingAddress?.address1,
        addressLine2: checkout.shippingAddress?.address2,
        city: checkout.shippingAddress?.city,
        country: checkout.shippingAddress?.country,
      },
    };
    console.log("checkout_address_info_submitted payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("checkout_completed", (event) => {
    console.log("checkout_completed event");
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const allDiscountCodes = checkout.discountApplications.map((discount) => {
      if (discount.type === "DISCOUNT_CODE") {
        return discount.title;
      }
      return null;
    });

    const firstItem = checkout.lineItems[0];

    const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

    const customItemPayload = {
      quantity: firstItem.quantity,
      title: firstItem.title,
      discount: firstItemDiscountedValue,
    };

    const paymentTransactions = event.data.checkout.transactions.map(
      (transaction) => {
        return {
          paymentGateway: transaction.gateway,
          amount: transaction.amount,
        };
      },
    );

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        discountCodesUsed: allDiscountCodes,
        firstItem: customItemPayload,
        paymentTransactions: paymentTransactions,
      },
    };
    console.log("checkout_completed payload", payload);

    // Example for sending event data to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("checkout_contact_info_submitted", (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const email = checkout.email;
    const phone = checkout.phone;

    const payload = {
      event_name: event.name,
      event_data: {
        email: email,
        phone: phone,
      },
    };
    console.log("checkout_contact_info_submitted payload", payload);

    // Example for sending event data to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("checkout_started", (event) => {
    console.log("checkout_started event");
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const allDiscountCodes = checkout.discountApplications.map((discount) => {
      if (discount.type === "DISCOUNT_CODE") {
        return discount.title;
      }
      return null;
    });
    const firstItem = checkout.lineItems[0];

    const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

    const customItemPayload = {
      quantity: firstItem.quantity,
      title: firstItem.title,
      discount: firstItemDiscountedValue,
    };

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        discountCodesUsed: allDiscountCodes,
        firstItem: customItemPayload,
      },
    };
    console.log("checkout_started payload", payload);

    // Example for sending event data to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("collection_viewed", (event) => {
    console.log("collection_viewed event");
    // Example for accessing event data
    const collection = event.data.collection;

    const collectionTitle = collection.title;

    const priceOfFirstProductInCollection =
      collection.productVariants[0]?.price.amount;

    const payload = {
      event_name: event.name,
      event_data: {
        collectionTitle: collectionTitle,
        priceFirstItem: priceOfFirstProductInCollection,
      },
    };
    console.log("collection_viewed payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("payment_info_submitted", (event) => {
    console.log("payment_info_submitted event");
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const firstDiscountType = checkout.discountApplications[0]?.type;

    const discountCode =
      firstDiscountType === "DISCOUNT_CODE"
        ? checkout.discountApplications[0]?.title
        : null;

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        firstDiscountCode: discountCode,
      },
    };
    console.log("payment_info_submitted payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("product_added_to_cart", (event) => {
    console.log("product_added_to_cart event");
    // Example for accessing event data
    const cartLine = event.data.cartLine;

    const cartLineCost = cartLine?.cost.totalAmount.amount;
    const cartLineQuantity = cartLine?.quantity;

    const cartLineCostCurrency = cartLine?.cost.totalAmount.currencyCode;

    const merchandiseVariantTitle = cartLine?.merchandise.title;

    const payload = {
      event_name: event.name,
      event_data: {
        cartLineCost: cartLineCost,
        cartLineQuantity: cartLineQuantity,
        cartLineCostCurrency: cartLineCostCurrency,
        merchandiseVariantTitle: merchandiseVariantTitle,
      },
    };
    console.log("product_added_to_cart payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("product_removed_from_cart", (event) => {
    console.log("product_removed_from_cart event");
    // Example for accessing event data
    const clientId = event.clientId;
    const pixelDocument = event.context.document;
    const pixelNavigator = event.context.navigator;
    const cartLine = event.data.cartLine;

    const cartLineCost = cartLine?.cost.totalAmount.amount;

    const cartLineCostCurrency = cartLine?.cost.totalAmount.currencyCode;

    const merchandiseVariantTitle = cartLine?.merchandise.title;

    const payload = {
      event_name: event.name,
      clientId: clientId,
      pixelDocument: pixelDocument,
      pixelNavigator: pixelNavigator,
      event_data: {
        cartLineCost: cartLineCost,
        cartLineCostCurrency: cartLineCostCurrency,
        merchandiseVariantTitle: merchandiseVariantTitle,
      },
    };
    console.log("product_removed_from_cart payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("product_viewed", (event) => {
    console.log("product_viewed event");
    // Example for accessing event data
    const productPrice = event.data.productVariant.price.amount;

    const productTitle = event.data.productVariant.title;

    const payload = {
      event_name: event.name,
      event_data: {
        productPrice: productPrice,
        productTitle: productTitle,
      },
    };
    console.log("product_viewed payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("search_submitted", (event) => {
    console.log("search_submitted event");
    const timestamp = event.timestamp;
    // Example for accessing event data
    const searchResult = event.data.searchResult;

    const searchQuery = searchResult.query;

    const firstProductReturnedFromSearch =
      searchResult.productVariants[0]?.product.title;

    const payload = {
      timestamp: timestamp,
      event_name: event.name,
      event_data: {
        searchQuery: searchQuery,
        firstProductTitle: firstProductReturnedFromSearch,
      },
    };
    console.log("search_submitted payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("clicked", (event) => {
    console.log("clicked event");
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;
    const elementHref = element.href;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
        url: elementHref,
      },
    };
    console.log("clicked payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("form_submitted", (event) => {
    console.log("form_submitted event");
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const formAction = element.action;
    const emailRegex = /email/i;
    const [email] = element.elements
      .filter(
        (item: any) => emailRegex.test(item.id) || emailRegex.test(item.name),
      )
      .map((item) => item.value);
    const formDetails = element.elements.map((item) => {
      return {
        id: item.id,
        name: item.name,
        value: item.value,
      };
    });

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        url: formAction,
        email: email,
        formDetails: formDetails[0],
      },
    };
    console.log("form_submitted payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("input_blurred", (event) => {
    console.log("input_blurred event");
    const eventType = event.type;
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;

    const payload = {
      event_type: eventType,
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
      },
    };
    console.log("input_blurred payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("input_changed", (event) => {
    console.log("input_changed event");
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;
    const elementType = element.type;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
        type: elementType,
      },
    };
    console.log("input_changed payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("input_focused", (event) => {
    console.log("input_focused event");
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
      },
    };
    console.log("input_focused payload", payload);

    // Example for sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  analytics.subscribe("advanced_dom_clicked", (event) => {
    // Accessing event payload
    console.log("advanced_dom_clicked event", event);
    const node = event.data.node;

    if (node?.nodeType !== Node.ELEMENT_NODE) return;

    const payload = {
      event_name: event.name,
      event_data: {
        id: node.serializationId,
        url: node.attributes?.href,
        type: node.nodeType,
      },
    };
    console.log("advanced_dom_clicked payload", payload);

    // E.g. sending event to third party servers
    fetch(`${baseUrl}/api/web_pixel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
});
