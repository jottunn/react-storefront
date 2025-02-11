"use client";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Messages } from "@/lib/util";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import Spinner from "@/components/Spinner";
import { Fragment, useEffect, useState } from "react";
import clsx from "clsx";
import { getCurrentUser, updateWishlist } from "src/app/actions";
export function AddToWishlist({
  disabled,
  messages,
  selectedVariantId,
  refresh,
}: {
  disabled?: boolean;
  messages: Messages;
  selectedVariantId?: string;
  refresh?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const isButtonDisabled = disabled || pending;
  let [isOpen, setIsOpen] = useState(false);
  // Use effect to check if the current variant is already in the wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      const user = await getCurrentUser();
      if (user && selectedVariantId && !isButtonDisabled) {
        const wishlistMetadata = user.metadata.find((meta) => meta.key === "wishlist");
        const currentWishlist = wishlistMetadata ? JSON.parse(wishlistMetadata.value) : [];
        setAdded(currentWishlist.includes(selectedVariantId));
      }
    };
    fetchWishlist();
  }, [selectedVariantId, isButtonDisabled, added]);

  //use effect get user
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

    const result = await updateWishlist({ selectedVariantId });

    if (result?.error) {
      setError(messages[result.message]);
      setIsOpen(true);
    } else {
      setAdded(!added);
    }
    setPending(false);
    if (refresh) {
      location.href = "";
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="m-auto text-left add-to-cart-frm mt-1">
        <input type="hidden" name="selectedVariantId" value={selectedVariantId} />
        <button
          aria-disabled={isButtonDisabled}
          aria-busy={pending}
          aria-label={
            refresh
              ? messages["app.product.removeWishlist"]
              : added
                ? messages["app.product.addedWishlist"]
                : messages["app.product.addWishlist"]
          }
          onClick={(e) => isButtonDisabled && e.preventDefault()}
          type="submit"
          title={
            refresh
              ? messages["app.product.removeWishlist"]
              : added
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
                { "fill-action-1 border-action-1 text-action-1": added },
                { "text-gray-700": !added },
                { "hover:text-action-1 cursor-pointer": !isButtonDisabled },
                { "cursor-not-allowed opacity-70": isButtonDisabled },
              )}
            />
          )}
        </button>
      </form>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-gray-200 relative">
            <a
              href="#"
              onClick={() => setIsOpen(false)}
              className="absolute top-0 right-2 text-md font-bold hover:text-red-500"
            >
              X
            </a>
            <div className="p-12">
              <DialogTitle className="font-bold text-md"></DialogTitle>
              <Description className="text-md">{error}</Description>
              <div className="flex gap-4 mt-4">
                <button onClick={() => setIsOpen(false)} className="button button-secondary">
                  {messages["app.ui.closeButton"]}
                </button>
                <a href="/login" className="button button-tertiary">
                  Login
                </a>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
