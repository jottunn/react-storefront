"use client";

import { addItem } from "@/components/checkout/actions";
import { Messages } from "@/lib/util";
import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { useFormStatus } from "react-dom";

export function AddButton({
  disabled,
  messages,
  selectedVariantId,
}: {
  disabled?: boolean;
  messages: Messages;
  selectedVariantId?: string;
}) {
  const { pending } = useFormStatus();
  const isButtonDisabled = disabled || pending;
  const [variantId, setVariantId] = useState(selectedVariantId);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const selectedVariantId = formData.get("selectedVariantId")?.toString();

    if (!selectedVariantId) {
      setError("No variant selected");
      return;
    }

    const result = await addItem({ selectedVariantId });

    if (result?.error) {
      setError(result.error);
    } else {
      // Handle success, e.g., display a success message or redirect
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="m-auto text-left">
        <input type="hidden" name="selectedVariantId" value={variantId} />
        <button
          type="submit"
          aria-disabled={isButtonDisabled}
          aria-busy={pending}
          aria-label={messages["app.product.addToCart"]}
          onClick={(e) => isButtonDisabled && e.preventDefault()}
          className="w-full h-12 bg-action-1 m-auto px-6 py-3 text-md font-medium leading-6 text-white shadow hover:bg-action-2 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-500	hover:aria-disabled:bg-neutral-600"
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
      </form>
      {error && <div className="text-red-500 mt-4 text-sm">{messages[error] || error}</div>}
    </>
  );
}
