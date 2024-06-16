import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  const messages = getMessages(DEFAULT_LOCALE);
  return (
    <Suspense fallback={<Spinner />}>
      <section className="mx-auto max-w-8xl p-4">
        <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
          <div className="w-[85%] md:w-[45%]">
            <RegisterForm messages={messages} />
            <p className="mt-8 text-md underline underline-offset-4 hover:text-main-1">
              <Link href="/login">{messages["app.register.backToLogin"]}</Link>
            </p>
          </div>
        </div>
      </section>
    </Suspense>
  );
}
