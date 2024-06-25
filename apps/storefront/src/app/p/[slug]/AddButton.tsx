"use client";

import { Messages } from "@/lib/util";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { useFormStatus } from "react-dom/";

export function AddButton({ disabled, messages }: { disabled?: boolean; messages: Messages }) {
  const { pending } = useFormStatus();
  const isButtonDisabled = disabled || pending;

  return (
    <button
      type="submit"
      aria-disabled={isButtonDisabled}
      aria-busy={pending}
      onClick={(e) => isButtonDisabled && e.preventDefault()}
      className="w-full h-12 bg-action-1 m-auto px-6 py-3 text-md font-medium leading-6 text-white shadow hover:bg-action-2 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70	hover:aria-disabled:bg-neutral-700"
    >
      {pending ? (
        <div className="inline-flex items-center">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{messages["app.product.adding"]}</span>
        </div>
      ) : (
        <span>{messages["app.product.addToCart"]}</span>
      )}
    </button>
  );
}
