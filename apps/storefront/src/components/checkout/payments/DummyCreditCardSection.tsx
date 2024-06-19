import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { CheckoutDetailsFragment } from "@/saleor/api";

import { CompleteCheckoutButton } from "../CompleteCheckoutButton";
import { formatMoney } from "@/lib/utils/formatMoney";
import { Messages } from "@/lib/util";
import { checkoutCompleteMutation, checkoutPaymentCreateMutation } from "../actions";
import { BASE_URL } from "@/lib/const";

export const DUMMY_CREDIT_CARD_GATEWAY = "mirumee.payments.dummy";

interface CardForm {
  cardNumber: string;
  expDate: string;
  cvc: string;
}

interface DummyCreditCardSectionInterface {
  checkout: CheckoutDetailsFragment;
  resetCheckout: any;
  messages: Messages;
}

export function DummyCreditCardSection({
  checkout,
  resetCheckout,
  messages,
}: DummyCreditCardSectionInterface) {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const totalPrice = checkout.totalPrice?.gross;
  const payLabel = `${messages["app.checkout.paymentButton"]}${formatMoney(totalPrice)}`;

  const defaultValues = {
    cardNumber: "4242 4242 4242 4242",
    expDate: "12/34",
    cvc: "123",
  };

  const { register: registerCard, handleSubmit: handleSubmitCard } = useForm<CardForm>({
    defaultValues,
  });

  const redirectToOrderDetailsPage = async () => {
    router.push("/order");
    resetCheckout();
  };

  const handleSubmit = handleSubmitCard(async (formData: CardForm) => {
    setIsPaymentProcessing(true);

    // Create Saleor payment
    const paymentCreate = await checkoutPaymentCreateMutation({
      id: checkout.id,
      input: {
        gateway: DUMMY_CREDIT_CARD_GATEWAY,
        amount: checkout.totalPrice?.gross.amount,
        token: formData.cardNumber,
        returnUrl: `${BASE_URL}/order`,
      },
    });

    // console.log('paymentCreate', paymentCreate);

    if (paymentCreate?.errors) {
      console.error(paymentCreate.errors);
      setIsPaymentProcessing(false);
      return;
    }

    // Try to complete the checkout
    const checkoutComplete = await checkoutCompleteMutation({
      id: checkout.id,
    });

    // console.log('checkoutComplete', checkoutComplete);

    if (checkoutComplete?.errors) {
      console.error("complete errors:", checkoutComplete.errors);
      setIsPaymentProcessing(false);
      return;
    }

    const order = checkoutComplete?.order;

    // If there are no errors during payment and confirmation, order should be created
    if (order) {
      return redirectToOrderDetailsPage();
    } else {
      console.error("Order was not created");
      setIsPaymentProcessing(false);
      return;
    }
  });

  return (
    <div className="py-8">
      <form method="post" onSubmit={handleSubmit}>
        <div className="py-8">
          <div className="mt-4 grid grid-cols-12 gap-x-2 gap-y-4">
            <div className="col-span-6">
              <label htmlFor="card-number" className="block text-sm font-semibold text-gray-700">
                {messages["app.checkout.cardNumberField"]}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="card-number"
                  className="block w-full border-gray-300 rounded-md shadow-sm text-base"
                  spellCheck={false}
                  {...registerCard("cardNumber", {
                    required: true,
                  })}
                />
              </div>
            </div>

            <div className="col-span-3">
              <label
                htmlFor="expiration-date"
                className="block text-sm font-semibold text-gray-700"
              >
                {messages["app.checkout.expDateField"]}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="expiration-date"
                  className="block w-full border-gray-300 rounded-md shadow-sm text-base"
                  placeholder="MM / YY"
                  spellCheck={false}
                  {...registerCard("expDate", {
                    required: true,
                  })}
                />
              </div>
            </div>

            <div className="col-span-3">
              <label htmlFor="cvc" className="block text-sm font-semibold text-gray-700">
                {messages["app.checkout.cvcField"]}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="cvc"
                  className="block w-full border-gray-300 rounded-md shadow-sm text-base"
                  spellCheck={false}
                  {...registerCard("cvc", {
                    required: true,
                  })}
                />
              </div>
            </div>
          </div>
        </div>
        <CompleteCheckoutButton isProcessing={isPaymentProcessing} isDisabled={isPaymentProcessing}>
          {payLabel}
        </CompleteCheckoutButton>
      </form>
    </div>
  );
}

export default DummyCreditCardSection;
