import { Messages } from "@/lib/util";

export interface CheckoutResultProps {
  messages: Messages;
  statusResponse: any; //{message, error, order}
}

export default function CheckoutResult({ messages, statusResponse }: CheckoutResultProps) {
  return (
    <main className="container pt-18 px-8 pb-18 text-center">
      {!statusResponse.error ? (
        <>
          <h1 className="text-xl mb-5">Multumim!</h1>
          <div className="font-semibold text-3xl mb-5 text-action-1">
            {`Comanda #${statusResponse.order.number} a fost finalizata cu succes!`}
          </div>
          <p className="text-base">
            Iti multumim ca ai ales sa iti faci cumparaturile pe Surmont.ro
          </p>
          <p className="text-base">
            Comanda ta a fost inregistrata cu succes si se afla in procesare. In scurt timp vei
            primi un email cu detaliile comenzii.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold ">
            {statusResponse.errorString
              ? messages[statusResponse.errorString]
              : statusResponse.error}
          </p>
        </>
      )}
    </main>
  );
}
