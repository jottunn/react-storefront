import React, { ReactElement } from "react";

import { Layout } from "@/components";
// import { useCheckout } from "@/lib/providers/CheckoutProvider";

function OrderCompletedPage() {
  // const checkout = useCheckout();
  return (
    <main className="container pt-18 px-8 pb-18 text-center">
      <h1 className="text-xl mb-5">THANK YOU!</h1>
      <div className="font-semibold text-3xl mb-5 text-action-1">Your order is completed!</div>

      <p className="text-base">Iti multumim ca ai ales sa iti faci cumparaturile pe Surmont.ro</p>
      <p className="text-base">
        Comanda ta a fost inregistrata cu succes si se afla in procesare In scurt timp vei primi un
        email cu detaliile comenzii.
      </p>
    </main>
  );
}

export default OrderCompletedPage;

OrderCompletedPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
