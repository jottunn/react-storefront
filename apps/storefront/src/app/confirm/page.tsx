import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import ConfirmResult from "./ConfirmResult";

export default function ConfirmPage() {
  const messages = getMessages(DEFAULT_LOCALE);
  return (
    <Suspense fallback={<Spinner />}>
      <section className="mx-auto max-w-8xl p-4">
        <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
          <div className="w-[85%] md:w-[45%]">
            <h1 className="text-2xl font-bold mt-2">
              {messages["app.register.accountConfirmTitle"]}
            </h1>
            <Spinner />
            <ConfirmResult messages={messages} />
          </div>
        </div>
      </section>
    </Suspense>
  );
}
