import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { messages } from "@/components/translations";
import { Layout } from "@/components";
import { usePasswordResetRequest } from "@/lib/hooks/usePasswordResetRequest";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { pagesPath } from "@/lib/$path";
import Link from "next/link";

export interface ResetFormData {
  email: string;
}

function ResetPage() {
  const router = useRouter();
  const { token } = router.query;
  const { resetPassword } = useSaleorAuthContext();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = useIntl();
  const {
    register,
    formState: { errors },
  } = useForm<ResetFormData>();

  const {
    error: requestError,
    onPasswordResetRequest,
    passwordResetSent,
  } = usePasswordResetRequest({
    email,
    shouldAbort: async () => !email, // Basic validation, consider enhancing
  });

  useEffect(() => {
    // Clear form when navigating away or token changes
    return () => {
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    };
  }, [token]);

  const handleResetSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("PASSWORDS_DO_NOT_MATCH");
      return;
    }
    setIsSubmitting(true);
    const response = await resetPassword({
      email: router.query.email as string,
      password: newPassword,
      token: token as string,
    });

    if (response.data?.setPassword?.errors?.length) {
      const customError = response.data.setPassword.errors[0] as any;
      setError(customError?.code || "");
    } else {
      router.push(pagesPath.account.preferences.$url());
    }
    setIsSubmitting(false);
  };

  if (!token) {
    return (
      <Layout>
        <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
          <div className="w-[85%] md:w-[45%]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onPasswordResetRequest();
              }}
            >
              <div>
                <p className="mb-4 text-xs hover:text-main-1">
                  &#8701;&nbsp;
                  <Link
                    href={pagesPath.account.login.$url()}
                    className="underline"
                    aria-label={t.formatMessage(messages.backLogin)}
                  >
                    {t.formatMessage(messages.backLogin)}
                  </Link>
                </p>
                <h1 className="text-2xl font-bold mt-2">
                  {t.formatMessage(messages.loginRemindPasswordButtonLabel)}
                </h1>
                <p className="text-md  mt-2">{t.formatMessage(messages.forgotPasswordText)}</p>
                {errors.email && (
                  <p className="text-red-700 font-bold text-sm mt-4">{errors.email.message}</p>
                )}
                {requestError && (
                  <p className="text-red-700 font-bold text-sm mt-4">
                    {t.formatMessage({ id: requestError })}
                  </p>
                )}
              </div>
              <div className="my-6">
                <label htmlFor="email" className="block text-grey-darker text-md mb-2 uppercase">
                  {t.formatMessage(messages.loginEmailFieldLabel)}
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
                  className="mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
                >
                  {t.formatMessage(messages.forgotPasswordSendLinkButton)}
                </button>
              </div>
              {passwordResetSent && (
                <p className="text-action-1 text-action-1 font-bold text-sm">
                  {" "}
                  {t.formatMessage(messages.forgotPasswordAfterSubmit)}
                </p>
              )}
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container bg-white pb-40 pt-40 flex justify-center items-center">
        <div className="md:w-[45%]">
          <form onSubmit={handleResetSubmit}>
            <h1 className="text-md">
              {t.formatMessage(messages.forgotPasswordHeadline)}
              <span className="font-semibold ml-2">{router.query.email}</span>{" "}
            </h1>
            {error && (
              <p className="text-red-700 font-bold text-sm mt-4">
                {t.formatMessage({ id: error })}
              </p>
            )}
            <div className="mt-5">
              <input
                type="password"
                value={newPassword}
                className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.formatMessage(messages.newPasswordFieldLabel)}
                required
              />
            </div>
            <div className="mt-5">
              <input
                type="password"
                value={confirmPassword}
                className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.formatMessage(messages.newPasswordRepeatedFieldLabel)}
                required
              />
            </div>
            <div className="mt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-2 transition duration-100"
              >
                {t.formatMessage(messages.forgotPasswordButton)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ResetPage;
