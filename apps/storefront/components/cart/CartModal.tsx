import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import NavIconButton from "../Navbar/NavIconButton";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { CheckoutLineDetailsFragment } from "@/saleor/api";
import invariant from "ts-invariant";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { useIntl } from "react-intl";
import { CheckoutProductList } from "../checkout/sidebar/CheckoutProductList";

export default function CartModal() {
  const t = useIntl();
  const { checkout, cartModalOpen, setCartModalOpen } = useCheckout();
  const openCart = () => setCartModalOpen(true);
  const closeCart = () => setCartModalOpen(false);
  const { currentLocale, currentChannel, formatPrice } = useRegions();
  const counter =
    checkout?.lines?.reduce(
      (amount: number, line?: CheckoutLineDetailsFragment | null) =>
        line ? amount + line.quantity : amount,
      0
    ) || 0;

  const saleorApiUrl = process.env.NEXT_PUBLIC_API_URI;
  invariant(saleorApiUrl, "Missing NEXT_PUBLIC_API_URI");
  const domain = new URL(saleorApiUrl).hostname;

  const checkoutParams = checkout
    ? new URLSearchParams({
        checkout: checkout.id,
        locale: currentLocale,
        channel: currentChannel.slug,
        saleorApiUrl,
        // @todo remove `domain`
        // https://github.com/saleor/saleor-dashboard/issues/2387
        // https://github.com/saleor/saleor-app-sdk/issues/87
        domain,
      })
    : new URLSearchParams();

  const externalCheckoutUrl = checkout ? `/checkout/?${checkoutParams.toString()}` : "#";

  return (
    <>
      <button aria-label="Open cart" onClick={openCart} type="button">
        <NavIconButton isButton={false} icon="bag" aria-hidden="true" counter={counter} />
      </button>
      <Transition show={cartModalOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl dark:border-neutral-700 dark:bg-black/80 dark:text-white md:w-[430px]">
              <div className="flex items-center justify-between mb-10">
                <p className="text-lg font-semibold">{t.formatMessage(messages.cartPageHeader)}</p>
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
                    {t.formatMessage(messages.cartEmptyHeader)}
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <CheckoutProductList lines={checkout.lines} token={checkout.token} />

                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>{t.formatMessage(messages.tax)}</p>
                      <div className="py-2 flex items-center justify-between">
                        <p
                          suppressHydrationWarning={true}
                          className="text-right text-base text-black dark:text-white"
                        >
                          {formatPrice(checkout.subtotalPrice?.tax)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>{t.formatMessage(messages.shipping)}</p>
                      <p className="text-right">{t.formatMessage(messages.shippingInfo)}</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>{t.formatMessage(messages.total)}</p>
                      <p
                        suppressHydrationWarning={true}
                        className="text-right text-base text-black dark:text-white"
                      >
                        {formatPrice(checkout.totalPrice.gross)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={externalCheckoutUrl}
                    className="block w-full bg-action-1 p-3 text-center uppercase text-sm font-medium text-white opacity-90 hover:opacity-100"
                  >
                    {t.formatMessage(messages.checkoutButton)}
                  </a>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
