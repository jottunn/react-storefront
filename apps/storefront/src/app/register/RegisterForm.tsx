"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FormProps } from "../login/LoginForm";
import { register } from "../actions";

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gdprConsent: boolean;
}

export default function RegisterForm({ messages }: FormProps) {
  const router = useRouter();
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
          </p>
        )}
      </div>
      <div className="mt-5">
        <label htmlFor="password" className="block text-md mb-2 uppercase">
          {messages["app.login.passwordField"]}
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
            {messages[errorsForm.password?.type || ""] ||
              messages[errorsForm.password?.message || ""]}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="confirmPassword" className="block text-md mb-2 uppercase">
          {messages["app.preferences.newPassword.header"]}
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
          {messages["app.login.gdprConsent"]}
        </label>
        {!!errorsForm.gdprConsent && (
          <p className="text-sm text-red-500 pt-2"> {messages["app.login.gdprConsentErr"]}</p>
        )}
      </div>

      <div className="">
        <button
          type="submit"
          className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-4 transition duration-100"
        >
          {messages["app.register.registerButton"]}
        </button>
      </div>
    </form>
  );
}
