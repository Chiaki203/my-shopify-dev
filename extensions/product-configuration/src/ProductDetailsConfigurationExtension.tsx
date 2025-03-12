import {
  reactExtension,
  useApi,
  BlockStack,
  Text,
} from '@shopify/ui-extensions-react/admin';
import {useState, useEffect} from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
export default reactExtension('admin.product-details.configuration.render', () => <App />);

function App() {
  
  const {extension: {target}, i18n} = useApi<'admin.product-details.configuration.render'>();
  
  const product = useProduct();
  return (
    <BlockStack>
      <Text>
        {i18n.translate('welcome', {target})}
      </Text>
      {product?.bundleComponents.map((component) =>
        <Text key={component.id}>{component.title}</Text>
      )}
    </BlockStack>
  );
}

function useProduct() {
  
  const {data, query} = useApi<'admin.product-details.configuration.render'>();
  const productId = (data as any)?.selected[0].id;
  const [product, setProduct] = useState<{
    id: string;
    title: string;
    bundleComponents: {
      id: string;
      title: string;
    }[];
  }>(null);
  

  useEffect(() => {
    query(
      `#graphql
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          bundleComponents(first: 100) {
            nodes {
              componentProduct {
                id
                title
              }
            }
          }
        }
      }
      `,
      {variables: {id: productId}}
    ).then(({data, errors}) => {
      if (errors) {
        console.error(errors);
      } else {
        
        const {bundleComponents, ...product} = (data as {
          product: {
            id: string;
            title: string;
            bundleComponents: {
              nodes: {
                componentProduct: {
                  id: string;
                  title: string;
                }
              }[]
            }
          }
        }).product;
        
        setProduct({
          ...product,
          bundleComponents: bundleComponents.nodes.map(({componentProduct}) => ({
            ...componentProduct
          }))
        })
      }
    })
  }, [productId, query]);

  return product;
}