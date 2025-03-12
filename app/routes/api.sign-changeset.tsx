import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { authenticate } from "app/shopify.server";
import { getSelectedOffer } from "app/offer.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.checkout(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors } = await authenticate.public.checkout(request);
  const body = await request.json();
  const selectedOffer = getSelectedOffer(body.changes);
  const payload = {
    iss: process.env.SHOPIFY_API_KEY,
    jti: uuidv4(),
    iat: Date.now(),
    sub: body.referenceId,
    changes: selectedOffer?.changes,
  };
  console.log("SHOPIFY_API_SECRET", process.env.SHOPIFY_API_SECRET);
  const token = jwt.sign(payload, process.env.SHOPIFY_API_SECRET!);
  console.log("api.sign-changeset token", token);
  return cors(json({ token }));
};
