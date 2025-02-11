import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
import ResetPageClient from "./ResetPageClient";
import styles from "../login/Login.module.css";
import clsx from "clsx";

const messages = getMessages(DEFAULT_LOCALE);
export const metadata = {
  title: `${messages["app.login.remindPassword"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.login.remindPassword"]} -  Surmont.ro`,
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/reset` : undefined,
  },
};
export default function ResetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex justify-center items-center">
          <Spinner />
        </div>
      }
    >
      <section className={clsx(styles["account-bkg"], "mx-auto max-w-10xl min-h-[400px] p-4")}>
        <div className="container pb-40 pt-20 md:pt-40 flex justify-center items-center">
          <ResetPageClient messages={messages} />
        </div>
      </section>
    </Suspense>
  );
}
