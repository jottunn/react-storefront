"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ForgotPassword from "./ForgotPassword";
import ResetForm from "./ResetPasswordForm";
import { FormProps } from "../login/LoginForm";

export default function ResetPageClient({ messages }: FormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailQ = searchParams.get("email");

  return (
    <div className="w-full md:w-[50%] bg-white bg-opacity-90 p-20">
      {token && emailQ ? <ResetForm messages={messages} /> : <ForgotPassword messages={messages} />}
    </div>
  );
}
