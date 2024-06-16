// Create a Providers component to wrap your application with all the components requiring 'use client', such as next-nprogress-bar or your different contexts...
"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import React, { Suspense } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Suspense>
        <ProgressBar height="4px" color="#0b9446" options={{ showSpinner: false }} shallowRouting />
      </Suspense>
    </>
  );
};

export default Providers;
