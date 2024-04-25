import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import debounce from "lodash.debounce";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { translate } from "@/lib/translations";
import {
  CheckoutLineDetailsFragment,
  ErrorDetailsFragment,
  useCheckoutLineUpdateMutation,
  useRemoveProductFromCheckoutMutation,
} from "@/saleor/api";

import { usePaths } from "../../lib/paths";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";

interface CheckoutLineItemProps {
  line: CheckoutLineDetailsFragment;
}

export function CheckoutLineItem({ line }: CheckoutLineItemProps) {
  const paths = usePaths();
  const t = useIntl();
  const { query, formatPrice } = useRegions();
  const { checkoutToken: token } = useCheckout();
  const [checkoutLineUpdateMutation, { loading: loadingLineUpdate }] =
    useCheckoutLineUpdateMutation();
  const [removeProductFromCheckout] = useRemoveProductFromCheckoutMutation();

  const [quantity, setQuantity] = React.useState<number>();
  const [errors, setErrors] = React.useState<ErrorDetailsFragment[] | null>(null);

  React.useEffect(() => {
    if (!line) return;
    setQuantity(line.quantity);
  }, [line]);

  console.log(line);

  // Adjust the onQuantityUpdate function as needed
  // Define debounced function using useCallback to ensure it doesn't change on every render
  //Memoize the Debounced Function: Use React.useCallback to create a stable reference for the debounced function. This ensures that your debounced function maintains the same reference across component re-renders, allowing it to debounce effectively.
  const debouncedOnQuantityUpdate = useCallback(
    debounce(async (newQuantity) => {
      // Perform the update logic here, directly using newQuantity
      const result = await checkoutLineUpdateMutation({
        variables: {
          token,
          lines: [
            {
              quantity: newQuantity,
              variantId: line?.variant.id || "",
            },
          ],
          locale: query.locale,
        },
      });
      // Handle result or errors
      const mutationErrors = result.data?.checkoutLinesUpdate?.errors;
      if (mutationErrors && mutationErrors.length > 0) {
        setErrors(mutationErrors);
      }
    }, 300),
    [checkoutLineUpdateMutation, line?.variant.id]
  ); // Add all dependencies used inside the debounce

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(event.target.value, 10));
    if (!line.variant.quantityAvailable || newQuantity <= line.variant.quantityAvailable) {
      setQuantity(newQuantity); // Immediately update the local state for responsive UI
      // Call the debounced function with the new quantity instead of the event
      void debouncedOnQuantityUpdate(newQuantity);
    }
  };

  const getProductLink = () => {
    if (line?.variant) {
      return paths.products._slug(line.variant.product?.slug).$url({
        ...{ query: { variant: line.variant.id } },
      });
    }
    return paths.products._slug(line?.variant?.product?.slug).$url();
  };

  const variantAttr = line.variant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG
  );
  const colorAttrName = variantAttr?.values[0]?.name ? " | " + variantAttr?.values[0].name : "";
  const primaryMedia = line.variant.media?.[0] || line.variant.product?.thumbnail;

  if (!line) return null;

  return (
    <li className="flex flex-col py-4 border-b border-neutral-200 dark:border-neutral-700">
      <div
        className="items-center mb-2 md:space-x-4 cursor-pointer md:grid md:grid-cols-[80px_auto_1fr]"
        data-testid={`cartProductItem${line?.variant.product.name}`}
      >
        <Link href={getProductLink()} passHref legacyBehavior>
          <a href="pass">
            <div className="flex-shrink-0 w-16 h-16 sm:w-32 sm:h-32 border object-cover relative">
              {primaryMedia && (
                <Image
                  src={primaryMedia.url || "#"}
                  alt={primaryMedia.alt || ""}
                  fill={true}
                  style={{ objectFit: "contain" }}
                  className="hover:scale-110 ease-in duration-300"
                />
              )}
            </div>
          </a>
        </Link>

        <div className="pr-3">
          <Link href={getProductLink()} passHref legacyBehavior>
            <a href="pass">
              <p className="text-md text-white-500 dark:text-white-400 hover:text-action-1">
                {translate(line?.variant.product, "name")}
              </p>
            </a>
          </Link>
          <p
            className="text-md text-neutral-800 dark:text-neutral-400 break-all"
            data-testid={`cartVariantItem${line?.variant.name}`}
          >
            {translate(line?.variant, "name")} {`${colorAttrName}`}
          </p>

          {!line?.variant.product.isAvailableForPurchase && (
            <span className="text-red-500 font-bold">
              Product is not available for purchase anymore
            </span>
          )}
        </div>
        <div className="flex h-16 flex-col justify-between items-end">
          <p className="flex justify-end space-y-2 text-right text-md">
            {formatPrice(line?.totalPrice?.gross)}
          </p>
          <input
            type="number"
            className={clsx(
              "h-8 md:mt-2 w-20 md:w-16 block border-gray-300 rounded-md text-base bg-transparent",
              errors && "border-red-500"
            )}
            value={quantity || ""}
            onFocus={() => {
              setErrors(null);
            }}
            onChange={handleQuantityChange}
            min={1}
            required
            disabled={loadingLineUpdate}
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() =>
            removeProductFromCheckout({
              variables: {
                checkoutToken: token,
                lineId: line?.id,
                locale: query.locale,
              },
            })
          }
          className="text-md font-medium text-white-600 hover:text-red-500 sm:ml-0 sm:mt-3"
          title={t.formatMessage(messages.removeButton)}
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
        {errors && (
          <div>
            {errors.map((err) => (
              <span className="text-red-500 text-sm font-medium" key={err.field}>
                {err.message}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

export default CheckoutLineItem;
