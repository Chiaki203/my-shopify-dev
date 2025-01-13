export const updateLoyaltyPoints = async (
  segmentId: string,
  points: number,
) => {
  const customerIds = await getCustomerIds(segmentId);
  const metaFieldRes = await makeGraphQLQuery(
    `mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldDefinitionCreate(
        definition: {namespace: "$app:customerLoyalty", key: "points", name: "Loyalty points", ownerType: CUSTOMER, type: "number_integer", access: {admin: MERCHANT_READ_WRITE}}
      ) {
        createdDefinition {
          id
          name
        }
      }
      metafieldsSet(metafields: $metafields) {
        userErrors {
          field
          message
          code
        }
      }
    }
  `,
    {
      metafields: customerIds.map((customerId: string) => ({
        ownerId: customerId,
        namespace: "$app:customerLoyalty",
        key: "points",
        type: "number_integer",
        value: points.toString(),
      })),
    },
  );
  console.log("metaFieldRes", metaFieldRes);
  return metaFieldRes;
};

const getCustomerIds = async (segmentId: string) => {
  const response = await makeGraphQLQuery(
    `
      query Segment($id:ID!) {
        customerSegmentMembers(first: 10, segmentId:$id) {
          edges {
            node {
              id
              firstName
            }
          }
        }
      }
    `,
    { id: segmentId },
  );
  const customerData = response.data.customerSegmentMembers.edges.map(
    (edge: any) => edge.node,
  );
  console.log("customerData", customerData);
  return customerData.map((customer: any) => customer.id);
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
    console.error("Network error");
  }

  return await res.json();
};
