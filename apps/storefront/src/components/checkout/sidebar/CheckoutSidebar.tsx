"use client";
import React from "react";
import { Messages } from "@/lib/util";
import { CheckoutProductList } from "@/components/cart/CheckoutProductList";
import { CartSummary } from "./CartSummary";

interface CheckoutSidebarProps {
  messages: Messages;
}

function CheckoutSidebar({ messages }: CheckoutSidebarProps) {
  return (
    <section className="w-full flex flex-col ">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:pr-4 md:py-4 md:pl-0 p-4">
        {messages["app.checkout.orderSummary"]}
      </h1>

      <CheckoutProductList messages={messages} />
      {/* @ts-expect-error Async Server Component  */}
      <CartSummary messages={messages} />
    </section>
  );
}

export default CheckoutSidebar;
