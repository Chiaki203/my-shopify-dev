import { useEffect, useState, useCallback } from "react";
import {
  reactExtension,
  useApi,
  AdminAction,
  Button,
  TextArea,
  TextField,
  BlockStack,
  Banner,
  Text,
  InlineStack,
  ProgressIndicator,
} from "@shopify/ui-extensions-react/admin";
import { getIssues, updateIssues } from "./utils";

type IssuesType = {
  id?: number | undefined;
  completed?: boolean;
  title: string;
  description: string;
};

const generateId = (allIssues) => {
  return !allIssues.length ? 0 : allIssues[allIssues.length - 1].id + 1;
};

const validateForm = ({ title, description }) => {
  return {
    isValid: Boolean(title) && Boolean(description),
    errors: {
      title: !title,
      description: !description,
    },
  };
};

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
const TARGET = "admin.product-details.action.render";

export default reactExtension(TARGET, () => <App />);

const App = () => {
  const { data, close, intents } = useApi(TARGET);
  const issueId = intents?.launchUrl
    ? new URL(intents.launchUrl).searchParams?.get("issueId")
    : null;

  if (issueId) {
    console.log("intents.launchUrl", intents.launchUrl);
    console.log("new URL(intents.launchUrl)", new URL(intents.launchUrl));
  }
  const [loadingInfo, setLoadingInfo] = useState(issueId ? true : false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [issue, setIssue] = useState<IssuesType>({
    title: "",
    description: "",
    id: undefined,
  });
  const [allIssues, setAllIssues] = useState<IssuesType[]>([]);
  const [formErrors, setFormErrors] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { title, description, id } = issue;
  // const isEditing = id !== undefined;
  useEffect(() => {
    getIssues(data.selected[0].id).then((issues) => {
      setLoadingInfo(false);
      setAllIssues(issues || []);
    });
  }, [data.selected]);
  const getIssueRecommendation = useCallback(async () => {
    setLoadingRecommended(true);
    console.log("data.selected[0].id", data.selected[0].id);
    const res = await fetch(
      `api/recommendedProductIssue?productId=${data.selected[0].id}`,
    );
    setLoadingRecommended(false);
    if (!res.ok) {
      console.error("Network error");
    }
    const json = await res.json();
    if (json?.productIssue) {
      console.log("json", json);
      setIssue(json.productIssue);
    }
  }, [data.selected]);
  const onSubmit = useCallback(async () => {
    const { isValid, errors } = validateForm(issue);
    setFormErrors(errors);
    console.log("formErrors", formErrors);
    if (isValid) {
      const newIssues = [...allIssues];
      if (isEditing) {
        const editingIssueIndex = newIssues.findIndex(
          (listIssue) => listIssue.id === id,
        );
        newIssues[editingIssueIndex] = {
          ...issue,
          title,
          description,
        };
      } else {
        newIssues.push({
          id: generateId(allIssues),
          title,
          description,
          completed: false,
        });
      }
      const updateIssuesRes = await updateIssues(
        data.selected[0].id,
        newIssues,
      );
      console.error("updateIssuesRes", updateIssuesRes);
      close();
    }
  }, [issue, data.selected, allIssues, close]);
  useEffect(() => {
    if (issueId) {
      const editingIssue = allIssues.find(
        (issue) => issue.id === Number(issueId),
      );
      if (editingIssue) {
        setIssue(editingIssue);
        setIsEditing(true);
      }
    } else {
      setIsEditing(false);
    }
  }, [issueId, allIssues]);
  if (loadingInfo) {
    return <></>;
  }
  return (
    <AdminAction
      title={isEditing ? "Edit your issue" : "Create an issue"}
      primaryAction={
        <Button onPress={onSubmit}>{isEditing ? "Save" : "Create"}</Button>
      }
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >
      <BlockStack gap="base">
        <Banner tone="default">
          <BlockStack gap="base">
            <Text>
              Automatically fill the issue based on past customer feedback
            </Text>
            <InlineStack blockAlignment="center" gap="base">
              <Button
                onPress={getIssueRecommendation}
                disabled={loadingRecommended}
              >
                Generate issue
              </Button>
              {loadingRecommended && <ProgressIndicator size="small-100" />}
            </InlineStack>
          </BlockStack>
        </Banner>
        <TextField
          value={title}
          error={formErrors?.title ? "Please enter a title" : undefined}
          onChange={(val) => setIssue((prev) => ({ ...prev, title: val }))}
          label="Title"
          maxLength={50}
        />
        <TextArea
          label="Description"
          value={description}
          error={
            formErrors?.description ? "Please enter a description" : undefined
          }
          maxLength={300}
          onChange={(val) =>
            setIssue((prev) => ({ ...prev, description: val }))
          }
        />
      </BlockStack>
    </AdminAction>
  );
};

// function App() {
//   // The useApi hook provides access to several useful APIs like i18n, close, and data.
//   const { i18n, close, data } = useApi(TARGET);
//   console.log({ data });
//   const [productTitle, setProductTitle] = useState("");
//   // Use direct API calls to fetch data from Shopify.
//   // See https://shopify.dev/docs/api/admin-graphql for more information about Shopify's GraphQL API
//   useEffect(() => {
//     (async function getProductInfo() {
//       const getProductQuery = {
//         query: `query Product($id: ID!) {
//           product(id: $id) {
//             title
//           }
//         }`,
//         variables: { id: data.selected[0].id },
//       };

//       const res = await fetch("shopify:admin/api/graphql.json", {
//         method: "POST",
//         body: JSON.stringify(getProductQuery),
//       });

//       if (!res.ok) {
//         console.error("Network error");
//       }

//       const productData = await res.json();
//       setProductTitle(productData.data.product.title);
//     })();
//   }, [data.selected]);
//   return (
//     // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
//     <AdminAction
//       primaryAction={
//         <Button
//           onPress={() => {
//             console.log("saving");
//             close();
//           }}
//         >
//           Done
//         </Button>
//       }
//       secondaryAction={
//         <Button
//           onPress={() => {
//             console.log("closing");
//             close();
//           }}
//         >
//           Close
//         </Button>
//       }
//     >
//       <BlockStack>
//         {/* Set the translation values for each supported language in the locales directory */}
//         <Text fontWeight="bold">{i18n.translate("welcome", { TARGET })}</Text>
//         <Text>Current product: {productTitle}</Text>
//       </BlockStack>
//     </AdminAction>
//   );
// }
