"use client";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback } from "react";
import debounce from "lodash.debounce";
import { CheckoutLineDetailsFragment, ErrorDetailsFragment } from "@/saleor/api";

import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { DeleteLineButton } from "./DeleteLineButton";
import { formatPrice } from "@/lib/hooks/useRegions";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { updateLineFromCheckout } from "../checkout/actions";

interface CheckoutLineItemProps {
  line: CheckoutLineDetailsFragment;
}

export default function CheckoutLineItem({ line }: CheckoutLineItemProps) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout || !line) {
    return null;
  }
  const [quantity, setQuantity] = React.useState<number>();
  const [errors, setErrors] = React.useState<ErrorDetailsFragment[] | null>(null);

  React.useEffect(() => {
    if (!line) return;
    setQuantity(line.quantity);
  }, [line]);

  const debouncedOnQuantityUpdate = useCallback(
    debounce(async (newQuantity) => {
      // Perform the update logic here, directly using newQuantity
      const lineUpdateInput = {
        quantity: newQuantity,
        lineId: line.id,
      };
      const result = await updateLineFromCheckout({ lineUpdateInput, id: checkout.id });

      // TODO Handle result or errors
      if (result && result.success) {
        await refreshCheckout();
      }
    }, 300),
    [line?.variant.id],
  );

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(event.target.value, 10));
    if (!line.variant.quantityAvailable || newQuantity <= line.variant.quantityAvailable) {
      setQuantity(newQuantity); // Immediately update the local state for responsive UI
      // Call the debounced function with the new quantity instead of the event
      void debouncedOnQuantityUpdate(newQuantity);
    }
  };

  const getProductLink = () => {
    if (line?.variant) return `/p/${line.variant.product?.slug}/?variant=${line.variant.id}`;
    return `/p/${line.variant.product?.slug}`;
  };

  const variantAttr = line.variant?.attributes?.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );
  const colorAttrName = variantAttr?.values[0]?.name ? " | " + variantAttr?.values[0].name : "";
  const primaryMedia = line.variant.media?.[0] || line.variant.product?.thumbnail;

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
                  sizes="(max-width: 768px) 100vw, 33vw"
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
              <p className="text-md text-white-500 dark:text-white-400 hover:text-action-1 break-words">
                {/* {translate(line?.variant.product, "name")} */}
                {line?.variant.product.name}
              </p>
            </a>
          </Link>
          <p
            className="text-md text-neutral-800 dark:text-neutral-400 break-words"
            data-testid={`cartVariantItem${line?.variant.name}`}
          >
            {/* {translate(line?.variant, "name")}*/}
            {line.variant.name}
            {`${colorAttrName}`}
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
              errors && "border-red-500",
            )}
            value={quantity || ""}
            onFocus={() => {
              setErrors(null);
            }}
            onChange={handleQuantityChange}
            min={1}
            required
            disabled={false}
            pattern="[0-9]*"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <DeleteLineButton lineId={line.id} />
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
