import { reactExtension } from "@shopify/ui-extensions-react/admin";
import PurchaseOptionsActionExtension from "./PurchaseOptionsActionExtension";

export default reactExtension("admin.product-details.action.render", () => (
  <PurchaseOptionsActionExtension extension="admin.product-details.action.render" />
));
