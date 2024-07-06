import React from "react";
import CheckoutLineItem from "./CheckoutLineItem";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { Messages } from "@/lib/util";

interface CheckoutProductListProps {
  messages: Messages;
}

export function CheckoutProductList({ messages }: CheckoutProductListProps) {
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
        return <CheckoutLineItem key={line.id} line={line} messages={messages} />;
      })}
    </ul>
  );
}
