import "styles/globals.css";
import localFont from "next/font/local";
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";
import { NextPage } from "next";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement, ReactNode } from "react";

import { RegionsProvider } from "@/components/RegionsProvider";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { API_URI } from "@/lib/const";
import { CheckoutProvider } from "@/lib/providers/CheckoutProvider";
import { SaleorAuthProvider, useAuthChange } from "@saleor/auth-sdk/react";
import { createSaleorAuthClient } from "@saleor/auth-sdk";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const openSans = localFont({ src: "../public/fonts/OpenSans-VariableFont_wdth,wght.ttf" });

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  //1. Create a Saleor Auth Client
  const saleorApiUrl = API_URI;
  const saleorAuthClient = createSaleorAuthClient({ saleorApiUrl });

  //2. create a Apollo Client
  const httpLink = createHttpLink({
    uri: saleorApiUrl,
    fetch: saleorAuthClient.fetchWithAuth,
  });

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  useAuthChange({
    saleorApiUrl,
    onSignedOut: () => apolloClient.resetStore(),
    onSignedIn: () => apolloClient.refetchQueries({ include: "all" }),
  });

  return (
    <SaleorAuthProvider client={saleorAuthClient}>
      <ApolloProvider client={apolloClient}>
        <CheckoutProvider>
          <RegionsProvider>
            <BaseSeo />
            <NextNProgress color="#41cc1d" options={{ showSpinner: false }} />
            {/* {getLayout(<Component {...pageProps} />)} */}
            {getLayout(
              <main className={openSans.className}>
                <Component {...pageProps} />
              </main>
            )}
          </RegionsProvider>
        </CheckoutProvider>
      </ApolloProvider>
    </SaleorAuthProvider>
  );
}

export default MyApp;
