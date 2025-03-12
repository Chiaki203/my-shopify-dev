import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
// import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      console.log("Received CUSTOMERS_DATA_REQUEST webhook");
      break;
    case "CUSTOMERS_REDACT":
      console.log("Received CUSTOMERS_REDACT webhook");
      break;
    case "SHOP_REDACT":
      console.log("Received SHOP_REDACT webhook");
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  // if (session) {
  //   await db.session.deleteMany({ where: { shop } });
  // }

  return new Response();
};
