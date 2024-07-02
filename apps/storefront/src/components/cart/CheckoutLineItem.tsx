"use client";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback } from "react";
import debounce from "lodash.debounce";
import { CheckoutLineDetailsFragment, ErrorDetailsFragment } from "@/saleor/api";

import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { DeleteLineButton } from "./DeleteLineButton";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { updateLineFromCheckout } from "../checkout/actions";
import { translate } from "@/lib/translations";

interface CheckoutLineItemProps {
  line: CheckoutLineDetailsFragment;
}

export default function CheckoutLineItem({ line }: CheckoutLineItemProps) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout || !line) {
    return null;
  }
  const [quantity, setQuantity] = React.useState<number>();
  const [errors, setErrors] = React.useState<any[] | null>();

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      // const newQuantity = Math.max(1, parseInt(event.target.value, 10));
      // console.log('newQuantity', newQuantity);
      if (!line.variant.quantityAvailable || newQuantity <= line.variant.quantityAvailable) {
        setQuantity(newQuantity); // Immediately update the local state for responsive UI
        // Call the debounced function with the new quantity instead of the event
        void debouncedOnQuantityUpdate(newQuantity);
      }
    },
    [line?.variant.id],
  );

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
      } else {
        setErrors([...(result?.errors || [])]);
      }

      console.log("else", result);
    }, 300),
    [line?.variant.id],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(event.target.value, 10));
    handleQuantityChange(newQuantity);
  };

  React.useEffect(() => {
    if (!line) return;
    const availableQuantity =
      line.problems && line.problems?.[0] && (line.problems?.[0] as any).availableQuantity;
    if (availableQuantity !== undefined && line.quantity && availableQuantity < line.quantity) {
      const error = {
        field: "quantity",
        message: `Could not add items O/S. Only ${availableQuantity} remaining in stock.`,
        code: "INSUFFICIENT_STOCK",
      };
      setErrors([...[error]]);
    }
    setQuantity(line.quantity);
  }, [line]);

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
        className="items-center mb-2 md:space-x-4 cursor-pointer grid grid-cols-[80px_auto_1fr]"
        data-testid={`cartProductItem${line.variant.product.name}`}
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
                {translate(line.variant.product, "name")}
              </p>
            </a>
          </Link>
          <p
            className="text-md text-neutral-800 dark:text-neutral-400 break-words"
            data-testid={`cartVariantItem${line.variant.name}`}
          >
            {translate(line.variant, "name")}
            {`${colorAttrName}`}
          </p>

          {!line.variant.product.isAvailableForPurchase && (
            <span className="text-red-500 font-bold">
              Product is not available for purchase anymore
            </span>
          )}
        </div>
        <div className="flex h-16 flex-col justify-between items-end">
          <p className="flex justify-end space-y-2 text-right text-md">
            {formatMoney(line.totalPrice?.gross)}
          </p>
          {line.variant.quantityAvailable && line.variant.quantityAvailable > 1 ? (
            <input
              type="number"
              className={clsx(
                "h-8 md:mt-2 w-24 md:w-16 block border-gray-300 rounded-md text-base bg-transparent",
                errors && "border-red-500",
              )}
              value={quantity || ""}
              onFocus={() => {
                setErrors(null);
              }}
              onChange={handleInputChange}
              min={1}
              required
              disabled={false}
              pattern="[0-9]*"
            />
          ) : (
            <p className="text-md">{quantity}</p>
          )}
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
