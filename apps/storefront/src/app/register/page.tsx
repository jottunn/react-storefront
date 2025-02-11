import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { getMessages } from "@/lib/util";
import { DEFAULT_LOCALE } from "@/lib/regions";
import RegisterForm from "./RegisterForm";
import Link from "next/link";
import { STOREFRONT_NAME, STOREFRONT_URL } from "@/lib/const";
const messages = getMessages(DEFAULT_LOCALE);
import styles from "../login/Login.module.css";
import clsx from "clsx";

export const metadata = {
  title: `${messages["app.register.header"]} | ${STOREFRONT_NAME}`,
  description: `${messages["app.register.header"]} -  Surmont.ro`,
  alternates: {
    canonical: STOREFRONT_URL ? STOREFRONT_URL + `/register` : undefined,
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
      <section className={clsx(styles["account-bkg"], "mx-auto max-w-10xl min-h-[400px] p-4")}>
        <div className="container pb-40 pt-40 flex justify-center items-center">
          <div className="w-full md:w-[50%] bg-white bg-opacity-90 p-20">
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
