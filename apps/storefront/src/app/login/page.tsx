import LoginForm from "src/app/login/LoginForm";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import Link from "next/link";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
const messages = getMessages(DEFAULT_LOCALE);

export const metadata = {
  title: `${messages["app.login.header"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.login.header"]} -  Surmont.ro`,
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/login` : undefined,
  },
};

export default async function LoginPage() {
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
          <div className="w-[85%] md:w-[35%]">
            <LoginForm messages={messages} />
            <p className="mt-8 text-md underline underline-offset-4 hover:text-main-1">
              <Link href="/register" aria-label={messages["app.login.createAccount"]}>
                {messages["app.login.createAccount"]}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Suspense>
  );
}
