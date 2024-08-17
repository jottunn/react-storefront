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
import { STOREFRONT_URL } from "./const";
import { getCurrentUser } from "src/app/actions";

export async function getIdFromCookies(channel: string) {
  const cookieName = `checkoutId-${channel}`;
  const checkoutId = cookies().get(cookieName)?.value || "";
  return checkoutId;
}

export async function saveIdToCookie(channel: string, checkoutId: string) {
  const storefrontUrl = STOREFRONT_URL || "";
  const shouldUseHttps = storefrontUrl.startsWith("https");
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
    // console.log('checkout find', checkout);
    return checkout;
  } catch {
    // we ignore invalid ID or checkout not found
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
  try {
    const user = await getCurrentUser();
    if (!checkoutId) {
      const createResult = await create({ channel, user });
      if (createResult.checkoutCreate?.errors.length) {
        console.error("Error creating checkout:", createResult.checkoutCreate.errors);
        const customError = createResult.checkoutCreate.errors as any;
        return { errors: customError.map((error: { code: any }) => error.code) };
      }
      return { checkout: createResult.checkoutCreate?.checkout };
    }
    const checkout = await find(checkoutId);
    if (!checkout) {
      const createResult = await create({ channel, user });
      if (createResult?.checkoutCreate?.errors.length) {
        const customError = createResult.checkoutCreate.errors as any;
        console.error("Error creating checkout:", createResult?.checkoutCreate.errors);
        return { errors: customError.map((error: { code: any }) => error.code) };
      }
      return { checkout: createResult.checkoutCreate?.checkout };
    }

    return { checkout: checkout };
  } catch (error) {
    console.error("Error in findOrCreate:", error);
    return { errors: ["An error occurred while creating or retrieving the checkout."] };
  }
}

export const create = ({ channel, user }: { channel: string; user: any }) =>
  executeGraphQL<CreateCheckoutMutation, { channel: string }>(CreateCheckoutDocument, {
    cache: "no-cache",
    variables: { channel },
    withAuth: user && user !== null,
  });
