import { STOREFRONT_URL } from "@/lib/const";
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { getNextServerCookiesStorage } from "@saleor/auth-sdk/next/server";
import { invariant } from "ts-invariant";

export const ProductsPerPage = 12;

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

export const saleorAuthClient = () => {
  const storefrontUrl = STOREFRONT_URL || "";
  const shouldUseHttps = storefrontUrl.startsWith("https");
  const nextServerCookiesStorage = getNextServerCookiesStorage({ secure: shouldUseHttps || false });
  return createSaleorAuthClient({
    saleorApiUrl,
    refreshTokenStorage: nextServerCookiesStorage,
    accessTokenStorage: nextServerCookiesStorage,
  });
};
