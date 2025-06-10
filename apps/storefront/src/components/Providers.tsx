"use client";

import { ProgressProvider } from "@bprogress/next/app";
import React, { Suspense } from "react";
import { WishlistProvider } from "./WishlistProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WishlistProvider>
      <ProgressProvider
        height="4px"
        color="#0b9446"
        options={{ showSpinner: false }}
        shallowRouting
      >
        {children}
      </ProgressProvider>
    </WishlistProvider>
  );
};

export default Providers;
