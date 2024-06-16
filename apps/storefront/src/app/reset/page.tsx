import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import ResetForm from "./ResetPasswordForm";
import ForgotPassword from "./ForgotPassword";

export default function ResetPage() {
  const messages = getMessages(DEFAULT_LOCALE);
  return (
    <Suspense fallback={<Spinner />}>
      <section className="mx-auto max-w-8xl p-4">
        <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
          <div className="w-[85%] md:w-[45%]">
            <ForgotPassword messages={messages} />
          </div>
        </div>
      </section>
    </Suspense>
  );
}
