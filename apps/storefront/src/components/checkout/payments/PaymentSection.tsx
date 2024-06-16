import { Radio, RadioGroup } from "@headlessui/react";
import React, { useState } from "react";
import { CashOnDeliverySection } from "./CashOnDeliverySection";
import { Messages } from "@/lib/util";
import { DUMMY_CREDIT_CARD_GATEWAY, DummyCreditCardSection } from "./DummyCreditCardSection";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface PaymentSectionProps {
  active: boolean;
  messages: Messages;
}

export function PaymentSection({ active, messages }: PaymentSectionProps) {
  const { checkout, resetCheckout } = useCheckout();
  const availableGateways = checkout?.availablePaymentGateways;
  const [chosenGateway, setChosenGateway] = useState("");
  const CASH_ON_DELIVERY_GATEWAY = "COD";

  if (!checkout) {
    return;
  }
  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {messages["app.checkout.paymentCardHeader"]}
        </h2>
      </div>
      {active && (
        <>
          <div className="block">
            <span className="text-gray-700 text-base">
              {messages["app.checkout.paymentInstruction"]}
            </span>
            {availableGateways && (
              <RadioGroup value={chosenGateway} onChange={setChosenGateway} className="mt-2">
                {availableGateways.map((gateway) => (
                  <Radio key={gateway.id} value={gateway.id}>
                    <label className="block items-center" htmlFor={gateway.id}>
                      <input
                        type="radio"
                        className="form-radio !opacity-100 w-4 h-4 text-action-1 bg-neutral-100 border-gray-300 focus:ring-action-2 dark:focus:ring-action-2 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600"
                        name="radio"
                        value={gateway.id}
                        id={gateway.id}
                      />
                      <span className="ml-2 text-base pl-5 relative top-1">{gateway.name}</span>
                    </label>
                  </Radio>
                ))}
                <Radio value={CASH_ON_DELIVERY_GATEWAY}>
                  <label className="block items-center mt-2" htmlFor={CASH_ON_DELIVERY_GATEWAY}>
                    <input
                      type="radio"
                      className="form-radio !opacity-100 w-4 h-4 text-action-1 bg-neutral-100 border-gray-300 focus:ring-action-2 dark:focus:ring-action-2 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600"
                      name="radio"
                      value={CASH_ON_DELIVERY_GATEWAY}
                      id={CASH_ON_DELIVERY_GATEWAY}
                    />
                    <span className="ml-2 text-base pl-5 relative top-1">
                      {messages["app.checkout.cashOnDelivery"]}
                    </span>
                  </label>
                </Radio>
              </RadioGroup>
            )}
          </div>
          {chosenGateway === DUMMY_CREDIT_CARD_GATEWAY && (
            <DummyCreditCardSection
              checkout={checkout}
              resetCheckout={resetCheckout}
              messages={messages}
            />
          )}
          {chosenGateway === CASH_ON_DELIVERY_GATEWAY && (
            <CashOnDeliverySection checkout={checkout} messages={messages} />
          )}
        </>
      )}
    </>
  );
}

export default PaymentSection;
