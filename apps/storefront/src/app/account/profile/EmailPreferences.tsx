"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUserContext } from "../UserContext";
import { STOREFRONT_URL } from "@/lib/const";
import { confirmEmailChange, requestEmailChange } from "src/app/actions";
import { useRouter, useSearchParams } from "next/navigation";

interface EmailChangeFormData {
  newEmail: string;
  password: string;
  redirectUrl: string;
}

function EmailPreferences() {
  const { user, messages } = useUserContext();
  const [successMessage, setSuccessMessage] = React.useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EmailChangeFormData>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    const confirmEmail = async () => {
      if (token) {
        try {
          const result = await confirmEmailChange({ token });
          if (result?.errors) {
            setError("newEmail", { message: result.errors?.[0].code });
          } else {
            router.push("/login?confirmed=1");
          }
        } catch (e) {
          // Handle the error
          console.error(e);
        }
      }
    };
    confirmEmail();
  }, [token]);

  const redirectUrl = `${STOREFRONT_URL}/account/`;
  const onEmailPreferenceSubmit = handleSubmit(async (formData: EmailChangeFormData) => {
    const result = await requestEmailChange({
      newEmail: formData.newEmail,
      password: formData.password,
      redirectUrl,
    });

    const mutationErrors = result?.errors || [];
    if (mutationErrors.length > 0) {
      mutationErrors.forEach((e: { field: string; code: any }) =>
        setError(e.field as keyof EmailChangeFormData, {
          message: e.code || "",
        }),
      );
    } else {
      setSuccessMessage(messages["app.preferences.changeEmail.changed"]);
      setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
    }
  });

  return (
    <div className="mt-4 mb-4">
      <h2 className="checkout-section-header-active mb-2">
        {messages["app.preferences.changeEmail.header"]}
      </h2>
      <form method="post" onSubmit={onEmailPreferenceSubmit}>
        <div className="grid grid-cols-12 gap-4 w-full">
          <div className="col-span-full">
            <label htmlFor="newEmail" className="block pl-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              className="px-4 py-2 rounded-md text-sm outline-none w-full"
              type="email"
              id="newEmail"
              spellCheck={false}
              {...register("newEmail", {
                required: true,
                pattern: /^\S+@\S+$/i,
              })}
              defaultValue={user?.email || ""}
            />
            {!!errors.newEmail && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newEmail.message && messages[errors.newEmail.message]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 w-full mt-2">
          <div className="col-span-full">
            <label htmlFor="password" className="block pl-1 text-sm font-medium text-gray-700">
              {messages["app.login.passwordField"]}
            </label>
            <input
              className="px-4 py-2 rounded-md text-sm outline-none w-full"
              type="password"
              id="password"
              spellCheck={false}
              {...register("password", {
                required: true,
              })}
            />
            {!!errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message && messages[errors.password.message]}
              </p>
            )}
          </div>
        </div>
        {!!successMessage && <p className="mt-2 text-md text-green-600">{successMessage}</p>}
        <div>
          <button
            className="mt-2 w-40 bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
            type="submit"
          >
            {messages["app.ui.saveButton"]}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmailPreferences;
