"use client";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

interface PasswordFieldProps {
  label: string;
  id: string;
  register: any;
  error?: string;
  validationRules?: object;
  labelClassName?: string;
}

export default function PasswordField({
  label,
  id,
  register,
  error,
  validationRules,
  labelClassName = "block text-md mb-2 uppercase",
}: PasswordFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="relative mt-5">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input
        className="px-4 w-full border-2 py-2 rounded-md text-sm outline-none"
        type={passwordVisible ? "text" : "password"}
        id={id}
        spellCheck={false}
        {...register(id, validationRules)}
      />
      <span
        onClick={togglePasswordVisibility}
        className="absolute right-4 top-[70%] transform -translate-y-1/2 cursor-pointer"
      >
        {passwordVisible ? (
          <EyeIcon className="h-6 w-6 text-black" />
        ) : (
          <EyeSlashIcon className="h-6 w-6 text-gray-500" />
        )}
      </span>
      {!!error && <p className="text-sm text-red-700 pt-2 font-semibold">{error}</p>}
    </div>
  );
}
