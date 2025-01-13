import { json } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { cors } = await authenticate.admin(request);
  const productIssues = [
    { title: "Too big", description: "The product was too big." },
    { title: "Too small", description: "The product was too small." },
    {
      title: "Just right",
      description:
        "The product was just right, but the customer is still unhappy.",
    },
  ];
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") as string;
  console.log("recommend issue productId", productId);
  var splitStr = productId.split("/");
  var idNumber = parseInt(splitStr[splitStr.length - 1]);
  console.log(
    "idNumber % productIssues.length",
    idNumber % productIssues.length,
  );
  const issue = productIssues[idNumber % productIssues.length];
  return cors(json({ productIssue: issue }));
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { cors } = await authenticate.admin(request);
  console.log("fetch request", request);

  return cors(json({ productIssue: "issue" }));
};
