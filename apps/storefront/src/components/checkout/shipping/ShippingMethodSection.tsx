import { RadioGroup } from "@headlessui/react";
import React, { useState } from "react";
import { CheckoutDetailsFragment, ErrorDetailsFragment, ShippingMethod } from "@/saleor/api";
import { Button } from "../../Button";
import { Messages } from "@/lib/util";
import { checkoutShippingMethodUpdate } from "../actions";
import { notNullable } from "@/lib/media";
import { ShippingMethodOption } from "./ShippingMethodOption";
import ShippingMethodDisplay from "./ShippingMethodDisplay";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface ShippingMethodSectionProps {
  active: boolean;
  messages: Messages;
}

export function ShippingMethodSection({ active, messages }: ShippingMethodSectionProps) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout) {
    return;
  }

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(checkout.deliveryMethod);
  const [editing, setEditing] = useState(!checkout.deliveryMethod);
  const [errors, setErrors] = React.useState<ErrorDetailsFragment[] | null>(null);

  const handleChange = async (method: ShippingMethod) => {
    const response = await checkoutShippingMethodUpdate({
      shippingMethodId: method.id,
      id: checkout.id,
    });

    console.log("handleChange", response);
    if (response?.errors) {
      // todo: handle errors
      setErrors(response.errors);
      return;
    }
    await refreshCheckout();
    setSelectedDeliveryMethod(method);
    setEditing(false);
    setErrors(null);
  };

  const availableShippingMethods = checkout.shippingMethods.filter(notNullable) || [];

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {messages["app.checkout.shippingMethodCardHeader"]}
        </h2>
        {errors &&
          errors.map((error, index) => (
            <p key={index} className="text-red-500 font-bold mt-2">
              {error.message}
            </p>
          ))}
      </div>
      {active &&
        (editing ? (
          <>
            <a
              href="#"
              className="text-base underline text-main-1 hover:text-main"
              onClick={(e) => {
                e.preventDefault();
                setEditing(false);
              }}
            >
              {messages["app.buttons.back"]}
            </a>
            <RadioGroup value={selectedDeliveryMethod} onChange={handleChange} className="pb-4">
              <div className="mt-4 grid grid-cols-2 gap-2">
                {availableShippingMethods.map((method) => {
                  // todo: Investigate why filter did not excluded non existing methods
                  if (!method) {
                    return null;
                  }
                  return <ShippingMethodOption method={method} key={method.id} />;
                })}
              </div>
            </RadioGroup>
          </>
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.deliveryMethod && (
              <ShippingMethodDisplay method={checkout.deliveryMethod as ShippingMethod} />
            )}
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setEditing(true)}
                label={messages["app.ui.changeButton"]}
                variant="secondary"
              />
            </div>
          </section>
        ))}
    </>
  );
}

export default ShippingMethodSection;
