import React, { useState } from "react";

import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { CheckoutDetailsFragment } from "@/saleor/api";

import { BillingAddressSection } from "./BillingAddressSection";
import { EmailSection } from "./EmailSection";
import { PaymentSection } from "./payments/PaymentSection";
import { ShippingAddressSection } from "./ShippingAddressSection";
import { ShippingMethodSection } from "./ShippingMethodSection";
import messages from "../translations";
import { useIntl } from "react-intl";

interface CollapsedSections {
  billingAddress: boolean;
  shippingAddress: boolean;
  shippingMethod: boolean;
  payment: boolean;
}

const sectionsManager = (checkout?: CheckoutDetailsFragment): CollapsedSections => {
  // Will hide sections which cannot be set yet during the checkout
  // Start with all the sections hidden
  const state: CollapsedSections = {
    billingAddress: true,
    shippingAddress: true,
    shippingMethod: true,
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
  state.shippingMethod = false;
  if (checkout.isShippingRequired && !checkout.shippingMethod) {
    return state;
  }
  state.payment = false;
  return state;
};

export function CheckoutForm() {
  const { checkout } = useCheckout();
  const [sameAddress, setSameAddress] = useState(true);
  const t = useIntl();

  if (!checkout) {
    return null;
  }

  const collapsedSections = sectionsManager(checkout);
  return (
    <section className="flex flex-auto flex-col overflow-y-auto px-4 pt-4 space-y-4 pb-4">
      <div className="checkout-section-container">
        <EmailSection checkout={checkout} />
      </div>
      <div className="checkout-section-container">
        <BillingAddressSection
          active={!collapsedSections.billingAddress}
          checkout={checkout}
          sameAddress={sameAddress}
        />
        {checkout.email && (
          <div className="col-span-full sm:col-span-12 mt-5 mb-5">
            <label>
              <input
                className="w-4 h-4 text-action-1 bg-gray-100 border-gray-300 focus:ring-action-1 dark:focus:ring-action-1 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600 !opacity-100"
                type="checkbox"
                checked={sameAddress}
                onChange={() => setSameAddress(!sameAddress)}
              />
              <span className="pl-5 text-base">
                {t.formatMessage(messages.sameAsBillingButton)}
              </span>
            </label>
          </div>
        )}
      </div>

      {checkout.isShippingRequired && !sameAddress && (
        <div className="checkout-section-container">
          <ShippingAddressSection active={!collapsedSections.shippingAddress} checkout={checkout} />
        </div>
      )}
      {checkout.isShippingRequired && (
        <div className="checkout-section-container">
          <ShippingMethodSection active={!collapsedSections.shippingMethod} checkout={checkout} />
        </div>
      )}
      <div className="checkout-section-container">
        <PaymentSection active={!collapsedSections.payment} checkout={checkout} />
      </div>
    </section>
  );
}

export default CheckoutForm;
