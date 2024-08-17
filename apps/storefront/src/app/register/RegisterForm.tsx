"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FormProps } from "../login/LoginForm";
import { register } from "../actions";
import Link from "next/link";
import { Button } from "@/components/Button/Button";
import PasswordField from "@/components/account/PasswordField";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gdprConsent: boolean;
  nwlRegister: boolean;
}

export default function RegisterForm({ messages }: FormProps) {
  const router = useRouter();

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    watch,
    formState: { errors: errorsForm },
    setError: setErrorForm,
  } = useForm<RegisterFormData>({
    defaultValues: {
      gdprConsent: false,
      nwlRegister: false,
    },
  });

  const password = watch("password");

  const handleRegister = handleSubmitForm(async (formData: RegisterFormData) => {
    if (!formData.gdprConsent) {
      setErrorForm("gdprConsent", { message: "gdprConsentErr" });
      return;
    }

    const result = await register(formData);
    if (result.errors) {
      // Unable to sign in.
      result.errors.forEach((e: any) => {
        if (e.field === "email") {
          setErrorForm("email", { message: e?.code || "error" });
        } else if (e.field === "password") {
          setErrorForm("password", { message: e?.code || "error" });
        } else {
          setErrorForm("email", { message: e?.code || "error" });
          console.error("Registration error:", e);
        }
      });
      return;
    }
    // User signed in successfully.
    router.push("/login?confirmed=in-progress");
  });

  return (
    <form method="post" onSubmit={handleRegister}>
      <div>
        <h1 className="text-2xl font-bold">{messages["app.register.header"]}</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="my-3">
          <label htmlFor="lastName" className="block text-md mb-2 uppercase">
            {messages["app.checkout.lastNameField"]}
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
            {messages["app.checkout.firstNameField"]}
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
          {messages["app.login.emailField"]}
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
            {messages[errorsForm.email?.type || ""] || messages[errorsForm.email?.message || ""]}
            {errorsForm.email?.message === "UNIQUE" && (
              <Link
                href="/reset"
                className="text-sm text-gray-700 underline hover:text-black cursor-pointer pl-2"
              >
                {messages["app.login.remindPassword"]}
              </Link>
            )}
          </p>
        )}
      </div>

      <PasswordField
        label={messages["app.login.passwordField"]}
        id="password"
        register={registerForm}
        validationRules={{
          required: messages["required"],
          minLength: {
            value: 8,
            message: messages["PASSWORD_TOO_SHORT"],
          },
        }}
        error={
          (errorsForm.password?.message && messages[errorsForm.password?.type || ""]) ||
          messages[errorsForm.password?.message || ""]
        }
      />

      <PasswordField
        label={messages["app.preferences.newPassword.header"]}
        id="confirmPassword"
        register={registerForm}
        validationRules={{
          required: messages["required"],
          validate: (value: string) => value === password || messages["passwordsDoNotMatch"],
        }}
        error={
          (errorsForm.confirmPassword?.message &&
            messages[errorsForm.confirmPassword?.type || ""]) ||
          messages[errorsForm.confirmPassword?.message || ""]
        }
        labelClassName="block pl-1 text-sm font-medium text-gray-700"
      />

      {/* GDPR Consent Checkbox */}
      <div className="my-3">
        <label htmlFor="gdprConsent" className="text-md">
          <input
            type="checkbox"
            id="gdprConsent"
            {...registerForm("gdprConsent")}
            className="mr-2"
          />
          <span className="mr-1">{messages["app.login.gdprConsent"]}</span>
          <Link className="inline-block underline hover:text-action-1" href="/termeni-si-conditii">
            {messages["app.nwl.terms"]}
          </Link>
        </label>
        {!!errorsForm.gdprConsent && (
          <p className="text-sm text-red-500 pt-2"> {messages["app.login.gdprConsentErr"]}</p>
        )}
      </div>

      {/* Newsletter */}
      <div className="my-3">
        <label htmlFor="nwlRegister" className="text-md">
          <input
            type="checkbox"
            id="nwlRegister"
            {...registerForm("nwlRegister")}
            className="mr-2"
          />
          <span className="mr-1">{messages["app.register.nwl"]}</span>
        </label>
      </div>

      <div className="">
        <Button
          type="submit"
          label={messages["app.register.registerButton"]}
          variant="tertiary"
          className="w-full mt-4 mb-3 !h-12"
        />
      </div>
    </form>
  );
}
