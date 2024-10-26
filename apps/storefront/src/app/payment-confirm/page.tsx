import { DEFAULT_LOCALE } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import PaymentConfirmClient from "./PaymentConfirmClient";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";

export const metadata = {
  title: `Confirmare plata | ${STOREFRONT_NAME}`,
  description: "Confirmare plata Surmont.ro",
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/payment-confirm` : undefined,
  },
};

const PaymentReturnPage = async () => {
  const messages = getMessages(DEFAULT_LOCALE, "app.payment");
  return <PaymentConfirmClient messages={messages} />;
};

export default PaymentReturnPage;
