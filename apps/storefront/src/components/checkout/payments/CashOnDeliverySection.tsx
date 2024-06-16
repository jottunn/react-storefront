import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { CheckoutDetailsFragment } from "@/saleor/api";

import { CompleteCheckoutButton } from "../CompleteCheckoutButton";
import { Messages } from "@/lib/util";
import { formatPrice } from "@/lib/hooks/useRegions";
import { checkoutCompleteMutation, checkoutPaymentCreateMutation } from "../actions";
import { BASE_URL } from "@/lib/const";

export const CASH_ON_DELIVERY_GATEWAY = "mirumee.payments.cod";

interface CashOnDeliverySectionInterface {
  checkout: CheckoutDetailsFragment;
  messages: Messages;
}

export function CashOnDeliverySection({ checkout, messages }: CashOnDeliverySectionInterface) {
  const router = useRouter();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const totalPrice = checkout.totalPrice?.gross;
  const payLabel = `${messages["app.checkout.paymentButton"]}${formatPrice(totalPrice)}`;

  const redirectToOrderDetailsPage = async () => {
    router.push("/order");
  };

  const handleSubmit = async () => {
    setIsPaymentProcessing(true);

    const checkoutComplete = await checkoutCompleteMutation({
      id: checkout.id,
    });

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
  };

  return (
    <div className="py-8">
      <form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <p>Cash on delivery</p>
        <CompleteCheckoutButton isProcessing={isPaymentProcessing} isDisabled={isPaymentProcessing}>
          {payLabel}
        </CompleteCheckoutButton>
      </form>
    </div>
  );
}

export default CashOnDeliverySection;
