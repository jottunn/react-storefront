import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useConfirmEmailChangeMutation, useRequestEmailChangeMutation } from "@/saleor/api";
import { messages } from "../translations";
import { useUser } from "@/lib/useUser";
import { useRouter } from "next/router";
import { BASE_URL } from "@/lib/const";
import { pagesPath } from "@/lib/$path";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";

interface EmailChangeFormData {
  newEmail: string;
  password: string;
  redirectUrl: string;
}

export function EmailPreferences() {
  const t = useIntl();
  const [requestEmailChange] = useRequestEmailChangeMutation({});
  const [confirmEmailChangeMutation] = useConfirmEmailChangeMutation();
  const { signIn, signOut } = useSaleorAuthContext();
  const [successMessage, setSuccessMessage] = React.useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EmailChangeFormData>();
  const { user } = useUser();
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      confirmEmailChangeMutation({
        variables: { token: String(token) },
      }).then((response) => {
        if (response.data?.confirmEmailChange?.errors.length === 0) {
          console.log(response.data?.confirmEmailChange);
          setError("newEmail", { message: response.data?.confirmEmailChange?.errors?.[0].code });
        } else {
          router.push(
            pagesPath.account.login.$url({
              query: { confirmed: "1" },
            }),
          );
        }
      });
    }
  }, [token]);

  const redirectUrl = `${BASE_URL}${pagesPath.account.preferences.$url().pathname}`;
  const onEmailPreferenceSubmit = handleSubmit(async (formData) => {
    const result = await requestEmailChange({
      variables: {
        newEmail: formData.newEmail,
        password: formData.password,
        redirectUrl: redirectUrl,
      },
    });
    const mutationErrors = result?.data?.requestEmailChange?.errors || [];
    if (mutationErrors.length > 0) {
      mutationErrors.forEach((e) =>
        setError(e.field as keyof EmailChangeFormData, {
          message: e.code || "",
        }),
      );
    } else if (result.data?.requestEmailChange?.user) {
      setSuccessMessage(t.formatMessage(messages.changedEmail));
      setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
    }
  });

  return (
    <div className="mt-4 mb-4">
      <h2 className="checkout-section-header-active mb-2">
        {t.formatMessage(messages.changeEmailHeader)}
      </h2>
      <form method="post" onSubmit={onEmailPreferenceSubmit}>
        <div className="grid grid-cols-12 gap-4 w-full">
          <div className="col-span-full">
            <label htmlFor="newEmail" className="block pl-1 text-sm font-medium text-gray-700">
              {t.formatMessage(messages.loginEmailFieldLabel)}
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
                {t.formatMessage({ id: errors.newEmail.message })}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 w-full mt-2">
          <div className="col-span-full">
            <label htmlFor="password" className="block pl-1 text-sm font-medium text-gray-700">
              {t.formatMessage(messages.loginPasswordFieldLabel)}
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
                {t.formatMessage({ id: errors.password.message })}
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
            {t.formatMessage(messages.saveButton)}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmailPreferences;
