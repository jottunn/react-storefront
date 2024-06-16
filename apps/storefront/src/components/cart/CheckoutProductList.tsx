import React from "react";
import { CheckoutLineDetailsFragment } from "@/saleor/api";
import CheckoutLineItem from "./CheckoutLineItem";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface CheckoutProductListProps {
  checkout: {
    id: string;
    lines: (CheckoutLineDetailsFragment | null)[];
  };
  refreshCart: (updatedCheckout: any) => Promise<void>;
}

export function CheckoutProductList() {
  const { checkout } = useCheckout();
  if (!checkout) {
    return null;
  }
  return (
    <ul className="flex-auto overflow-y-auto divide-y px-4 md:pr-4 md:pl-0">
      {checkout.lines.map((line) => {
        if (!line) {
          return null;
        }
        return <CheckoutLineItem key={line.id} line={line} />;
      })}
    </ul>
  );
}
