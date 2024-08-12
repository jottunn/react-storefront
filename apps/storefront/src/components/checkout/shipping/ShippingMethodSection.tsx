import { RadioGroup } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { ErrorDetailsFragment, ShippingMethod } from "@/saleor/api";
import { Button } from "../../Button/Button";
import { Messages } from "@/lib/util";
import { checkoutShippingMethodUpdate } from "../actions";
import { notNullable } from "@/lib/media";
import { ShippingMethodOption } from "./ShippingMethodOption";
import ShippingMethodDisplay from "./ShippingMethodDisplay";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import Spinner from "@/components/Spinner";

export interface ShippingMethodSectionProps {
  active: boolean;
  messages: Messages;
}

interface ShippingMethodState {
  selectedDeliveryMethod: ShippingMethod | null;
  editing: boolean;
  errors: ErrorDetailsFragment[] | null;
  loading: boolean;
}

export function ShippingMethodSection({ active, messages }: ShippingMethodSectionProps) {
  const { checkout, refreshCheckout } = useCheckout();

  const [state, setState] = useState<ShippingMethodState>({
    selectedDeliveryMethod: null,
    editing: false,
    errors: null,
    loading: false,
  });

  console.log("checkout", checkout);
  if (!checkout) {
    return;
  }

  useEffect(() => {
    if (checkout) {
      const initialDeliveryMethod =
        checkout.deliveryMethod ||
        (checkout.shippingMethods.length === 1 ? checkout.shippingMethods[0] : null);
      const initialEditing = !checkout.deliveryMethod && checkout.shippingMethods.length > 1;

      setState((prevState) => ({
        ...prevState,
        selectedDeliveryMethod: initialDeliveryMethod as ShippingMethod,
        editing: initialEditing,
      }));
    }
  }, [checkout]);

  useEffect(() => {
    if (state.selectedDeliveryMethod) {
      updateShippingMethod(state.selectedDeliveryMethod);
    }
  }, [state.selectedDeliveryMethod]);

  const handleChange = (method: ShippingMethod) => {
    setState((prevState) => ({
      ...prevState,
      selectedDeliveryMethod: method,
    }));
  };

  const updateShippingMethod = async (method: ShippingMethod) => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    const response = await checkoutShippingMethodUpdate({
      shippingMethodId: method.id,
      id: checkout.id,
    });

    if (response?.errors) {
      setState((prevState) => ({
        ...prevState,
        errors: response.errors,
        loading: false,
      }));
      return;
    }

    await refreshCheckout();
    setState((prevState) => ({
      ...prevState,
      editing: false,
      errors: null,
      loading: false,
    }));
  };

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {messages["app.checkout.shippingMethodCardHeader"]}
        </h2>
        {state.errors &&
          state.errors.map((error, index) => (
            <p key={index} className="text-red-500 font-bold mt-2">
              {error.message || error.code}
            </p>
          ))}
      </div>
      {state.loading && <Spinner />}
      {active &&
        (state.editing ? (
          <>
            {state.selectedDeliveryMethod !== null && !state.loading && (
              <a
                href="#"
                className="text-base underline text-main-1 hover:text-main"
                onClick={(e) => {
                  e.preventDefault();
                  setState((prevState) => ({
                    ...prevState,
                    editing: false,
                  }));
                }}
              >
                {messages["app.buttons.back"]}
              </a>
            )}
            <RadioGroup
              value={state.selectedDeliveryMethod}
              onChange={handleChange}
              className="pb-4"
            >
              <div className="mt-4 grid grid-cols-2 gap-2">
                {checkout.shippingMethods.map((method) => {
                  if (!method) {
                    return null;
                  }
                  return (
                    <ShippingMethodOption method={method} key={method.id} messages={messages} />
                  );
                })}
              </div>
            </RadioGroup>
          </>
        ) : (
          <section className="flex justify-between items-center mb-4">
            {!!checkout.deliveryMethod && (
              <ShippingMethodDisplay
                method={checkout.deliveryMethod as ShippingMethod}
                messages={messages}
              />
            )}
            {checkout.shippingMethods.length > 1 && (
              <div className="flex justify-between items-center">
                <Button
                  onClick={() =>
                    setState((prevState) => ({
                      ...prevState,
                      editing: true,
                    }))
                  }
                  label={messages["app.ui.changeButton"]}
                  variant="secondary"
                />
              </div>
            )}
          </section>
        ))}
    </>
  );
}

export default ShippingMethodSection;
