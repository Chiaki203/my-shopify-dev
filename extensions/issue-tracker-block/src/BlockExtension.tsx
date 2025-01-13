import {
  reactExtension,
  useApi,
  AdminBlock,
  Text,
  InlineStack,
  ProgressIndicator,
  Form,
  Divider,
  Box,
  Select,
  Button,
  Icon,
} from "@shopify/ui-extensions-react/admin";
import { useEffect, useMemo, useState } from "react";
import { getIssues, updateIssues } from "./utils";

type IssuesType = {
  id: number;
  completed: boolean;
  title: string;
  description: string;
};

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.block.render";

export default reactExtension(TARGET, () => <App />);

const PAGE_SIZE = 3;

const App = () => {
  const { data, i18n, navigation } = useApi(TARGET);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>([]);
  const [issues, setIssues] = useState<IssuesType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const productId = data.selected[0].id;
  const issuesCount = issues.length;
  const totalPages = issuesCount / PAGE_SIZE;
  const paginatedIssues = useMemo(() => {
    if (issuesCount <= PAGE_SIZE) {
      return issues;
    }
    return [...issues].slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
  }, [currentPage, issues, issuesCount]);
  const handleChange = async (id: number, value: string) => {
    setIssues((currentIssues) => {
      const newIssues = [...currentIssues];
      const editingIssueIndex = newIssues.findIndex(
        (listIssue) => listIssue.id === id,
      );
      newIssues[editingIssueIndex] = {
        ...newIssues[editingIssueIndex],
        completed: value === "completed" ? true : false,
      };
      return newIssues;
    });
  };
  const handleDelete = async (id: number) => {
    const newIssues = issues.filter((issue) => issue.id !== id);
    setIssues(newIssues);
    await updateIssues(productId, newIssues);
  };
  const onSubmit = async () => {
    await updateIssues(productId, issues);
  };
  const onReset = () => {};
  useEffect(() => {
    const getProductInfo = async () => {
      const productData = await getIssues(productId);
      console.log("getIssues productData", productData);
      setLoading(false);
      if (productData?.data?.product?.variants?.edges.length > 1) {
        setShouldRender(true);
      }
      if (productData?.data?.product?.metafield?.value) {
        const parsedIssues = JSON.parse(
          productData.data.product.metafield.value,
        );
        setInitialValues(
          parsedIssues.map(({ completed }) => Boolean(completed)),
        );
        console.log("initialValues", initialValues);
        setIssues(parsedIssues);
      }
    };
    getProductInfo();
  }, [productId]);
  const blockMarkup = loading ? (
    <InlineStack blockAlignment="center">
      <ProgressIndicator size="large-100" />
    </InlineStack>
  ) : (
    <>
      <Text>Issues</Text>
      <Form id={`issues-form`} onSubmit={onSubmit} onReset={onReset}>
        {issues.length ? (
          <>
            {paginatedIssues.map(
              ({ id, completed, title, description }, index) => (
                <>
                  {index > 0 && <Divider />}
                  <Box key={id} padding="base small">
                    <InlineStack
                      blockAlignment="center"
                      inlineSize="100%"
                      gap="none"
                    >
                      <Box inlineSize="53%" paddingInlineEnd="large">
                        {/* <Box> */}
                        <Box inlineSize="100%">
                          <Text fontWeight="bold" textOverflow="ellipsis">
                            {title}
                          </Text>
                        </Box>
                        <Box inlineSize="100%">
                          <Text textOverflow="ellipsis">{description}</Text>
                        </Box>
                      </Box>
                      <Box inlineSize="22%">
                        {/* <Box> */}
                        <Select
                          label="Status"
                          name="status"
                          value={completed ? "completed" : "todo"}
                          onChange={(value) => handleChange(id, value)}
                          options={[
                            { label: "Todo", value: "todo" },
                            { label: "Completed", value: "completed" },
                          ]}
                        />
                      </Box>
                      <Box inlineSize="25%">
                        {/* <Box> */}
                        <InlineStack
                          inlineSize="100%"
                          inlineAlignment="end"
                          blockAlignment="center"
                          gap="base"
                        >
                          <Button
                            variant="tertiary"
                            onPress={() =>
                              navigation?.navigate(
                                `extension:issue-tracker-action?issueId=${id}`,
                              )
                            }
                          >
                            <Icon name="EditMajor" />
                          </Button>
                          <Button
                            onPress={() => handleDelete(id)}
                            variant="tertiary"
                          >
                            <Icon name="DeleteMinor" />
                          </Button>
                        </InlineStack>
                      </Box>
                    </InlineStack>
                  </Box>
                </>
              ),
            )}
            <InlineStack
              paddingBlockStart="large"
              blockAlignment="center"
              inlineAlignment="center"
            >
              <Button
                onPress={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeftMinor" />
              </Button>
              <InlineStack
                inlineSize={25}
                blockAlignment="center"
                inlineAlignment="center"
              >
                <Text>{currentPage}</Text>
              </InlineStack>
              <Button
                onPress={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                <Icon name="ChevronRightMinor" />
              </Button>
            </InlineStack>
          </>
        ) : (
          <>
            <Box paddingBlockEnd="large">
              <Text fontWeight="bold">No issues for this product</Text>
            </Box>
            <Button
              onPress={() =>
                navigation?.navigate("extension:issue-tracker-action")
              }
            >
              Add your first issue
            </Button>
          </>
        )}
      </Form>
    </>
  );
  return (
    <AdminBlock
      title={i18n.translate("name")}
      summary={!shouldRender ? "Not enough product variants" : null}
    >
      {shouldRender ? blockMarkup : null}
    </AdminBlock>
  );
};

// function App() {
//   // The useApi hook provides access to several useful APIs like i18n and data.
//   const {i18n, data} = useApi(TARGET);
//   console.log({data});

//   return (
//     // The AdminBlock component provides an API for setting the title of the Block extension wrapper.
//     <AdminBlock title="My Block Extension">
//       <BlockStack>
//         <Text fontWeight="bold">{i18n.translate('welcome', {TARGET})}</Text>
//       </BlockStack>
//     </AdminBlock>
//   );
// }
