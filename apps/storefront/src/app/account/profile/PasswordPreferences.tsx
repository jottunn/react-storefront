"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { passwordChange } from "src/app/actions";
import { Messages } from "@/lib/util";
import PasswordField from "@/components/account/PasswordField";

interface PasswordChangeFormData {
  oldPassword: string;
  newPassword: string;
  newPasswordRepeat: string;
}

interface PasswordPreferencesProps {
  messages: Messages;
}

export function PasswordPreferences({ messages }: PasswordPreferencesProps) {
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<PasswordChangeFormData>();

  const newPasswordRepeat = watch("newPasswordRepeat");

  const onPasswordPreferenceSubmit = handleSubmit(async (formData) => {
    if (formData.newPassword !== formData.newPasswordRepeat) {
      setError("newPasswordRepeat", { message: "passwordsDoNotMatch" });
    } else {
      const result = await passwordChange({
        newPassword: formData.newPassword,
        oldPassword: formData.oldPassword,
      });
      const mutationErrors = result?.errors || [];
      if (mutationErrors.length > 0) {
        mutationErrors.forEach((e: { field: string; code: any }) =>
          setError(e.field as keyof PasswordChangeFormData, {
            message: e.code || "error",
          }),
        );
      } else if (result?.user) {
        setSuccessMessage(messages["app.preferences.changePassword.changedPassword"]);
        setTimeout(() => {
          setSuccessMessage("");
        }, 10000);
      }
    }
  });
  return (
    <div className="mt-4 mb-4">
      <h2 className="checkout-section-header-active mb-2">
        {messages["app.preferences.changePassword.header"]}
      </h2>
      <form method="post" onSubmit={onPasswordPreferenceSubmit}>
        <div className="w-full md:w-1/2 space-y-4">
          <PasswordField
            label={messages["app.preferences.changePassword.oldPasswordFieldLabel"]}
            id="oldPassword"
            register={register}
            error={errors.oldPassword?.message && messages[errors.oldPassword.message]}
            validationRules={{
              required: true,
            }}
            labelClassName="block pl-1 text-sm font-medium text-gray-700"
          />
          <PasswordField
            label={messages["app.preferences.changePassword.newPasswordFieldLabel"]}
            id="newPassword"
            register={register}
            error={errors.newPassword?.message && messages[errors.newPassword.message]}
            validationRules={{
              required: true,
            }}
            labelClassName="block pl-1 text-sm font-medium text-gray-700" // Custom class for label
          />
          <PasswordField
            label={messages["app.preferences.newPassword.header"]}
            id="newPasswordRepeat"
            register={register}
            error={errors.newPasswordRepeat?.message && messages[errors.newPasswordRepeat.message]}
            validationRules={{
              required: "Please confirm your new password",
              validate: (value: string) =>
                value === newPasswordRepeat || messages["passwordsDoNotMatch"],
            }}
            labelClassName="block pl-1 text-sm font-medium text-gray-700" // Custom class for label
          />
          {!!successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
          <button
            className="mt-2 w-40 bg-main hover:bg-main-1 text-md text-white py-2 transition duration-100"
            onClick={() => onPasswordPreferenceSubmit()}
            type="submit"
          >
            {messages["app.ui.saveButton"]}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordPreferences;
