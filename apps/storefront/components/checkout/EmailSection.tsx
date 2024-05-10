import React, { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import {
  CheckoutDetailsFragment,
  useCheckoutEmailUpdateMutation,
  useRegisterMutation,
  useCheckoutCustomerAttachMutation,
} from "@/saleor/api";
import { Button } from "../Button";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { useRouter } from "next/router";
import { pagesPath } from "@/lib/$path";
import { useUser } from "@/lib/useUser";
import { BASE_URL } from "@/lib/const";

export interface EmailSectionProps {
  checkout: CheckoutDetailsFragment;
}

export function EmailSection({ checkout }: EmailSectionProps) {
  const t = useIntl();
  const { query, currentChannel } = useRegions();
  const { signIn } = useSaleorAuthContext();
  const { authenticated, user } = useUser();
  const router = useRouter();
  const [modifyEmail, setModifyEmail] = useState(!checkout?.email);
  const [createAccount, setCreateAccount] = useState(false);
  const [isSignInVisible, setIsSignInVisible] = useState(false);
  const [checkoutEmailUpdate] = useCheckoutEmailUpdateMutation({});
  const [createAccountMutation] = useRegisterMutation({});
  const [customerAttach] = useCheckoutCustomerAttachMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    setError,
  } = useForm({
    defaultValues: {
      email: checkout?.email || "",
      password: "",
    },
  });

  const onEmailFormSubmit = handleSubmit(async (formData) => {
    // If user opts to create an account, handle account creation logic
    if (createAccount) {
      const redirectUrl = `${BASE_URL}${pagesPath.account.confirm.$url().pathname}`;
      const accountResult = await createAccountMutation({
        variables: {
          input: {
            email: formData.email,
            password: formData.password,
            channel: currentChannel.slug,
            redirectUrl: redirectUrl,
          },
        },
      });
      // Handle account creation result (success or error handling)
      const accountMutationErrors = accountResult.data?.accountRegister?.errors || [];
      if (accountMutationErrors.length > 0) {
        const customError = accountMutationErrors[0] as any;
        setError("email" || "password", { message: customError.code || "" });
        return;
      }
    }

    const emailUpdateResult = await checkoutEmailUpdate({
      variables: {
        email: formData.email,
        token: checkout?.token,
        locale: query.locale,
      },
    });
    const mutationErrors = emailUpdateResult.data?.checkoutEmailUpdate?.errors || [];
    if (mutationErrors.length > 0) {
      const customMutationError = mutationErrors[0] as any;
      setError("email", { message: customMutationError.code || "" });
      return;
    }
    setModifyEmail(false);
  });

  const handleSignInSubmit = async (formData: { email: string; password: string }) => {
    const { data } = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (data?.tokenCreate?.errors?.length) {
      setError("email", { message: "INVALID_CREDENTIALS" });
      return;
    }

    // After successful sign-in, update the checkout with the user's email
    const emailUpdateResult = await checkoutEmailUpdate({
      variables: {
        token: checkout.token,
        email: formData.email,
        locale: query.locale,
      },
    });

    if (emailUpdateResult.data?.checkoutEmailUpdate?.errors?.length) {
      // Handle checkout email update errors
      setError("email", { message: "updateCheckotEmail" });
      return;
    }

    //attach customer to current checkout
    const customerAttachResult = await customerAttach({
      variables: {
        checkoutId: checkout.id,
        locale: query.locale,
      },
    });

    if (customerAttachResult.data?.checkoutCustomerAttach?.errors?.length) {
      // Handle checkout email update errors
      setError("email", { message: "updateCheckotEmail" });
      return;
    }
    void router.push(router.asPath);
  };

  const handleMakeAccountCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCreateAccount(e.target.checked);
  };

  const toggleSignInVisibility = () => setIsSignInVisible((prev) => !prev);

  return (
    <>
      <div className="mt-4 mb-8 flex flex-row items-baseline justify-between">
        <h2 className="checkout-section-header-active">
          {t.formatMessage(messages.emailAddressCardHeader)}
        </h2>
        {!isSignInVisible && !authenticated && (
          <p className="text-md">
            {t.formatMessage(messages.alreadyHaveAccountHeader)}&nbsp;
            <a
              href="#"
              onClick={toggleSignInVisibility}
              className="underline underline-offset-4 hover:text-action-1"
            >
              {t.formatMessage(messages.logIn)}
            </a>
          </p>
        )}
      </div>
      <div className="col-span-full text-md text-red-800 bg-red-50" role="alert">
        {errors.email && (
          <span className="font-medium text-sm">
            {t.formatMessage({ id: errors.email?.message || "error" })}
          </span>
        )}
        {errors.password && (
          <span className="text-red-500 font-medium text-sm">
            {t.formatMessage({ id: errors.password?.message || "error" })}
          </span>
        )}
      </div>
      {isSignInVisible && !authenticated ? (
        <form method="post" onSubmit={handleSubmit(handleSignInSubmit)}>
          <div className="my-3">
            <label htmlFor="email" className="block text-md mb-2">
              {t.formatMessage(messages.loginEmailFieldLabel)}
            </label>
            <input
              className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
              type="email"
              id="email"
              spellCheck={false}
              {...register("email", {
                required: {
                  value: true,
                  message: "REQUIRED",
                },
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "invalidEmail",
                },
              })}
            />
          </div>
          <div className="mt-5 mb-5">
            <label htmlFor="password" className="block text-md mb-2">
              {t.formatMessage(messages.loginPasswordFieldLabel)}
            </label>
            <input
              className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
              type="password"
              id="password"
              spellCheck={false}
              {...register("password", {
                required: {
                  value: true,
                  message: "REQUIRED",
                },
                minLength: {
                  value: 8,
                  message: "PASSWORD_TOO_SHORT",
                },
              })}
            />
          </div>
          <Button type="submit" label={t.formatMessage(messages.logIn)} className="mr-2" />
          <Button
            onClick={toggleSignInVisibility}
            variant="secondary"
            label={t.formatMessage(messages.back)}
          />
        </form>
      ) : (
        <>
          {!modifyEmail ? (
            <div className="flex justify-between items-center">
              <p className="text-base">{checkout?.email}</p>
              {createAccount && isSubmitSuccessful && (
                <p>{t.formatMessage(messages.registerSuccess)}</p>
              )}
              {!authenticated && (
                <Button
                  onClick={() => setModifyEmail(true)}
                  label={t.formatMessage(messages.changeButton)}
                ></Button>
              )}
            </div>
          ) : (
            <form method="post" onSubmit={onEmailFormSubmit}>
              <div className="grid grid-cols-12 gap-4 w-full">
                <div className="col-span-full">
                  <label htmlFor="email" className="block text-md uppercase mb-2">
                    {t.formatMessage(messages.loginEmailFieldLabel)}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full border-gray-300 rounded-lg shadow-sm text-base"
                    spellCheck={false}
                    {...register("email", {
                      required: true,
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "invalidEmail",
                      },
                    })}
                    value={user?.email}
                  />
                </div>
                {!authenticated && (
                  <div className="col-span-full">
                    <label>
                      <input
                        className="w-4 h-4 text-action-1 bg-gray-100 border-gray-300 focus:ring-action-1 dark:focus:ring-action-1 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600 !opacity-100"
                        type="checkbox"
                        checked={createAccount}
                        onChange={handleMakeAccountCheckboxChange}
                      />
                      <span className="pl-5 text-base">
                        {t.formatMessage(messages.createNewAccountFromCheckoutHeader)}
                      </span>
                    </label>
                  </div>
                )}
                {createAccount && !authenticated && (
                  // Render password field only if `createAccount` is true
                  <div className="col-span-full">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {t.formatMessage(messages.registerPasswordFieldLabel)}
                    </label>
                    <input
                      className="w-full border-gray-300 rounded-lg shadow-sm text-base"
                      type="password"
                      id="password"
                      {...register("password", {
                        required: "REQUIRED",
                        minLength: {
                          value: 8,
                          message: "PASSWORD_TOO_SHORT",
                        },
                      })}
                    />
                  </div>
                )}
                {!authenticated && !isSignInVisible && (
                  <div className="col-span-full">
                    <Button
                      type="submit"
                      className="btn-checkout-section md:w-[30%]"
                      label={t.formatMessage(messages.saveButton)}
                    />
                  </div>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </>
  );
}
