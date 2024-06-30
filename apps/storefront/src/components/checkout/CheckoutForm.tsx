"use client";
import React, { useState } from "react";
import { CheckoutDetailsFragment } from "@/saleor/api";
import EmailSection from "./EmailSection";
import BillingAddressSection from "./address/BillingAddressSection";
import ShippingAddressSection from "./shipping/ShippingAddressSection";
import ShippingMethodSection from "./shipping/ShippingMethodSection";
import PaymentSection from "./payments/PaymentSection";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import Spinner from "../Spinner";
import CheckoutNote from "./CheckoutNote";
import CompleteCheckoutButton from "./CompleteCheckoutButton";

interface CollapsedSections {
  billingAddress: boolean;
  shippingAddress: boolean;
  deliveryMethod: boolean;
  payment: boolean;
}

interface CheckoutFormProps {
  messages: { [key: string]: string };
  user: any;
}

const sectionsManager = (checkout?: CheckoutDetailsFragment): CollapsedSections => {
  // Will hide sections which cannot be set yet during the checkout
  // Start with all the sections hidden
  const state: CollapsedSections = {
    billingAddress: true,
    shippingAddress: true,
    deliveryMethod: true,
    payment: true,
  };
  if (!checkout || !checkout.email) {
    return state;
  }
  state.billingAddress = false;
  if (!checkout.billingAddress) {
    return state;
  }
  state.shippingAddress = false;
  if (checkout.isShippingRequired && !checkout.shippingAddress) {
    return state;
  }
  state.deliveryMethod = false;
  if (checkout.isShippingRequired && !checkout.deliveryMethod) {
    return state;
  }
  state.payment = false;
  return state;
};

function CheckoutForm({ messages, user }: CheckoutFormProps) {
  const [sameAddress, setSameAddress] = useState(true);
  const { checkout } = useCheckout();

  if (!checkout) {
    return null;
  }

  const collapsedSections = sectionsManager(checkout);
  return (
    <section className="flex flex-auto flex-col overflow-y-auto px-4 pt-4 space-y-4 pb-4">
      <div className="checkout-section-container">
        {/* @ts-expect-error Async Server Component   */}
        <EmailSection messages={messages} user={user} />
      </div>
      <div className="checkout-section-container">
        {/* @ts-expect-error Async Server Component  */}
        <BillingAddressSection
          active={!collapsedSections.billingAddress}
          sameAddress={sameAddress}
          messages={messages}
          user={user}
        />
        {checkout.email && (
          <div className="col-span-full sm:col-span-12 mt-5 mb-5">
            <label>
              <input
                className="mr-2 w-4 h-4 text-action-1 bg-gray-100 border-gray-300 focus:ring-action-1 dark:focus:ring-action-1 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600 !opacity-100"
                type="checkbox"
                checked={sameAddress}
                onChange={() => setSameAddress(!sameAddress)}
              />
              <span className="text-base">{messages["app.checkout.sameAsBillingButton"]}</span>
            </label>
          </div>
        )}
      </div>

      {checkout.isShippingRequired && !sameAddress && (
        <div className="checkout-section-container">
          {/* @ts-expect-error Async Server Component  */}
          <ShippingAddressSection
            active={!collapsedSections.shippingAddress}
            messages={messages}
            user={user}
          />
        </div>
      )}
      {checkout.isShippingRequired && (
        <div className="checkout-section-container">
          {/* @ts-expect-error Async Server Component  */}
          <ShippingMethodSection active={!collapsedSections.deliveryMethod} messages={messages} />
        </div>
      )}

      <div className="checkout-section-container">
        <PaymentSection active={!collapsedSections.payment} messages={messages} />
      </div>
    </section>
  );
}

export default CheckoutForm;
