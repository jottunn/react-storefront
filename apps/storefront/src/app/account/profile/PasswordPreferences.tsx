"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { passwordChange } from "src/app/actions";
import { useUserContext } from "../UserContext";

interface PasswordChangeFormData {
  oldPassword: string;
  newPassword: string;
  newPasswordRepeat: string;
}

export function PasswordPreferences() {
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const { messages } = useUserContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<PasswordChangeFormData>();

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
        <div className="grid grid-cols-12 gap-4 w-full">
          <div className="col-span-full">
            <label htmlFor="oldPassword" className="block pl-1 text-sm font-medium text-gray-700">
              {messages["app.preferences.changePassword.oldPasswordFieldLabel"]}
            </label>
            <input
              className="px-4 py-2 rounded-md text-sm outline-none w-full"
              type="password"
              placeholder={messages["app.preferences.changePassword.oldPasswordFieldLabel"]}
              id="oldPassword"
              spellCheck={false}
              {...register("oldPassword", {
                required: true,
              })}
            />
            {!!errors.oldPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.oldPassword.message && messages[errors.oldPassword.message]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 w-full mt-2">
          <div className="col-span-full">
            <label htmlFor="newPassword" className="block pl-1 text-sm font-medium text-gray-700">
              {messages["app.preferences.changePassword.newPasswordFieldLabel"]}
            </label>
            <input
              className="px-4 py-2 rounded-md text-sm outline-none w-full"
              type="password"
              placeholder={messages["app.preferences.changePassword.newPasswordFieldLabel"]}
              id="newPassword"
              spellCheck={false}
              {...register("newPassword", {
                required: true,
              })}
            />
            {!!errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newPassword.message && messages[errors.newPassword.message]}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 w-full mt-2">
          <div className="col-span-full">
            <label htmlFor="password" className="block pl-1 text-sm font-medium text-gray-700">
              {messages["app.preferences.newPassword.header"]}
            </label>
            <input
              className="px-4 py-2 rounded-md text-sm outline-none w-full"
              type="password"
              placeholder={messages["app.preferences.newPassword.header"]}
              id="password"
              spellCheck={false}
              {...register("newPasswordRepeat", {
                required: true,
              })}
            />
            {!!errors.newPasswordRepeat && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newPasswordRepeat.message && messages[errors.newPasswordRepeat.message]}
              </p>
            )}
          </div>
        </div>
        {!!successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
        <div>
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
