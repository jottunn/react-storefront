import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import RegisterForm from "./RegisterForm";
import Link from "next/link";
import { STOREFRONT_NAME } from "@/lib/const";
const messages = getMessages(DEFAULT_LOCALE);

export const metadata = {
  title: `${messages["app.register.header"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.register.header"]} -  Surmont.ro`,
  alternates: {
    canonical: process.env.NEXT_PUBLIC_STOREFRONT_URL
      ? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/register`
      : undefined,
  },
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex justify-center items-center">
          <Spinner />
        </div>
      }
    >
      <section className="mx-auto max-w-8xl min-h-[400px] p-4">
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
