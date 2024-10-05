"use client";
import CheckoutResult from "@/components/checkout/CheckoutResult";
import { callPaymentAppApi } from "@/components/checkout/payments/callPaymentApi";
import { getCookie } from "@/lib/cookieUtils";
import { defaultRegionQuery } from "@/lib/regions";
import { Messages } from "@/lib/util";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface PaymentConfirmClientProps {
  messages: Messages;
}

const PaymentConfirmClient = ({ messages }: PaymentConfirmClientProps) => {
  const searchParams = useSearchParams();
  const checkoutIdFromUrl = searchParams.get("checkoutId");
  const checkoutId = checkoutIdFromUrl || getCookie(`checkoutId-${defaultRegionQuery().channel}`);
  const [responseMessage, setResponseMessage] = useState({});
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (checkoutId) {
      console.log("effect checkout id");
      const processPayment = async () => {
        try {
          const response = await callPaymentAppApi(checkoutId);
          setResponseMessage(response);
        } catch (e) {
          console.error(e);
          setResponseMessage({ error: messages["app.payment.errorCreateOrder"] });
        } finally {
          setIsProcessing(false); // Mark processing as done
        }
      };
      processPayment();
    } else if (!checkoutId) {
      setResponseMessage({ error: messages["app.payment.noCheckout"] });
      setIsProcessing(false);
    }
  }, []);

  if (isProcessing) {
    return (
      <main className="container pt-18 px-8 pb-18 text-center">
        <p className="text-base font-semibold">{messages["app.payment.processing"]}</p>
      </main>
    );
  }
  return <CheckoutResult messages={messages} statusResponse={responseMessage} />;
};

export default PaymentConfirmClient;
