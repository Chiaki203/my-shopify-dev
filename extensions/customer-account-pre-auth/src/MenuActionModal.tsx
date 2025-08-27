// import {
//   BlockStack,
//   Button,
//   CustomerAccountAction,
//   Form,
//   InlineStack,
//   reactExtension,
//   TextField,
//   useApi,
// } from "@shopify/ui-extensions-react/customer-account";
// import { useState } from "react";

// export default reactExtension("customer-account.order.action.render", () => (
//   <MenuActionModal />
// ));

// function MenuActionModal() {
//   const api = useApi<"customer-account.order.action.render">();
//   const [note, setNote] = useState("");
//   return (
//     <CustomerAccountAction title={"Add a note to the order"}>
//       <Form
//         onSubmit={() => {
//           try {
//             console.log("note added:", note);
//           } catch (error) {
//             console.log("error", error);
//           } finally {
//             api.close();
//           }
//         }}
//       >
//         <BlockStack>
//           <TextField
//             value={note}
//             onChange={(value) => setNote(value)}
//             multiline={3}
//             label="Note for the order"
//           />
//           <InlineStack inlineAlignment={"end"}>
//             <Button onPress={() => api.close()} kind="secondary">
//               Cancel
//             </Button>
//             <Button kind="primary" accessibilityRole="submit">
//               Add note
//             </Button>
//           </InlineStack>
//         </BlockStack>
//       </Form>
//     </CustomerAccountAction>
//   );
// }
