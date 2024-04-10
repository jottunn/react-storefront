import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { messages } from "@/components/translations";
import { DEMO_MODE } from "@/lib/const";
import { usePaths } from "@/lib/paths";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { Layout } from "@/components";

export type OptionalQuery = {
  next?: string;
};

export interface LoginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const router = useRouter();
  const paths = usePaths();
  const t = useIntl();

  const { signIn } = useSaleorAuthContext();

  const defaultValues = DEMO_MODE
    ? {
        email: "admin@example.com",
        password: "admin",
      }
    : {};

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    setError: setErrorForm,
  } = useForm<LoginFormData>({ defaultValues });

  const routerQueryNext = router.query.next?.toString() || "";

  const handleLogin = handleSubmitForm(async (formData: LoginFormData) => {
    const { data } = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (data?.tokenCreate?.errors?.length) {
      setErrorForm("email", { message: "Invalid credentials" });
      return;
    }

    const redirectURL =
      (routerQueryNext && new URL(routerQueryNext, window.location.toString()).pathname) ||
      paths.$url();
    void router.push(redirectURL);
  });

  return (
    <Layout>
      <div className="bg-white pb-40 pt-40 flex justify-center items-center">
        <div className="lg:w-1/4 md:w-full">
          <form method="post" onSubmit={handleLogin}>
            <div>
              <span className="text-md text-gray-900">
                {t.formatMessage(messages.loginWelcomeMessage)}
              </span>
              <h1 className="text-2xl font-bold mt-2">{t.formatMessage(messages.loginHeader)}</h1>
            </div>

            <div className="my-3">
              <label htmlFor="email" className="block text-md mb-2">
                {t.formatMessage(messages.loginEmailFieldLabel)}
              </label>
              <input
                className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                type="email"
                id="email"
                spellCheck={false}
                {...registerForm("email", {
                  required: true,
                })}
              />
            </div>
            <div className="mt-5">
              <label htmlFor="password" className="block text-md mb-2">
                {t.formatMessage(messages.loginPasswordFieldLabel)}
              </label>
              <input
                className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                type="password"
                id="password"
                spellCheck={false}
                {...registerForm("password", {
                  required: true,
                })}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-700 hover:underline cursor-pointer pt-2">
                {t.formatMessage(messages.loginRemindPasswordButtonLabel)}
              </span>
            </div>
            <div className="">
              <button
                type="submit"
                className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
              >
                {t.formatMessage(messages.logIn)}
              </button>
              {!!errorsForm.email && (
                <p className="text-sm text-red-500 pt-2">{errorsForm.email?.message}</p>
              )}
            </div>
          </form>
          <p className="mt-8 text-md underline underline-offset-4 hover:text-main-1">
            <Link href={paths.account.register.$url()}>
              {t.formatMessage(messages.createAccount)}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;
