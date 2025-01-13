// type IssuesType = {
//   id: number;
//   completed: boolean;
//   title: string;
//   description: string;
// };

export async function updateIssues(id, newIssues) {
  // This example uses metafields to store the data. For more information, refer to https://shopify.dev/docs/apps/custom-data/metafields.
  return await makeGraphQLQuery(
    `mutation SetMetafield($namespace: String!, $ownerId: ID!, $key: String!, $type: String!, $value: String!) {
    metafieldDefinitionCreate(
      definition: {namespace: $namespace, key: $key, name: "Tracked Issues", ownerType: PRODUCT, type: $type, access: {admin: MERCHANT_READ_WRITE}}
    ) {
      createdDefinition {
        id
      }
    }
    metafieldsSet(metafields: [{ownerId:$ownerId, namespace:$namespace, key:$key, type:$type, value:$value}]) {
      userErrors {
        field
        message
        code
      }
    }
  }
  `,
    {
      ownerId: id,
      namespace: "$app:issues",
      key: "issues",
      type: "json",
      value: JSON.stringify(newIssues),
    },
  );
}

export const getIssues = async (productId: string) => {
  const res = await makeGraphQLQuery(
    `query Product($id:ID!) {
      product(id:$id) {
        metafield(namespace:"$app:issues", key:"issues") {
          value
        }
      }
    }
    `,
    { id: productId },
  );
  if (res?.data?.product?.metafield?.value) {
    return JSON.parse(res.data.product.metafield.value);
  }
};

const makeGraphQLQuery = async (query: string, variables: any) => {
  const graphQLQuery = {
    query,
    variables,
  };
  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });
  if (!res.ok) {
    console.log("Network error");
  }
  return await res.json();
};

export const getProductVariants = async (data) => {
  const getProductQuery = {
    query: `query Product($id:ID!) {
      product(id:$id) {
        title
        variants(first:2) {
          edges {
            node {
              id
            }
          }
        }
      }
    }`,
    variables: { id: data.selected[0].id },
  };
  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(getProductQuery),
  });
  if (!res.ok) {
    console.error("Network error");
  }
  const productData = await res.json();
  return productData.data.product.variants;
};
