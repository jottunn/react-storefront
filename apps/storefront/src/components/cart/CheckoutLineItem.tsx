"use client";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { CheckoutLineDetailsFragment, ErrorDetailsFragment } from "@/saleor/api";

import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { DeleteLineButton } from "./DeleteLineButton";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useCheckout } from "@/lib/hooks/CheckoutContext";
import { updateLineFromCheckout } from "../checkout/actions";
import { translate } from "@/lib/translations";
import { Messages } from "@/lib/util";

interface CheckoutLineItemProps {
  line: CheckoutLineDetailsFragment;
  messages: Messages;
}

export default function CheckoutLineItem({ line, messages }: CheckoutLineItemProps) {
  const { checkout, refreshCheckout } = useCheckout();
  if (!checkout || !line) {
    return null;
  }
  const [quantity, setQuantity] = useState<number>(line.quantity);
  const [errors, setErrors] = useState<any[] | null>();

  useEffect(() => {
    if (!line) return;

    const availableQuantity =
      line.problems && line.problems?.[0] && (line.problems?.[0] as any).availableQuantity;

    if (availableQuantity !== undefined && line.quantity && availableQuantity < line.quantity) {
      const error = {
        field: "quantity",
        message:
          availableQuantity === 0
            ? messages["app.product.soldOutVariant"]
            : messages["QUANTITY_GREATER_THAN_LIMIT"],
        code: "INSUFFICIENT_STOCK",
      };
      setErrors([...[error]]);
    }

    if (!line.problems) {
      const maxQuantity = line.variant.quantityLimitPerCustomer || 1;
      if (quantity > maxQuantity) {
        setErrors(["QUANTITY_GREATER_THAN_LIMIT"]);
      }
    }
  }, [line]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (
        !line.variant.quantityAvailable ||
        newQuantity <= line.variant.quantityAvailable ||
        (line.variant.quantityLimitPerCustomer &&
          newQuantity <= line.variant.quantityLimitPerCustomer)
      ) {
        void debouncedOnQuantityUpdate(newQuantity);
      } else {
        setErrors(["QUANTITY_GREATER_THAN_LIMIT"]);
      }
      setQuantity(newQuantity);
    },
    [line?.variant.id],
  );

  const handleInputBlur = () => {
    const maxQuantity =
      line.variant.quantityLimitPerCustomer || line.variant.quantityAvailable || 1;
    if (quantity > maxQuantity) {
      setErrors(["QUANTITY_GREATER_THAN_LIMIT"]);
    }
  };

  const debouncedOnQuantityUpdate = useCallback(
    debounce(async (newQuantity) => {
      // Perform the update logic here, directly using newQuantity
      const lineUpdateInput = {
        quantity: newQuantity,
        lineId: line.id,
      };
      const result = await updateLineFromCheckout({ lineUpdateInput, id: checkout.id });

      if (result && result.success) {
        await refreshCheckout();
        setErrors([]);
      } else {
        setErrors([...(result?.errors || [])]);
      }

      console.log("debouncedOnQuantityUpdate", result);
    }, 300),
    [line?.variant.id],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(event.target.value, 10));
    handleQuantityChange(newQuantity);
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
            <span className="text-red-500 font-bold">{messages["app.checkout.unavailable"]};</span>
          )}
        </div>
        <div className="flex h-16 flex-col justify-between items-end">
          <p className="flex justify-end space-y-2 text-right text-md">
            {formatMoney(line.totalPrice?.gross)}
          </p>
          {(line.variant.quantityLimitPerCustomer && line.variant.quantityLimitPerCustomer > 1) ||
          !line.variant.quantityLimitPerCustomer ||
          (!line.variant.quantityLimitPerCustomer &&
            line.variant.quantityAvailable &&
            line.variant.quantityAvailable > 1) ||
          (errors && errors?.length > 0) ? (
            <input
              type="number"
              className={clsx(
                "h-8 md:mt-2 w-24 md:w-16 block border-gray-300 rounded-md text-base bg-transparent",
                errors && errors.length > 0 && "border-red-500",
              )}
              value={quantity}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
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
            {errors.map((err, index) => (
              <span className="text-red-500 text-sm font-medium" key={index}>
                {err.message || messages[err]}
                {err && err === "QUANTITY_GREATER_THAN_LIMIT" && (
                  <>
                    <br />
                    <span>{messages["app.checkout.maxQ"]}</span>
                    <strong>
                      {line.variant.quantityLimitPerCustomer || line.variant.quantityAvailable || 1}
                    </strong>
                  </>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
