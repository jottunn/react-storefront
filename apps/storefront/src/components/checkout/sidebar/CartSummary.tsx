"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckoutDetailsFragment } from "@/saleor/api";
import { Messages } from "@/lib/util";
import { formatPrice } from "@/lib/hooks/useRegions";
import { checkoutAddPromoCodeMutation } from "../actions";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface PromoCodeFormData {
  promoCode: string;
}

export interface CartSummaryProps {
  messages: Messages;
}

export function CartSummary({ messages }: CartSummaryProps) {
  const { checkout, refreshCheckout } = useCheckout();
  const [editPromoCode] = useState(false);

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    setError: setErrorForm,
  } = useForm<PromoCodeFormData>({});

  const onAddPromoCode = handleSubmitForm(async (formData: PromoCodeFormData) => {
    if (!checkout) {
      return;
    }
    const addPromoCodeData = await checkoutAddPromoCodeMutation({
      id: checkout.id,
      promoCode: formData.promoCode,
    });
    if (addPromoCodeData?.errors) {
      setErrorForm("promoCode", { message: addPromoCodeData.errors[0].message || "Error" });
    } else if (addPromoCodeData?.checkout) {
      await refreshCheckout();
    }
  });

  if (!checkout) {
    return;
  }
  return (
    <section>
      <div className="bg-main-7 rounded p-8 border">
        {(editPromoCode || !checkout.discount?.amount) && (
          <form method="post" className="pb-4" onSubmit={onAddPromoCode}>
            <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700">
              {messages["app.checkout.discountCode"]}
            </label>
            <div className="flex space-x-4 mt-1">
              <input
                type="text"
                id="discount-code"
                className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                spellCheck={false}
                {...registerForm("promoCode", {
                  required: true,
                })}
              />
              <button
                type="submit"
                className="bg-gray-200 text-sm font-medium text-gray-600 rounded-md px-4 hover:bg-black hover:text-white"
              >
                {messages["app.ui.activateButton"]}
              </button>
            </div>
            {!!errorsForm.promoCode && (
              <p className="text-sm text-red-500 pt-2">{errorsForm.promoCode?.message}</p>
            )}
          </form>
        )}
        <div className="flow-root">
          <dl className="text-sm">
            {!!checkout.discount?.amount && (
              <div className="py-2 flex items-center justify-between">
                <dt className="text-gray-600">
                  {messages["app.checkout.discount"]}
                  <br />
                  <small>{checkout.discountName}</small>
                </dt>
                <dd className="font-medium text-gray-900">{formatPrice(checkout.discount)}</dd>
              </div>
            )}
            <div className="py-2 flex items-center justify-between">
              <dt className="text-gray-600">{messages["app.checkout.subtotal"]}</dt>
              <dd className="font-medium text-gray-900">
                {formatPrice(checkout.subtotalPrice?.net)}
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between">
              <dt className="text-gray-600">{messages["app.checkout.shipping"]}</dt>
              <dd className="font-medium text-gray-900">
                {formatPrice(checkout.shippingPrice?.gross)}
              </dd>
            </div>
            <div className="py-2 flex items-center justify-between">
              <dt className="text-gray-600">{messages["app.checkout.tax"]}</dt>
              <dd className="font-medium text-gray-900">
                {formatPrice(checkout.subtotalPrice?.tax)}
              </dd>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-gray-300">
              <dt className="text-lg font-bold text-gray-900">{messages["app.checkout.total"]}</dt>
              <dd className="text-lg font-bold text-gray-900">
                {formatPrice(checkout.totalPrice?.gross)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
