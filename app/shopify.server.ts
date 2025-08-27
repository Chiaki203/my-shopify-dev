import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  // DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import type {
  AdminApiContext,
  AdminApiContextWithRest,
} from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import type { ShopifyRestResources } from "@shopify/shopify-api";
import type { AppConfigArg } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/config-types";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  // apiVersion: ApiVersion.October24,
  apiVersion: ApiVersion.Unstable,
  // apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      // await shopify.registerWebhooks({session})
      try {
        const metafield = await getMetafield(admin);
        if (!metafield) {
          await createMetafield(admin);
        }
      } catch (error: any) {
        if ("graphQLErrors" in error) {
          console.log("graphQLErrors", error.graphQLErrors);
        } else {
          console.log("error getting metafield", error);
        }
        throw error;
      }
    },
  },

  // webhooks: {
  //   ORDERS_CREATE: {
  //     deliveryMethod: DeliveryMethod.EventBridge,
  //     arn: "arn:aws:events:eu-central-1::event-source/aws.partner/shopify.com/208105897985/example-app",
  //   },
  // },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
// export const apiVersion = ApiVersion.October24;
export const apiVersion = ApiVersion.Unstable;
// export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;

// async function getMetafield(admin:AdminApiContext<AppConfigArg>) {
async function getMetafield(
  admin: AdminApiContextWithRest<ShopifyRestResources>,
) {
  // async function getMetafield(admin:any) {
  const response = await admin.graphql(getMetafieldQuery, {
    variables: {
      key: "nickname",
      namespace: "$app:preferences",
      ownerType: "CUSTOMER",
    },
  });
  const json = await response.json();
  console.log("getMetafield nickname", json);
  return json.data.metafieldDefinitions.nodes[0];
}

const getMetafieldQuery = `#graphql
  query getMetafieldDefinition($key:String!, $namespace:String!, $ownerType: MetafieldOwnerType!) {
    metafieldDefinitions(first:1, key:$key, namespace:$namespace, ownerType:$ownerType) {
      nodes {
        id
        name
      }
    }
  }
`;

// async function createMetafield(admin:AdminApiContext<AppConfigArg>) {
async function createMetafield(
  admin: AdminApiContextWithRest<ShopifyRestResources>,
) {
  const response = await admin.graphql(createMetafieldMutation, {
    variables: {
      definition: {
        access: {
          customerAccount: "READ_WRITE",
          admin: "MERCHANT_READ",
        },
        key: "nickname",
        name: "The customer's preferred name",
        namespace: "$app:preferences",
        ownerType: "CUSTOMER",
        type: "single_line_text_field",
      },
    },
  });
  const json = await response.json();
  console.log("createMetafield nickname", json);
  console.log(
    "stringify createMetafield nickname",
    JSON.stringify(json, null, 2),
  );
}

const createMetafieldMutation = `#graphql
  mutation createMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        key
        namespace
      }
      userErrors {
        field
        message
      }
    }
  }
`;
