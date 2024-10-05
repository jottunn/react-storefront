import { callPaymentAppApi } from "@/components/checkout/payments/callPaymentApi";
import { DEFAULT_LOCALE, defaultRegionQuery } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import PaymentConfirmClient from "./PaymentConfirmClient";
import * as Checkout from "@/lib/checkout";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import CheckoutResult from "@/components/checkout/CheckoutResult";

export const metadata = {
  title: `Confirmare plata | ${STOREFRONT_NAME}`,
  description: "Confirmare plata Surmont.ro",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/payment-confirm` : undefined,
  },
};

const PaymentReturnPage = async () => {
  const messages = getMessages(DEFAULT_LOCALE, "app.payment");
  const checkoutId = await Checkout.getIdFromCookies(defaultRegionQuery().channel);
  let responseMessage = messages["app.payment.processing"];

  if (!checkoutId) {
    return <PaymentConfirmClient messages={messages} />;
  }
  responseMessage = await callPaymentAppApi(checkoutId);
  return <CheckoutResult messages={messages} statusResponse={responseMessage} />;
};

export default PaymentReturnPage;
