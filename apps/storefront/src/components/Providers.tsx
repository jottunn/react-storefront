"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import React, { Suspense } from "react";
import { WishlistProvider } from "./WishlistProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <WishlistProvider>
      {children}
      <Suspense>
        <ProgressBar height="4px" color="#0b9446" options={{ showSpinner: false }} shallowRouting />
      </Suspense>
    </WishlistProvider>
  );
};

export default Providers;
