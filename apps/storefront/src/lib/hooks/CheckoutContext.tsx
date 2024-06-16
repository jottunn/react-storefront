"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { Checkout, useCheckoutFindQuery } from "@/saleor/api";
import { DEFAULT_LOCALE, defaultRegionQuery } from "../regions";
import { getCookie } from "../cookieUtils";
import Spinner from "@/components/Spinner"; // Ensure you have a Spinner component

interface CheckoutContextType {
  checkout: Checkout | undefined;
  loading: boolean;
  refreshCheckout: () => Promise<void>;
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

  useEffect(() => {
    if (checkoutIdFromUrl) {
      setCheckoutId(checkoutIdFromUrl);
    }
  }, [checkoutIdFromUrl]);

  const { data, loading, error, refetch } = useCheckoutFindQuery({
    variables: { id: checkoutId || "", locale: DEFAULT_LOCALE },
    skip: !checkoutId,
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch checkout:", error);
    }
  }, [error]);

  const resetCheckout = () => setCheckoutId("");

  const refreshCheckout = useCallback(async () => {
    console.log("Calling refetch...");
    await refetch();
    console.log("Refetch completed. Data:", data);
  }, [refetch, data]);

  return (
    <CheckoutContext.Provider
      value={{
        checkout: data?.checkout as Checkout,
        loading: loading,
        refreshCheckout,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckoutProviderInternal>{children}</CheckoutProviderInternal>
    </Suspense>
  );
};
