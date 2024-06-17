"use client";

import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { useTransition } from "react";
import { deleteLineFromCheckout } from "../checkout/actions";

type Props = {
  lineId: string;
};

export const DeleteLineButton = ({ lineId }: Props) => {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout) {
    return null;
  }
  const [isPending, startTransition] = useTransition();
  const handleDelete = async () => {
    if (isPending) return;
    startTransition(async () => {
      const response = await deleteLineFromCheckout({ lineId, id: checkout.id });
      if (response && response.success) {
        await refreshCheckout();
      }
    });
  };
  return (
    <button
      type="button"
      className="text-md font-medium text-white-600 hover:text-red-500 sm:ml-0 sm:mt-3"
      onClick={handleDelete}
      aria-disabled={isPending}
      title="Elimină"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};
