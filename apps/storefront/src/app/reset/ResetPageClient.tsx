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
    <div className="w-[85%] md:w-[35%]">
      {token && emailQ ? <ResetForm messages={messages} /> : <ForgotPassword messages={messages} />}
    </div>
  );
}
