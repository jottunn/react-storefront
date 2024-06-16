"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FormProps } from "../login/LoginForm";
import { requestPasswordReset } from "../actions";

export interface ResetFormData {
  email: string;
}

export default function ForgotPassword({ messages }: FormProps) {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const {
    register,
    formState: { errors: errorsForm },
    setError: setErrorForm,
    handleSubmit: handleSubmitForm,
  } = useForm<ResetFormData>();

  const handleSubmit = handleSubmitForm(async (formData: ResetFormData) => {
    const result = await requestPasswordReset(formData);
    if (result.success) {
      setSuccessMessage(true);
    } else if (result.errors) {
      setErrorForm("email", { message: result?.errors.join(", ") });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <p className="mb-4 text-xs hover:text-main-1">
          &#8701;&nbsp;
          <Link href="/login" className="underline" aria-label={messages["app.login.backLogin"]}>
            {messages["app.login.backLogin"]}
          </Link>
        </p>
        <h1 className="text-2xl font-bold mt-2">{messages["app.login.remindPassword"]}</h1>
        <p className="text-md  mt-2">{messages["app.login.forgotPasswordText"]}</p>
        {!!errorsForm.email && (
          <p className="text-red-700 font-bold text-sm mt-4">
            {messages[errorsForm.email?.message || ""]}
          </p>
        )}
      </div>
      <div className="my-6">
        <label htmlFor="email" className="block text-grey-darker text-md mb-2 uppercase">
          {messages["app.login.emailField"]}
        </label>
        <input
          type="email"
          id="email"
          {...register("email", { required: "Email is required" })}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-4 transition duration-100"
        >
          {messages["app.login.forgotPasswordSendLinkButton"]}
        </button>
      </div>
      {successMessage && (
        <p className="text-action-1 text-action-1 font-bold text-sm">
          {" "}
          {messages["app.login.forgotPasswordAfterSubmit"]}
        </p>
      )}
    </form>
  );
}
