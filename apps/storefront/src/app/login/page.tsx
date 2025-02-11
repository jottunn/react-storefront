import LoginForm from "src/app/login/LoginForm";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import Link from "next/link";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
const messages = getMessages(DEFAULT_LOCALE);
import styles from "./Login.module.css";
import clsx from "clsx";

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
      <section className={clsx(styles["account-bkg"], "mx-auto max-w-10xl min-h-[400px] p-4")}>
        <div className="container pb-40 pt-20 md:pt-40 flex justify-center items-center">
          <div className="w-full md:w-[50%] bg-white bg-opacity-90 p-20">
            <div>
              <LoginForm messages={messages} />
              <p className="mt-8 text-md underline underline-offset-4 hover:text-main-1">
                <Link href="/register" aria-label={messages["app.login.createAccount"]}>
                  {messages["app.login.createAccount"]}
                </Link>
              </p>
            </div>
            <div className="mt-8">
              <p className="text-sm">
                {messages["app.login.prevAccount"]}
                <Link
                  href="/reset"
                  className="text-sm text-blue-700 underline cursor-pointer pt-2 pl-1"
                >
                  {messages["app.login.prevAccountLink"]}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Suspense>
  );
}
