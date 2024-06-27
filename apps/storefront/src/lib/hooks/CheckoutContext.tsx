"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { defaultRegionQuery } from "../regions";
import { getCookie } from "../cookieUtils";
import { Checkout } from "@/saleor/api";
import { find } from "../checkout";
import isEqual from "lodash.isequal";

interface CheckoutContextType {
  checkout: Checkout | null;
  checkoutId: string;
  refreshCheckout: any;
  resetCheckout: any;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

const CheckoutProviderInternal = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  let checkoutIdFromUrl = searchParams.get("checkout");
  if (!checkoutIdFromUrl) {
    checkoutIdFromUrl = getCookie(`checkoutId-${defaultRegionQuery().channel}`) as string;
  }
  const [checkoutId, setCheckoutId] = useState<string | null>(checkoutIdFromUrl);
  const [checkout, setCheckout] = useState<Checkout | null>();

  // console.log('render context')
  useEffect(() => {
    if (checkoutIdFromUrl != checkoutId) {
      setCheckoutId(checkoutIdFromUrl);
    }
  }, [checkoutIdFromUrl]);

  useEffect(() => {
    if (!checkoutId) return;
    const fetchCheckout = async () => {
      try {
        const data = await find(checkoutId);
        if (data) {
          setCheckout(data as Checkout);
        }
      } catch (error) {
        console.error("Failed to fetch checkout:", error);
      } finally {
      }
    };
    fetchCheckout();
  }, []);

  const refreshCheckout = async () => {
    if (!checkoutId) return;
    try {
      const data = await find(checkoutId);
      if (!isEqual(data, checkout)) {
        setCheckout(data as Checkout);
      }
    } catch (error) {
      console.error("Failed to refresh checkout:", error);
    }
  };

  const resetCheckout = () => setCheckoutId("");

  return (
    <CheckoutContext.Provider
      value={{
        // loading: loading,
        checkoutId: checkoutId || "",
        checkout: checkout as Checkout,
        resetCheckout,
        refreshCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <CheckoutProviderInternal>{children}</CheckoutProviderInternal>
    </Suspense>
  );
};
