import { Radio, RadioGroup } from "@headlessui/react";
import React, { useState } from "react";
import { Messages } from "@/lib/util";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import CompleteCheckoutButton from "../CompleteCheckoutButton";
import CheckoutNote from "../CheckoutNote";
import { checkoutCompleteMutation, initializeTransaction, updateTransaction } from "../actions";
import { useRouter } from "next/navigation";
import xss from "xss";

export interface PaymentSectionProps {
  active: boolean;
  messages: Messages;
}

export function PaymentSection({ active, messages }: PaymentSectionProps) {
  const { checkout } = useCheckout();
  const availableGateways = checkout?.availablePaymentGateways;
  const [chosenGateway, setChosenGateway] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [errors, setErrors] = useState<any[] | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const CASH_ON_DELIVERY_GATEWAY = "COD";

  const router = useRouter();
  if (!checkout || (checkout && checkout.lines && checkout.lines.length === 0)) {
    return null;
  }

  if (checkout.problems && checkout.problems.length > 0) {
    return <p className="text-md font-bold text-red-500">{messages["app.checkout.soldOut"]}</p>;
  }

  const redirectToOrderDetailsPage = async () => {
    router.push("/order");
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPaymentProcessing(true);

    const formData = new FormData(e.currentTarget);
    const rawNotes = formData.get("checkoutNotes") as string;
    const notes = xss(rawNotes);

    if (chosenGateway === process.env.NEXT_PUBLIC_PAYMENT_APP_ID) {
      // Handle ING WebPay payment processing
      try {
        // Step 1: Initialize Transaction
        const initTransactionResponse = await initializeTransaction({
          checkoutId: checkout.id,
          paymentGateway: {
            id: chosenGateway,
            data: {
              checkoutId: checkout.id,
            },
          },
        });

        console.log("initTransactionResponse", initTransactionResponse);

        if (initTransactionResponse?.errors?.length > 0) {
          setErrors(initTransactionResponse?.errors);
          setIsPaymentProcessing(false);
          return;
        }
        const paymentUrl = initTransactionResponse?.transactionInitialize?.data.paymentUrl;
        if (paymentUrl) {
          const transactionId = initTransactionResponse?.transactionInitialize?.transaction?.id;
          //update transaction with notes
          //TODO toreplace, when possible to add notes to checkout mutation
          if (transactionId && notes) {
            await updateTransaction(transactionId, notes);
          }
          //Schedule the task in 10 minutes, added to cover cases when user doesn't reach the return_url in order to process transaction
          if (transactionId) {
            const schedule = await fetch("/api/transactionQueue", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ transactionId }),
            }).catch((err) => {
              // Optionally log or handle any fetch error
              console.error("Failed to schedule transaction in queue:", err);
            });
          }
          //Proceed with the redirection regardless of fetch success or failure
          window.location.href = paymentUrl;
        } else {
          setErrors([messages["app.payment.noFormUrl"]]);
          setIsPaymentProcessing(false);
        }
      } catch (error) {
        console.error("Error during payment process:", error);
        setErrors([error]);
        setIsPaymentProcessing(false);
      }
    } else {
      //CASH_ON_DELIVERY_GATEWAY
      const checkoutComplete = await checkoutCompleteMutation({
        id: checkout.id,
        note: notes,
      });

      if (checkoutComplete?.errors) {
        console.error("complete errors:", checkoutComplete.errors);
        setIsPaymentProcessing(false);
        setErrors(checkoutComplete.errors);
        return;
      }

      // If there are no errors during payment and confirmation, order should be created
      const order = checkoutComplete?.order;
      if (order) {
        return redirectToOrderDetailsPage();
      }
    }
  };

  const totalPrice = checkout.totalPrice?.gross;
  const payLabel = `${messages["app.checkout.paymentButton"]}${totalPrice ? totalPrice.amount + " " + totalPrice.currency : ""}`;

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
          <div className="block pb-4">
            <span className="text-gray-700 text-base">
              {messages["app.checkout.paymentInstruction"]}
            </span>
            <RadioGroup value={chosenGateway} onChange={setChosenGateway} className="mt-2">
              {availableGateways?.map((gateway) => (
                <Radio key={gateway.id} value={gateway.id}>
                  <label className="block items-center" htmlFor={gateway.id}>
                    <input
                      type="radio"
                      className="form-radio !opacity-100 w-4 h-4 text-action-1 bg-neutral-100 border-gray-300 focus:ring-action-2 dark:focus:ring-action-2 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600"
                      name="radio"
                      value={gateway.id}
                      id={gateway.id}
                    />
                    <span className="ml-2 text-base pl-5 relative top-1">
                      {gateway.name === "ING WebPay" ? messages["app.checkout.card"] : gateway.name}
                    </span>
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
          </div>
          {chosenGateway && (
            <form onSubmit={handlePaymentSubmit} className="pb-8">
              <CheckoutNote
                messages={messages}
                agreedToTerms={agreedToTerms}
                setAgreedToTerms={setAgreedToTerms}
              />
              <CompleteCheckoutButton
                isProcessing={isPaymentProcessing}
                isDisabled={isPaymentProcessing}
                agreedToTerms={agreedToTerms}
                messages={messages}
              >
                {payLabel}
              </CompleteCheckoutButton>
            </form>
          )}
          {errors && (
            <div>
              {errors.map((err, index) => (
                <span className="text-red-500 text-sm font-medium" key={index}>
                  {err.code || err}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default PaymentSection;
