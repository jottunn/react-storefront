import React from "react";
import { CheckoutLineDetailsFragment } from "@/saleor/api";
import CheckoutLineItem from "@/components/CheckoutLineItem";

export interface CheckoutProductListProps {
  lines: CheckoutLineDetailsFragment[];
  token: string;
}

export function CheckoutProductList({ lines }: CheckoutProductListProps) {
  return (
    <ul className="flex-auto overflow-y-auto divide-y px-4 md:pr-4 md:pl-0">
      {lines.map((line) => {
        if (!line) {
          return null;
        }
        return <CheckoutLineItem key={line.id} line={line} />;
      })}
    </ul>
  );
}
