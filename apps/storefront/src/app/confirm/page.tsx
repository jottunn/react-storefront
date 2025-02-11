import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import ConfirmResult from "./ConfirmResult";
import styles from "../login/Login.module.css";
import clsx from "clsx";

export default function ConfirmPage() {
  const messages = getMessages(DEFAULT_LOCALE);
  return (
    <Suspense fallback={<Spinner />}>
      <section className={clsx(styles["account-bkg"], "mx-auto max-w-10xl min-h-[400px] p-4")}>
        <div className="container pb-40 pt-40 flex justify-center items-center">
          <div className="w-full md:w-[50%] bg-white bg-opacity-90 p-20">
            <h1 className="text-2xl font-bold mt-2">
              {messages["app.register.accountConfirmTitle"]}
            </h1>
            {/* <Spinner /> */}
            <ConfirmResult messages={messages} />
          </div>
        </div>
      </section>
    </Suspense>
  );
}
