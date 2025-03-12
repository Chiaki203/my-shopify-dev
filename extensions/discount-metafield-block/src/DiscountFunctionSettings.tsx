import {
  reactExtension,
  useApi,
  BlockStack,
  FunctionSettings,
  Section,
  // Text,
  Form,
  NumberField,
  Box,
  TextField,
  Heading,
  InlineStack,
  Link,
  Button,
  Icon,
  Divider,
  ProgressIndicator,
} from "@shopify/ui-extensions-react/admin";

import { useState, useEffect, useMemo } from "react";
const TARGET = "admin.discount-details.function-settings.render";

export default reactExtension(TARGET, async (api) => {
  const existingDefinition = await getMetafieldDefinition(api.query);
  console.log("existingDefinition", existingDefinition);
  if (!existingDefinition) {
    // Create a metafield definition for persistence if no pre-existing definition exists
    const metafieldDefinition = await createMetafieldDefinition(api.query);
    console.log("createMetafieldDefinition", metafieldDefinition);

    if (!metafieldDefinition) {
      throw new Error("Failed to create metafield definition");
    }
  }
  return <App />;
});

function CollectionField({ defaultValue, value, onChange }) {
  console.log("CollectionField defaultValue", defaultValue);
  console.log("CollectionField value", value);
  return (
    <Box display="none">
      <TextField
        label="Collection"
        defaultValue={defaultValue}
        // value={
        //   value !== undefined ? value.map((collection) => collection.id) : []
        // }
        value={value.map((collection) => collection.id)}
        onChange={onChange}
      />
    </Box>
  );
}

function PercentageField({ defaultValue, value, onChange, i18n }) {
  return (
    <Box paddingBlockEnd="base">
      <BlockStack gap="base">
        <Heading size={4}>{i18n.translate("description")}</Heading>
        <NumberField
          label={i18n.translate("discountPercentage")}
          name="percentage"
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          suffix="%"
          // autocomplete={true}
        />
      </BlockStack>
    </Box>
  );
}

function App() {
  const {
    loading,
    applyExtensionMetafieldChange,
    i18n,
    initialSelectedCollections,
    initialPercentage,
    onPercentageValueChange,
    percentage,
    resetForm,
    selectedCollections,
    onSelectCollections,
    handleRemoveCollection,
  } = useExtensionData();
  return (
    <FunctionSettings onSave={applyExtensionMetafieldChange}>
      <Form onReset={resetForm} onSubmit={() => {}}>
        <Section>
          <CollectionField
            defaultValue={initialSelectedCollections}
            value={selectedCollections}
            onChange={onSelectCollections}
          />
          <PercentageField
            value={percentage}
            defaultValue={initialPercentage}
            onChange={onPercentageValueChange}
            i18n={i18n}
          />
        </Section>
        <Section padding="base">
          <Box padding="base none">
            <CollectionsSection
              i18n={i18n}
              loading={loading}
              onClickAdd={onSelectCollections}
              onClickRemove={handleRemoveCollection}
              selectedCollections={selectedCollections}
            />
          </Box>
        </Section>
      </Form>
    </FunctionSettings>
  );
}

function CollectionsSection({
  i18n,
  loading,
  onClickAdd,
  onClickRemove,
  selectedCollections,
}) {
  const collectionRows =
    selectedCollections && selectedCollections.length > 0
      ? selectedCollections.map((collection) => (
          <BlockStack key={collection.id} gap="base">
            <InlineStack
              blockAlignment="center"
              inlineAlignment="space-between"
            >
              <Link
                href={`shopify://admin/collections/${collection.id.split("/").pop()}`}
                tone="inherit"
                target="_blank"
              >
                {collection.title}
              </Link>
              <Button
                variant="tertiary"
                onClick={() => onClickRemove(collection.id)}
              >
                <Icon name="CircleCancelMajor" />
              </Button>
            </InlineStack>
            <Divider />
          </BlockStack>
        ))
      : null;
  return (
    <Section>
      <BlockStack gap="base">
        {loading ? (
          <InlineStack gap inlineAlignment="center" padding="base">
            <ProgressIndicator size="base" />
          </InlineStack>
        ) : null}
        {collectionRows}
        <Button onClick={onClickAdd}>
          <InlineStack
            blockAlignment="center"
            inlineAlignment="start"
            gap="base"
          >
            <Icon name="CirclePlusMajor" />
            {i18n.translate("addCollections")}
          </InlineStack>
        </Button>
      </BlockStack>
    </Section>
  );
}

function useExtensionData() {
  const { i18n, query, applyMetafieldChange, data, resourcePicker } =
    useApi(TARGET);
  const initialMetafields = useMemo(
    () => data?.metafields || [],
    [data?.metafields],
  );
  console.log("admin.discount-details.function-settings.render data", data);
  console.log("initial metafields", initialMetafields);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [savedMetafields] = useState(initialMetafields);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [initialCollectionIds, setInitialCollectionIds] = useState([]);
  const [initialSelectedCollections, setInitialSelectedCollections] = useState(
    [],
  );
  const [initialPercentage, setInitialPercentage] = useState(0);
  console.log("initialPercentage", initialPercentage);
  console.log("initialSelectedCollections", initialSelectedCollections);
  console.log("selectedCollections", selectedCollections);
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      if (!selectedCollections) {
        return;
      }
      const transferPercentage = parsePercentageMetafield(
        savedMetafields.find(
          (metafield) => metafield.key === "function-configuration",
        )?.value,
      );
      setInitialPercentage(Number(transferPercentage));
      setPercentage(Number(transferPercentage));
      const transferExcludedCollectionIds =
        parseTransferExcludedCollectionIdsMetafield(
          savedMetafields.find(
            (metafield) => metafield.key === "function-configuration",
          )?.value,
        );
      setInitialCollectionIds(transferExcludedCollectionIds);
      await getCollectionTitles(transferExcludedCollectionIds, query).then(
        (results) => {
          const collections = results.data.nodes.map((collection) => ({
            id: collection.id,
            title: collection.title,
          }));
          setSelectedCollections(collections);
          setInitialSelectedCollections(collections);
          return;
        },
      );
      setLoading(false);
    }
    fetchInitialData();
  }, [initialMetafields]);
  const onPercentageValueChange = async (value) => {
    setPercentage(Number(value));
  };
  const onSelectCollections = async () => {
    const selection = await resourcePicker({
      type: "collection",
      selectionIds: selectedCollections.map((collection) => ({
        id: collection.id,
      })),
      action: "select",
      filter: {
        archived: true,
        variants: true,
      },
      // multiple: true,
    });
    console.log("onSelectCollections", selection);
    if (selection === undefined) {
      return;
    }
    setSelectedCollections(selection);
  };
  const applyExtensionMetafieldChange = async () => {
    const commitFormValues = {
      percentage: Number(percentage),
      collections: selectedCollections.map((collection) => collection.id),
    };
    await applyMetafieldChange({
      type: "updateMetafield",
      namespace: "$app:example-discounts--ui-extension",
      key: "function-configuration",
      value: JSON.stringify(commitFormValues),
      valueType: "json",
    });
  };
  const handleRemoveCollection = async (id) => {
    const updatedCollections = selectedCollections.filter(
      (collection) => collection.id !== id,
    );
    setSelectedCollections(updatedCollections);
  };
  return {
    loading,
    applyExtensionMetafieldChange,
    i18n,
    initialSelectedCollections: initialCollectionIds,
    initialPercentage,
    onPercentageValueChange,
    percentage,
    resetForm: () => {
      setPercentage(initialPercentage);
      setSelectedCollections(initialSelectedCollections);
    },
    selectedCollections,
    onSelectCollections,
    handleRemoveCollection,
  };
}

const METAFIELD_NAMESPACE = "$app:example-discounts--ui-extension";
const METAFIELD_KEY = "function-configuration";

async function getMetafieldDefinition(adminApiQuery) {
  const query = `#graphql
    query GetMetafieldDefinition {
      metafieldDefinitions(first:1, ownerType: DISCOUNT, namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
        nodes {
          id
          name
        }
      }
    }
  `;
  const result = await adminApiQuery(query);
  return result?.data?.metafieldDefinitions?.nodes[0];
}

async function createMetafieldDefinition(adminApiQuery) {
  const definition = {
    access: {
      admin: "MERCHANT_READ_WRITE",
    },
    key: METAFIELD_KEY,
    name: "Discount Configuration",
    namespace: METAFIELD_NAMESPACE,
    ownerType: "DISCOUNT",
    type: "json",
  };
  const query = `#graphql
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
        }
      }
    }
  `;
  const variables = { definition };
  const result = await adminApiQuery(query, { variables });
  return result?.data?.metafieldDefinitionCreate?.createdDefinition;
}

async function getCollectionTitles(collectionIds, adminApiQuery) {
  return adminApiQuery(
    `{
      nodes(ids:${JSON.stringify(collectionIds)}) {
        ... on Collection {
          id
          title
          description
        }
      }
    }`,
  );
}

function parseTransferExcludedCollectionIdsMetafield(value) {
  try {
    return JSON.parse(value).collections;
  } catch {
    return [];
  }
}

function parsePercentageMetafield(value) {
  try {
    return JSON.parse(value).percentage;
  } catch {
    return 0;
  }
}
// function PercentageField({ defaultValue, value, onChange, i18n }) {
//   return (
//     <Box paddingBlockEnd="300">
//       <BlockStack gap="base">
//         <Text variant="headingMd" as="h2">
//           {i18n.translate('description')}
//         </Text>
//         <NumberField
//           label={i18n.translate('discountPercentage')}
//           name="percentage"
//           autoComplete="on"
//           value={value}
//           defaultValue={defaultValue}
//           onChange={onChange}
//           suffix="%"
//         />
//       </BlockStack>
//     </Box>
//   );
// }

// function App() {
//   const {
//     loading,
//     applyExtensionMetafieldChange,
//     i18n,
//     initialPercentage,
//     onPercentageValueChange,
//     percentage,
//     resetForm
//   } = useExtensionData();
//   return (
//     <FunctionSettings onSave={applyExtensionMetafieldChange}>
//     <Form onReset={resetForm}>
//         <Section>
//           <PercentageField
//             value={percentage}
//             defaultValue={initialPercentage}
//             onChange={onPercentageValueChange}
//             i18n={i18n}
//           />
//         </Section>
//       </Form>
//     </FunctionSettings>
//   );
// }

// function useExtensionData() {
//   const { applyMetafieldChange, i18n, data } = useApi(TARGET);
//   const initialMetafields = data?.metafields || [];
//   const [loading, setLoading] = useState(false);
//   const [percentage, setPercentage] = useState(0);
//   const [savedMetafields] = useState(initialMetafields);
//   const [initialPercentage, setInitialPercentage] = useState(0);

//   useEffect(() => {
//     async function fetchInitialData() {
//       setLoading(true);

//       const transferPercentage = parsePercentageMetafield(
//         savedMetafields.find(
//           (metafield) => metafield.key === 'function-configuration'
//         )?.value
//       );
//       setInitialPercentage(Number(transferPercentage));
//       setPercentage(Number(transferPercentage));

//       setLoading(false);
//     }
//     fetchInitialData();
//   }, [initialMetafields]);

//   const onPercentageValueChange = async (value) => {
//     setPercentage(Number(value));
//   };

//   async function applyExtensionMetafieldChange() {
//     const commitFormValues = {
//       percentage: Number(percentage),
//     };
//     await applyMetafieldChange({
//       type: 'updateMetafield',
//       namespace: '$app:example-discounts--ui-extension',
//       key: 'function-configuration',
//       value: JSON.stringify(commitFormValues),
//       valueType: 'json',
//     });
//   }

//   return {
//     loading,
//     applyExtensionMetafieldChange,
//     i18n,
//     initialPercentage,
//     onPercentageValueChange,
//     percentage,
//     resetForm: () => setPercentage(initialPercentage)
//   };
// }

// const METAFIELD_NAMESPACE = '$app:example-discounts--ui-extension';
// const METAFIELD_KEY = 'function-configuration';
// async function getMetafieldDefinition(adminApiQuery) {
//   const query = `#graphql
//     query GetMetafieldDefinition {
//       metafieldDefinitions(first: 1, ownerType: DISCOUNT, namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
//         nodes {
//           id
//         }
//       }
//     }
//   `;

//   const result = await adminApiQuery(query);

//   return result?.data?.metafieldDefinitions?.nodes[0];
// }
// async function createMetafieldDefinition(adminApiQuery) {
//   const definition = {
//     access: {
//       admin: 'MERCHANT_READ_WRITE',
//     },
//     key: METAFIELD_KEY,
//     name: 'Discount Configuration',
//     namespace: METAFIELD_NAMESPACE,
//     ownerType: 'DISCOUNT',
//     type: 'json',
//   };

//   const query = `#graphql
//     mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
//       metafieldDefinitionCreate(definition: $definition) {
//         createdDefinition {
//             id
//           }
//         }
//       }
//   `;

//   const variables = { definition };
//   const result = await adminApiQuery(query, { variables });

//   return result?.data?.metafieldDefinitionCreate?.createdDefinition;
// }

// function parsePercentageMetafield(value) {
//   try {
//     return JSON.parse(value).percentage;
//   } catch {
//     return 0;
//   }
// }
