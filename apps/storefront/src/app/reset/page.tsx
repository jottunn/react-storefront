import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import ForgotPassword from "./ForgotPassword";
import { STOREFRONT_NAME } from "@/lib/const";
import ResetForm from "./ResetPasswordForm";
import ResetPageClient from "./ResetPageClient";

const messages = getMessages(DEFAULT_LOCALE);
export const metadata = {
  title: `${messages["app.login.remindPassword"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.login.remindPassword"]} -  Surmont.ro`,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
      ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/reset`
      : undefined,
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
      <section className="mx-auto max-w-8xl p-4 min-h-[400px]">
        <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
          <ResetPageClient messages={messages} />
        </div>
      </section>
    </Suspense>
  );
}
