/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
}>;


export type PopulateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'> }> } }
    )> }> };

export type ShopifyRemixTemplateUpdateVariantMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants: Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput;
}>;


export type ShopifyRemixTemplateUpdateVariantMutation = { productVariantsBulkUpdate?: AdminTypes.Maybe<{ productVariants?: AdminTypes.Maybe<Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>>> }> };

export type GetDeliveryCustomizationQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type GetDeliveryCustomizationQuery = { deliveryCustomization?: AdminTypes.Maybe<(
    Pick<AdminTypes.DeliveryCustomization, 'id' | 'title' | 'enabled'>
    & { metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
  )> };

export type UpdateDeliveryCustomizationMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  input: AdminTypes.DeliveryCustomizationInput;
}>;


export type UpdateDeliveryCustomizationMutation = { deliveryCustomizationUpdate?: AdminTypes.Maybe<{ deliveryCustomization?: AdminTypes.Maybe<Pick<AdminTypes.DeliveryCustomization, 'id'>>, userErrors: Array<Pick<AdminTypes.DeliveryCustomizationError, 'message'>> }> };

export type CreateDeliveryCustomizationMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.DeliveryCustomizationInput;
}>;


export type CreateDeliveryCustomizationMutation = { deliveryCustomizationCreate?: AdminTypes.Maybe<{ deliveryCustomization?: AdminTypes.Maybe<Pick<AdminTypes.DeliveryCustomization, 'id'>>, userErrors: Array<Pick<AdminTypes.DeliveryCustomizationError, 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n        query getDeliveryCustomization($id: ID!) {\n          deliveryCustomization(id: $id) {\n            id\n            title\n            enabled\n            metafield(namespace: \"$app:delivery-customization\", key: \"function-configuration\") {\n              id\n              value\n            }\n          }\n        }\n      ": {return: GetDeliveryCustomizationQuery, variables: GetDeliveryCustomizationQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n      mutation populateProduct($product: ProductCreateInput!) {\n        productCreate(product: $product) {\n          product {\n            id\n            title\n            handle\n            status\n            variants(first: 10) {\n              edges {\n                node {\n                  id\n                  price\n                  barcode\n                  createdAt\n                }\n              }\n            }\n          }\n        }\n      }": {return: PopulateProductMutation, variables: PopulateProductMutationVariables},
  "#graphql\n    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {\n      productVariantsBulkUpdate(productId: $productId, variants: $variants) {\n        productVariants {\n          id\n          price\n          barcode\n          createdAt\n        }\n      }\n    }": {return: ShopifyRemixTemplateUpdateVariantMutation, variables: ShopifyRemixTemplateUpdateVariantMutationVariables},
  "#graphql\n        mutation updateDeliveryCustomization($id: ID!, $input: DeliveryCustomizationInput!) {\n          deliveryCustomizationUpdate(id: $id, deliveryCustomization: $input) {\n            deliveryCustomization {\n              id\n            }\n            userErrors {\n              message\n            }\n          }\n        }\n      ": {return: UpdateDeliveryCustomizationMutation, variables: UpdateDeliveryCustomizationMutationVariables},
  "#graphql\n        mutation createDeliveryCustomization($input: DeliveryCustomizationInput!) {\n          deliveryCustomizationCreate(deliveryCustomization: $input) {\n            deliveryCustomization {\n              id\n            }\n            userErrors {\n              message\n            }\n          }\n        }\n      ": {return: CreateDeliveryCustomizationMutation, variables: CreateDeliveryCustomizationMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
