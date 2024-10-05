"use client";

import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { CheckoutLineDetailsFragment } from "@/saleor/api";
import invariant from "ts-invariant";
import { usePathname } from "next/navigation";
import styles from "../nav/Navbar.module.css";
import { CheckoutProductList } from "./CheckoutProductList";
import { formatMoney } from "@/lib/utils/formatMoney";
import CheckoutLink from "./CheckoutLink";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

interface CartModalProps {
  messages: { [key: string]: string };
}
export default function CartModal({ messages }: CartModalProps) {
  const { checkout, refreshCheckout } = useCheckout();
  const pathname = usePathname();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [prevCounter, setPrevCounter] = useState(0);

  const openCart = useCallback(() => setCartModalOpen(true), []);
  const closeCart = useCallback(() => setCartModalOpen(false), []);

  const counter = useMemo(
    () =>
      checkout?.lines?.reduce(
        (amount: number, line?: CheckoutLineDetailsFragment | null) =>
          line ? amount + line.quantity : amount,
        0,
      ) || 0,
    [checkout],
  );

  useEffect(() => {
    refreshCheckout();
  }, [refreshCheckout]);

  useEffect(() => {
    if (pathname === "/checkout" || pathname === "/order" || pathname === "/payment-confirm") {
      closeCart();
      if (counter !== prevCounter) {
        setPrevCounter(counter);
      }
      return;
    }

    if (counter > prevCounter) {
      setCartModalOpen(true);
    }
    setPrevCounter(counter);
  }, [pathname, counter]);

  const saleorApiUrl = process.env.NEXT_PUBLIC_API_URI;
  invariant(saleorApiUrl, "Missing NEXT_PUBLIC_API_URI");
  if (pathname === "/checkout" || pathname === "/order") {
    return null;
  }
  return (
    <>
      <button
        aria-label={messages["app.checkout.openCart"]}
        onClick={openCart}
        type="button"
        title={messages["app.checkout.openCart"]}
      >
        <span className={styles["nav-icon-button"]}>
          {!!counter && (
            <span className={styles["nav-icon-counter"]} data-testid="cartCounter">
              {counter}
            </span>
          )}
          <ShoppingBagIcon className="h-8 w-8" />
        </span>
      </button>
      <Transition show={cartModalOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl dark:border-neutral-700 dark:bg-black/80 dark:text-white md:w-[430px]">
              <div className="flex items-center justify-between mb-10">
                <p className="text-md uppercase font-semibold">
                  {messages["app.checkout.pageHeader"]}
                </p>
                <button title="Close" aria-label="Close cart" onClick={closeCart} type="button">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      className="h-6 transition-all ease-in-out hover:scale-110 "
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>
              {!checkout || counter === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <p className="mt-6 text-center text-2xl font-bold">
                    {messages["app.checkout.cartEmptyHeader"]}
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <CheckoutProductList messages={messages} />
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {/* <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>{messages["app.checkout.tax"]}</p>
                      <div className="py-2 flex items-center justify-between">
                        <p
                          suppressHydrationWarning={true}
                          className="text-right text-base text-black dark:text-white"
                        >
                          {formatMoney(checkout.subtotalPrice?.tax)}
                        </p>
                      </div>
                    </div> */}
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>{messages["app.checkout.shipping"]}</p>
                      <p className="text-right">
                        {checkout.shippingPrice?.gross?.amount
                          ? formatMoney(checkout.shippingPrice.gross)
                          : messages["app.checkout.shippingInfo"]}
                      </p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>{messages["app.checkout.total"]}</p>
                      <p
                        suppressHydrationWarning={true}
                        className="text-right text-base text-black dark:text-white"
                      >
                        {formatMoney(checkout.totalPrice.gross)}
                      </p>
                    </div>
                  </div>
                  <CheckoutLink
                    checkoutId={checkout.id}
                    disabled={!checkout.lines.length}
                    className="block w-full bg-action-1 p-3 text-center uppercase text-sm font-medium text-white opacity-90 hover:opacity-100"
                    btnName={messages["app.checkout.checkoutButton"]}
                  />
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
