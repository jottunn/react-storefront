"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmAccount } from "../actions";
import { FormProps } from "../login/LoginForm";
import { useEffect, useState } from "react";

export interface ConfirmData {
  email: string;
  token: string;
}
export default function ConfirmResult({ messages }: FormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  useEffect(() => {
    const confirmAccountAsync = async () => {
      if (typeof email === "string" && typeof token === "string") {
        const result = await confirmAccount({ email, token });
        if (result.success) {
          router.push("/login?confirmed=1");
        } else if (result.errors) {
          setConfirmationMessage(result.errors?.[0].code || "");
        }
      } else {
        setConfirmationMessage("INVALID");
      }
    };
    confirmAccountAsync();
  }, [email, token]);

  return <p className="text-md  mt-2">{confirmationMessage && messages[confirmationMessage]}</p>;
}
