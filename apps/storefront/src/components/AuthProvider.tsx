"use client";

import { SaleorAuthProvider, useAuthChange } from "@saleor/auth-sdk/react";
import { invariant } from "ts-invariant";
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { type ReactNode } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";

const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");
//1. Create a Saleor Auth Client
export const saleorAuthClient = createSaleorAuthClient({
  saleorApiUrl,
});

//2. create a Apollo Client
const httpLink = createHttpLink({
  uri: saleorApiUrl,
  fetch: saleorAuthClient.fetchWithAuth,
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  invariant(saleorApiUrl, "Missing NEXT_PUBLIC_SALEOR_API_URL env variable");

  useAuthChange({
    saleorApiUrl,
    onSignedOut: () => apolloClient.resetStore(),
    onSignedIn: () => apolloClient.refetchQueries({ include: "all" }),
  });

  return (
    <SaleorAuthProvider client={saleorAuthClient}>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </SaleorAuthProvider>
  );
}
