import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
// import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // const { cors } = await authenticate.admin(request);

  // const { session } = await authenticate.public.appProxy(request);
  // console.log("proxy route session", session);
  console.log("proxy route session");
  return json(
    { hello: "world" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
  // return json({ shop: session?.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // const { cors } = await authenticate.admin(request);

  // const { session } = await authenticate.public.appProxy(request);
  // console.log("proxy route session", session);
  console.log("web pixel fetch");
  const data = await request.json();
  // const { cors } = await authenticate.admin(request);
  console.log("fetch request", data);
  return json(
    { hello: "world" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
  // return json({ shop: session?.shop });

  // return cors(json({ productIssue: "issue" }));
};
