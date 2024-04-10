import { RadioGroup } from "@headlessui/react";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { notNullable } from "@/lib/util";
import {
  CheckoutDetailsFragment,
  ErrorDetailsFragment,
  ShippingMethod,
  useCheckoutShippingMethodUpdateMutation,
} from "@/saleor/api";

import { Button } from "../Button";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { ShippingMethodDisplay } from "./ShippingMethodDisplay";
import { ShippingMethodOption } from "./ShippingMethodOption";

export interface ShippingMethodSectionProps {
  checkout: CheckoutDetailsFragment;
  active: boolean;
}

export function ShippingMethodSection({ checkout, active }: ShippingMethodSectionProps) {
  const t = useIntl();
  const { query } = useRegions();

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(checkout.shippingMethod);
  const [editing, setEditing] = useState(!checkout.shippingMethod);
  const [errors, setErrors] = React.useState<ErrorDetailsFragment[] | null>(null);

  const [checkoutShippingMethodUpdate] = useCheckoutShippingMethodUpdateMutation({});

  const handleChange = async (method: ShippingMethod) => {
    const { data } = await checkoutShippingMethodUpdate({
      variables: {
        token: checkout.token,
        shippingMethodId: method.id,
        locale: query.locale,
      },
    });
    if (data?.checkoutShippingMethodUpdate?.errors.length) {
      // todo: handle errors
      setErrors(data?.checkoutShippingMethodUpdate?.errors);
      return;
    }
    setSelectedDeliveryMethod(method);
    setEditing(false);
    setErrors(null);
  };

  const availableShippingMethods = checkout.availableShippingMethods.filter(notNullable) || [];

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {t.formatMessage(messages.shippingMethodCardHeader)}
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
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.shippingMethod && (
              <ShippingMethodDisplay method={checkout.shippingMethod} />
            )}
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setEditing(true)}
                label={t.formatMessage(messages.changeButton)}
              />
            </div>
          </section>
        ))}
    </>
  );
}

export default ShippingMethodSection;
