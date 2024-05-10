import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { messages } from "@/components/translations";
import { pagesPath } from "@/lib/$path";
import { useRegisterMutation } from "@/saleor/api";
import { useRegions } from "@/components/RegionsProvider";
import { Layout } from "@/components";
import { BASE_URL } from "@/lib/const";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gdprConsent: boolean;
}

function RegisterPage() {
  const router = useRouter();
  const [register] = useRegisterMutation();
  const { currentChannel } = useRegions();
  const t = useIntl();
  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    setError: setErrorForm,
  } = useForm<RegisterFormData>({
    defaultValues: {
      gdprConsent: false,
    },
  });

  const handleRegister = handleSubmitForm(async (formData: RegisterFormData) => {
    if (!formData.gdprConsent) {
      setErrorForm("gdprConsent", { message: "gdprConsentErr" });
      return;
    }
    if (formData.password !== confirmPassword) {
      setErrorForm("password", { message: "passwordsDoNotMatch" });
      return;
    }

    const confirmUrl = `${BASE_URL}${pagesPath.account.confirm.$url().pathname}`;
    const { data } = await register({
      variables: {
        input: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          redirectUrl: confirmUrl,
          channel: currentChannel.slug,
        },
      },
    });

    if (data?.accountRegister?.errors.length) {
      // Unable to sign in.
      data?.accountRegister?.errors.forEach((e) => {
        if (e.field === "email") {
          setErrorForm("email", { message: e?.code || "error" });
        } else if (e.field === "password") {
          setErrorForm("password", { message: e?.code || "error" });
        } else {
          console.error("Registration error:", e);
        }
      });
      return;
    }
    // User signed in successfully.
    void router.push(
      pagesPath.account.login.$url({
        query: { confirmed: "in-progress" },
      }),
    );
  });

  return (
    <Layout>
      <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
        <div className="w-[85%] md:w-[45%]">
          <form method="post" onSubmit={handleRegister}>
            <div>
              <h1 className="text-2xl font-bold">{t.formatMessage(messages.registerHeader)}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="my-3">
                <label htmlFor="lastName" className="block text-md mb-2 uppercase">
                  {t.formatMessage(messages.lastNameField)}
                </label>
                <input
                  className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                  type="text"
                  id="lastName"
                  spellCheck={false}
                  {...registerForm("lastName", { required: false })}
                />
              </div>

              <div className="my-3">
                <label htmlFor="firstName" className="block text-md mb-2 uppercase">
                  {t.formatMessage(messages.firstNameField)}
                </label>
                <input
                  className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                  type="text"
                  id="firstName"
                  spellCheck={false}
                  {...registerForm("firstName", { required: false })}
                />
              </div>
            </div>
            <div className="my-3">
              <label htmlFor="email" className="block text-md mb-2 uppercase">
                {t.formatMessage(messages.registerEmailFieldLabel)}
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
              {!!errorsForm.email && (
                <p className="text-sm text-red-500 pt-2">
                  {t.formatMessage({ id: errorsForm.email?.type || errorsForm.email?.message })}
                </p>
              )}
            </div>
            <div className="mt-5">
              <label htmlFor="password" className="block text-md mb-2 uppercase">
                {t.formatMessage(messages.registerPasswordFieldLabel)}
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
              {!!errorsForm.password && (
                <p className="text-sm text-red-500 pt-2">
                  {t.formatMessage({
                    id: errorsForm.password?.type || errorsForm.password?.message,
                  })}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="confirmPassword" className="block text-md mb-2 uppercase">
                {t.formatMessage(messages.newPasswordRepeatedFieldLabel)}
              </label>
              <input
                className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                spellCheck={false}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* GDPR Consent Checkbox */}
            <div className="my-3">
              <label htmlFor="gdprConsent" className="flex items-start text-md">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  {...registerForm("gdprConsent")}
                  className="mr-2 mt-2"
                />
                {t.formatMessage(messages.gdprConsent)}
              </label>
              {!!errorsForm.gdprConsent && (
                <p className="text-sm text-red-500 pt-2">
                  {" "}
                  {t.formatMessage(messages.gdprConsentErr)}
                </p>
              )}
            </div>

            <div className="">
              <button
                type="submit"
                className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
              >
                {t.formatMessage(messages.registerButton)}
              </button>
            </div>
          </form>
          <p className="mt-8 text-md underline underline-offset-4 hover:text-main-1">
            <Link href={pagesPath.account.login.$url()}>
              {t.formatMessage(messages.backToLogin)}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default RegisterPage;
