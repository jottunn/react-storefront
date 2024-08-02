"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormProps } from "../login/LoginForm";
import { setPassword } from "../actions";
import { Button } from "@/components/Button/Button";

export interface ResetPasswordFormData {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export default function ResetForm({ messages }: FormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailQ = searchParams.get("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  useEffect(() => {
    return () => {
      setError("");
    };
  }, [token]);
  console.log("render", error);

  const handleResetSubmit = async (formData: ResetPasswordFormData) => {
    if (formData.password !== formData.confirmPassword) {
      setError(messages["passwordsDoNotMatch"]);
      return;
    }

    if (!emailQ || !token) {
      setError("Invalid email or token");
      return;
    }
    setIsSubmitting(true);
    formData.email = emailQ;
    formData.token = token;

    const result = await setPassword(formData);
    if (result.errors?.length) {
      const customError = result.errors[0] as any;
      setError(customError || "ERROR");
    } else {
      router.push("/account");
    }
    setIsSubmitting(false);
  };

  // Watch confirmPassword value to validate password
  const confirmPassword = watch("confirmPassword");

  return (
    <form onSubmit={handleSubmit(handleResetSubmit)}>
      <h1 className="text-md">
        {messages["app.login.forgotPasswordHeadline"]}
        <span className="font-semibold ml-2">{emailQ}</span>{" "}
      </h1>
      {error && <p className="text-red-700 font-bold text-sm mt-4">{messages[error]}</p>}
      <div className="mt-5">
        <input
          type="password"
          id="password"
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          placeholder={messages["app.preferences.changePassword.newPasswordFieldLabel"]}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: messages["PASSWORD_TOO_SHORT"],
            },
            validate: (value) => value === confirmPassword || messages["passwordsDoNotMatch"],
          })}
          required
        />
        {errors.password && (
          <p className="text-red-700 font-bold text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div className="mt-5">
        <input
          type="password"
          id="confirmPassword"
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          placeholder={messages["app.preferences.newPassword.header"]}
          {...register("confirmPassword", { required: "Confirm Password is required" })}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-700 font-bold text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      <div className="mt-5">
        <Button
          type="submit"
          disabled={isSubmitting}
          label={messages["app.login.forgotPasswordButton"]}
          variant="tertiary"
          className="w-full mt-4 mb-3 !h-12 "
        />
      </div>
    </form>
  );
}
