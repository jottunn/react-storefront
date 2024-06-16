import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormProps } from "../login/LoginForm";
import { reset } from "../actions";

export interface ResetPasswordFormData {
  email: string;
  token: string;
  password: string;
}
export default function ResetForm({ messages }: FormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailQ = searchParams.get("email");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    formState: { errors: errorsForm },
    setError: setErrorForm,
    handleSubmit: handleSubmitForm,
  } = useForm<ResetPasswordFormData>();

  useEffect(() => {
    // Clear form when navigating away or token changes
    return () => {
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    };
  }, [token]);

  const handleResetSubmit = handleSubmitForm(async (formData: ResetPasswordFormData) => {
    if (newPassword !== confirmPassword) {
      setError("INVALID");
      return;
    }

    if (!emailQ || !token) {
      setError("");
      return;
    }
    setIsSubmitting(true);
    formData["email"] = emailQ;
    formData["token"] = token;
    const result = await reset(formData);

    if (result.errors?.length) {
      const customError = result.errors[0] as any;
      setError(customError?.code || "");
    } else {
      router.push("/account");
    }
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={handleResetSubmit}>
      <h1 className="text-md">
        {messages["app.login.forgotPasswordHeadline"]}
        <span className="font-semibold ml-2">{emailQ}</span>{" "}
      </h1>
      {error && <p className="text-red-700 font-bold text-sm mt-4">{messages[error]}</p>}
      <div className="mt-5">
        <input
          type="password"
          value={newPassword}
          id="password"
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={messages["app.preferences.changePassword.newPasswordFieldLabel"]}
          required
        />
      </div>
      <div className="mt-5">
        <input
          type="password"
          value={confirmPassword}
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={messages["app.preferences.newPassword.header"]}
          required
        />
      </div>
      <div className="mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
        >
          {messages["app.login.forgotPasswordButton"]}
        </button>
      </div>
    </form>
  );
}
