"use client";

import { Messages } from "@/lib/util";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import clsx from "clsx";
import { updateWishlist } from "src/app/actions";
import { useWishlist } from "@/components/WishlistProvider";
import dynamic from "next/dynamic";

const DynamicDialog = dynamic(() => import("@headlessui/react").then((mod) => mod.Dialog), {
  ssr: false,
});
const DynamicDialogPanel = dynamic(
  () => import("@headlessui/react").then((mod) => mod.DialogPanel),
  { ssr: false },
);
const DynamicDialogTitle = dynamic(
  () => import("@headlessui/react").then((mod) => mod.DialogTitle),
  { ssr: false },
);
const DynamicDescription = dynamic(
  () => import("@headlessui/react").then((mod) => mod.Description),
  { ssr: false },
);

export function AddToWishlist({
  disabled,
  messages,
  selectedVariantId,
  refresh,
  categDisplayed,
}: {
  disabled?: boolean;
  messages: Messages;
  selectedVariantId?: string;
  refresh?: boolean;
  categDisplayed?: boolean;
}) {
  const { wishlistItems, refreshWishlist } = useWishlist();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isButtonDisabled = disabled || pending;
  let [isOpen, setIsOpen] = useState(false);

  const isInWishlist = selectedVariantId ? wishlistItems.includes(selectedVariantId) : false;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const selectedVariantId = formData.get("selectedVariantId")?.toString();

    if (!selectedVariantId) {
      setError("No variant selected");
      setPending(false);
      return;
    }
    try {
      const result = await updateWishlist({ selectedVariantId });

      if (result?.error) {
        setError(messages[result.message]);
        setIsOpen(true);
      } else {
        await refreshWishlist();
      }
    } catch (e) {
      setError("An error occurred");
      setIsOpen(true);
    }

    setPending(false);
    if (refresh) {
      location.href = "";
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={clsx("m-auto text-left add-to-cart-frm mt-1", {
          "w-auto text-center mb-4": categDisplayed,
        })}
      >
        <input type="hidden" name="selectedVariantId" value={selectedVariantId} />
        <button
          aria-disabled={isButtonDisabled}
          aria-busy={pending}
          aria-label={
            refresh
              ? messages["app.product.removeWishlist"]
              : isInWishlist
                ? messages["app.product.addedWishlist"]
                : messages["app.product.addWishlist"]
          }
          onClick={(e) => isButtonDisabled && e.preventDefault()}
          type="submit"
          title={
            refresh
              ? messages["app.product.removeWishlist"]
              : isInWishlist
                ? messages["app.product.addedWishlist"]
                : messages["app.product.addWishlist"]
          }
        >
          {pending ? (
            <Spinner />
          ) : refresh ? (
            <TrashIcon className="w-8 h-8 transition-colors duration-200 hover:text-red-500" />
          ) : (
            <HeartIcon
              className={clsx(
                "w-10 h-10 transition-colors duration-200",
                { "fill-action-1 border-action-1 text-action-1": isInWishlist },
                { "text-gray-700": !isInWishlist && !categDisplayed },
                { "hover:text-action-1 cursor-pointer": !isButtonDisabled },
                { "cursor-not-allowed opacity-70": isButtonDisabled },
                { "w-[22px] h-[22px] text-action-1 hover:text-action-3": categDisplayed },
              )}
            />
          )}
        </button>
      </form>
      {isOpen && (
        <DynamicDialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DynamicDialogPanel className="max-w-lg space-y-4 border bg-gray-200 relative">
              <a
                href="#"
                onClick={() => setIsOpen(false)}
                className="absolute top-0 right-2 text-md font-bold hover:text-red-500"
              >
                X
              </a>
              <div className="p-12">
                <DynamicDialogTitle className="font-bold text-md"></DynamicDialogTitle>
                <DynamicDescription className="text-md">{error}</DynamicDescription>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setIsOpen(false)} className="button button-secondary">
                    {messages["app.ui.closeButton"]}
                  </button>
                  <a href="/login" className="button button-tertiary">
                    Login
                  </a>
                </div>
              </div>
            </DynamicDialogPanel>
          </div>
        </DynamicDialog>
      )}
    </>
  );
}
