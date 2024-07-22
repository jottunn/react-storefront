"use client";
import React, { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { User } from "@/saleor/api";
import { Button } from "../Button";
import { useRouter } from "next/navigation";
import { Messages } from "@/lib/util";
import { checkoutEmailUpdate, customerAttach, customerDetach } from "./actions";
import { login, register as registerUser } from "src/app/actions";
import { useCheckout } from "@/lib/hooks/CheckoutContext";

export interface EmailSectionProps {
  messages: Messages;
  user: User;
}

function EmailSection({ messages, user }: EmailSectionProps) {
  const router = useRouter();
  const { checkout } = useCheckout();
  const [modifyEmail, setModifyEmail] = useState(!checkout?.email);
  const [createAccount, setCreateAccount] = useState(false);
  const [isSignInVisible, setIsSignInVisible] = useState(false);

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

  if (!checkout) {
    return;
  }

  const onEmailFormSubmit = async (formData: any) => {
    // If user opts to create an account, handle account creation logic
    if (createAccount) {
      const result = await registerUser(formData);
      if (result.errors) {
        const customError = result.errors[0] as any;
        setError("email" || "password", { message: customError });
        return;
      }
    }
    const emailUpdateResult = await checkoutEmailUpdate({ id: checkout.id, email: formData.email });

    if (emailUpdateResult?.success === false) {
      // Handle checkout email update errors
      setError("email", { message: "updateCheckotEmail" });
      return;
    }

    setModifyEmail(false);
    router.refresh();
  };

  const handleSignInSubmit = async (formData: { email: string; password: string }) => {
    const result = await login(formData);

    if (result.errors) {
      setError("email", { message: "INVALID_CREDENTIALS" });
      return;
    }

    if (checkout.email) {
      //detaching if any existing customer already attached
      //temp fix for https://github.com/saleor/saleor/issues/12037
      const detachExisting = await customerDetach(checkout.id);

      if (detachExisting?.success === false) {
        // Handle detaching errors
        setError("email", { message: "updateCheckotEmail" });
        return;
      }
    }

    // After successful sign-in, update the checkout with the user's email
    const emailUpdateResult = await checkoutEmailUpdate({ id: checkout.id, email: formData.email });

    if (emailUpdateResult?.success === false) {
      // Handle checkout email update errors
      setError("email", { message: "updateCheckotEmail" });
      return;
    }

    //attach customer to current checkout
    const customerAttachResult = await customerAttach(checkout.id);

    if (customerAttachResult?.success === false) {
      setError("email", { message: "updateCheckoutEmail" });
      return;
    }

    router.refresh();
  };

  const handleMakeAccountCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCreateAccount(e.target.checked);
  };

  const toggleSignInVisibility = () => setIsSignInVisible((prev) => !prev);

  return (
    <>
      <div className="mt-4 mb-8 flex flex-row items-baseline justify-between">
        <h2 className="checkout-section-header-active">
          {messages["app.checkout.emailAddressCardHeader"]}
        </h2>
        {!isSignInVisible && !user && (
          <p className="text-md">
            {messages["app.checkout.alreadyHaveAccountHeader"]}&nbsp;
            <a
              href="#"
              onClick={toggleSignInVisibility}
              className="underline underline-offset-4 hover:text-action-1"
            >
              {messages["app.navigation.login"]}
            </a>
          </p>
        )}
      </div>
      <div className="col-span-full text-md text-red-800 bg-red-50" role="alert">
        {errors.email && (
          <span className="font-medium text-sm">
            {errors.email?.message && messages[errors.email?.message]}
          </span>
        )}
        {errors.password && (
          <span className="text-red-500 font-medium text-sm">
            {errors.password?.message && messages[errors.password?.message]}
          </span>
        )}
      </div>
      {isSignInVisible && !user ? (
        <form method="post" onSubmit={handleSubmit(handleSignInSubmit)}>
          <div className="my-3">
            <label htmlFor="email" className="block text-md mb-2">
              {messages["app.register.emailField"]}
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
              {messages["app.register.passwordField"]}
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
              })}
            />
          </div>
          <Button type="submit" label={messages["app.navigation.login"]} className="mr-2" />
          <Button
            onClick={toggleSignInVisibility}
            variant="secondary"
            label={messages["app.buttons.back"]}
          />
        </form>
      ) : (
        <>
          {!modifyEmail ? (
            <div className="flex justify-between items-center">
              <p className="text-base">{checkout.email}</p>
              {createAccount && isSubmitSuccessful && (
                <p>{messages["app.register.registerSuccess"]}</p>
              )}
              {!user && (
                <Button
                  onClick={() => setModifyEmail(true)}
                  label={messages["app.ui.changeButton"]}
                  variant="secondary"
                ></Button>
              )}
            </div>
          ) : (
            <form method="post" onSubmit={handleSubmit(onEmailFormSubmit)}>
              <div className="grid grid-cols-12 gap-4 w-full">
                <div className="col-span-full">
                  <label htmlFor="email" className="block text-md uppercase mb-2">
                    {messages["app.register.emailField"]}
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full border-gray-300 rounded-md shadow-sm text-base"
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
                {!user && (
                  <div className="col-span-full">
                    <label>
                      <input
                        className="w-4 h-4 text-action-1 bg-gray-100 border-gray-300 focus:ring-action-1 dark:focus:ring-action-1 dark:ring-offset-gray-800 focus:ring-2 dark:bg-neutral-100 dark:border-gray-600 !opacity-100"
                        type="checkbox"
                        checked={createAccount}
                        onChange={handleMakeAccountCheckboxChange}
                      />
                      <span className="pl-5 text-base">
                        {messages["app.register.createNewAccountFromCheckoutHeader"]}
                      </span>
                    </label>
                  </div>
                )}
                {createAccount && !user && (
                  // Render password field only if `createAccount` is true
                  <div className="col-span-full">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      {messages["app.register.passwordField"]}
                    </label>
                    <input
                      className="w-full border-gray-300 rounded-md shadow-sm text-base"
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
                {!user && !isSignInVisible && (
                  <div className="col-span-full">
                    <Button
                      type="submit"
                      className="btn-checkout-section md:w-[30%]"
                      label={messages["app.ui.saveButton"]}
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
export default EmailSection;
