"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "src/app/actions";
import { useForm } from "react-hook-form";
import Link from "next/link";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface FormProps {
  messages: { [key: string]: string };
}

export default function LoginForm({ messages }: FormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    setError: setErrorForm,
  } = useForm<LoginFormData>();

  const handleSubmit = handleSubmitForm(async (formData: LoginFormData) => {
    const result = await login(formData);
    if (result.success) {
      router.push("/account");
    } else if (result.errors) {
      setErrorForm("email", { message: result?.errors.join(", ") });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <span className={`text-md ${confirmed ? "text-action-1" : "text-gray-900"}`}>
          {confirmed === "1"
            ? messages["app.register.accountConfirmed"]
            : confirmed === "in-progress"
              ? messages["app.register.accountConfirmationInProgress"]
              : messages["app.login.greeting"]}
        </span>
        <h1 className="text-2xl font-bold mt-2">{messages["app.login.header"]}</h1>
      </div>

      <div className="my-3">
        <label htmlFor="email" className="block text-md mb-2 uppercase">
          {messages["app.login.emailField"]}
        </label>
        <input
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          type="email"
          id="email"
          spellCheck={false}
          {...registerForm("email", {
            required: true,
          })}
        />
      </div>
      <div className="mt-5">
        <label htmlFor="password" className="block text-md mb-2 uppercase">
          {messages["app.login.passwordField"]}
        </label>
        <input
          className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
          type="password"
          id="password"
          spellCheck={false}
          {...registerForm("password", {
            required: true,
          })}
        />
      </div>
      <div className="flex justify-between">
        <Link href="/reset" className="text-sm text-blue-700 hover:underline cursor-pointer pt-2">
          {messages["app.login.remindPassword"]}
        </Link>
      </div>
      <div>
        <button
          type="submit"
          className="mt-4 mb-3 w-full bg-main hover:bg-main-1 text-white text-md py-4 transition duration-100"
        >
          {messages["app.navigation.login"]}
        </button>
        {!!errorsForm.email && (
          <p className="text-sm text-red-700 pt-2 font-semibold">
            {errorsForm.email?.message && messages[errorsForm.email.message]}
          </p>
        )}
      </div>
    </form>
  );
}
