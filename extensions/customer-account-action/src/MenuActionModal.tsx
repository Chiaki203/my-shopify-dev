import {
  Button,
  CustomerAccountAction,
  Form,
  reactExtension,
  Select,
  useApi,
  useAuthenticatedAccountCustomer,
  useAuthenticatedAccountPurchasingCompany,
} from "@shopify/ui-extensions-react/customer-account";
import { useState } from "react";

export default reactExtension("customer-account.order.action.render", () => (
  <MenuActionModal />
));

const dtcOptions = [
  { value: "1", label: "Package item is damaged" },
  { value: "2", label: "Missing items" },
  { value: "3", label: "Wrong item was sent" },
  { value: "4", label: "Item arrived too late" },
  { value: "5", label: "Never received item" },
];

const b2bOptions = dtcOptions.concat([
  { value: "6", label: "Package sent to the wrong company location" },
]);

function MenuActionModal() {
  const { close, authenticatedAccount, ui } =
    useApi<"customer-account.order.action.render">();
  const [currentProblem, setCurrentProblem] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useAuthenticatedAccountCustomer();
  const purchasingCompany = useAuthenticatedAccountPurchasingCompany();
  // const isB2BCustomer = authenticatedAccount.purchasingCompany.current !== null;
  const isB2BCustomer = purchasingCompany !== undefined;
  console.log("purchasingCompany", purchasingCompany);
  console.log("customerId", id);
  console.log("authenticatedAccount", authenticatedAccount);
  console.log("isB2BCustomer", isB2BCustomer);
  const onSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("currentProblem", currentProblem);
      close();
      ui.toast.show("Selection saved");
    }, 2000);
  };
  return (
    <CustomerAccountAction
      title="Report a problem"
      primaryAction={
        <Button loading={isLoading} onPress={onSubmit}>
          Report
        </Button>
      }
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >
      <Form onSubmit={() => {}}>
        <Select
          label="Select a problem"
          options={isB2BCustomer ? b2bOptions : dtcOptions}
          value={currentProblem}
          onChange={(value) => setCurrentProblem(value)}
        />
      </Form>
    </CustomerAccountAction>
  );
}
