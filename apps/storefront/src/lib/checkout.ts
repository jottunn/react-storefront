"use server";
import { cookies } from "next/headers";
import {
  CreateCheckoutDocument,
  CheckoutFindDocument,
  CheckoutFindQuery,
  CreateCheckoutMutation,
} from "@/saleor/api";
import { executeGraphQL } from "@/lib/graphql";
import { DEFAULT_LOCALE } from "./regions";

export async function getIdFromCookies(channel: string) {
  const cookieName = `checkoutId-${channel}`;
  const checkoutId = cookies().get(cookieName)?.value || "";
  return checkoutId;
}

export async function saveIdToCookie(channel: string, checkoutId: string) {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || "";
  const shouldUseHttps = storefrontUrl.startsWith("https");
  console.log("shouldUseHttps", shouldUseHttps);
  const cookieName = `checkoutId-${channel}`;
  cookies().set(cookieName, checkoutId, {
    sameSite: "lax",
    secure: shouldUseHttps || false,
  });
}

export async function find(checkoutId: string) {
  try {
    const { checkout } = checkoutId
      ? await executeGraphQL<CheckoutFindQuery, { id: string; locale: string }>(
          CheckoutFindDocument,
          {
            variables: {
              id: checkoutId,
              locale: DEFAULT_LOCALE,
            },
            cache: "no-cache",
          },
        )
      : { checkout: null };
    //console.log(checkout);
    return checkout;
  } catch {
    // we ignore invalid ID or checkout not found
    console.log("not found");
    //remove from cookie
    return null;
  }
}

export async function findOrCreate({
  channel,
  checkoutId,
}: {
  checkoutId?: string;
  channel: string;
}) {
  if (!checkoutId) {
    return (await create({ channel })).checkoutCreate?.checkout;
  }
  const checkout = await find(checkoutId);
  return checkout || (await create({ channel })).checkoutCreate?.checkout;
}

export const create = ({ channel }: { channel: string }) =>
  executeGraphQL<CreateCheckoutMutation, { channel: string }>(CreateCheckoutDocument, {
    cache: "no-cache",
    variables: { channel },
  });
