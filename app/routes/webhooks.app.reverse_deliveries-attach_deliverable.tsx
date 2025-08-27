import { authenticate } from "../shopify.server";
import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  console.log("webhoook request", request);
  console.log("request url", request.url);
  console.log("webhook payload", payload);

  console.log(`Received ${topic} webhook for ${shop}`);

  return new Response();
};
