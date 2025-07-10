"use client";
import clsx from "clsx";
import {
  ProductDetailsFragment,
  ProductVariant,
  ProductVariantDetailsFragment,
} from "@/saleor/api";
import { ATTR_COLOR_COMMERCIAL_SLUG, ATTR_COLOR_SLUG } from "@/lib/const";
import { Messages } from "@/lib/util";
import { formatMoney } from "@/lib/utils/formatMoney";
import VariantSelectorClient from "./VariantSelectorClient";
import { VariantColorSelector } from "./VariantColorSelector";
import { AddButton } from "../AddButton";
import { AddToWishlist } from "../AddToWishlist";
import React from "react";
import dynamic from "next/dynamic";

const SizeGuide = dynamic(() => import("./SizeGuide"), { ssr: false });

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
  messages: Messages;
  price: string;
  sizeGuide?: any;
  isAvailable: boolean;
  isAddToCartButtonDisabled: boolean;
}

function getColorOfVariant(productVariant: ProductVariantDetailsFragment, attrSlug: string) {
  if (productVariant && Array.isArray(productVariant.attributes)) {
    for (const attribute of productVariant.attributes) {
      if (
        attribute.attribute.slug === attrSlug &&
        attribute.values &&
        attribute.values.length > 0
      ) {
        const color = attribute.values[0].name;
        if (color) {
          return color; // Return immediately upon finding the color
        }
      }
    }
  }
  return "";
}

//used for grouping sizes
function getGroupedVariants(
  variants: ProductVariant[],
  currentColor?: string,
  currentCommercialColor?: string,
) {
  return variants
    .filter((variant) => variant.quantityAvailable)
    .filter((variant) => {
      let colorAttribute = variant.attributes.find(
        (attribute) => attribute.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
      );
      if (colorAttribute && colorAttribute?.values?.length > 0) {
        return (
          colorAttribute &&
          colorAttribute.values.some((value) => value.name === currentCommercialColor)
        );
      }

      if (!colorAttribute || colorAttribute?.values?.length === 0) {
        colorAttribute = variant.attributes.find(
          (attribute) => attribute.attribute.slug === ATTR_COLOR_SLUG,
        );
      }
      return colorAttribute && colorAttribute.values.some((value) => value.name === currentColor);
    });
}

export function VariantSelector({
  product,
  selectedVariant,
  messages,
  price,
  sizeGuide,
  isAvailable,
  isAddToCartButtonDisabled,
}: VariantSelectorProps) {
  const { variants } = product;
  const availableVariants =
    variants &&
    variants.filter((variant) => variant.quantityAvailable && variant.quantityAvailable > 0);

  const currentColor = selectedVariant ? getColorOfVariant(selectedVariant, ATTR_COLOR_SLUG) : "";
  const currentCommercialColor = selectedVariant
    ? getColorOfVariant(selectedVariant, ATTR_COLOR_COMMERCIAL_SLUG)
    : "";
  const commercialColorAttr = selectedVariant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );

  const sizes =
    currentColor || currentCommercialColor
      ? getGroupedVariants(
          availableVariants as ProductVariant[],
          currentColor,
          currentCommercialColor,
        )
      : availableVariants;

  // Skip displaying selector when theres no variant
  if (!availableVariants || availableVariants.length === 0) {
    return null;
  }

  const [sizeSelected, setSizeSelected] = React.useState(sizes?.length === 1);
  const [loadingSize, setLoadingSize] = React.useState(false);
  React.useEffect(() => {
    //if color variant changes, reset the size select
    setSizeSelected(sizes?.length === 1);
  }, [currentColor]);

  const handleSizeSelect = (isSizeSelected: boolean) => {
    setSizeSelected(isSizeSelected);
    if (isSizeSelected) {
      setLoadingSize(false);
    }
  };

  const handleSizeLoading = (isLoading: boolean) => {
    setLoadingSize(isLoading);
  };
  return (
    <>
      <div className="w-full">
        {selectedVariant ? (
          <p className="text-xl font-semibold tracking-tight text-gray-800 text-left">
            <span>
              {selectedVariant.pricing?.price && formatMoney(selectedVariant.pricing.price.gross)}
            </span>
            {selectedVariant?.pricing?.onSale && (
              <span className="text-lg ml-2 opacity-75">
                <s>
                  {selectedVariant.pricing.priceUndiscounted &&
                    formatMoney(selectedVariant.pricing.priceUndiscounted.gross)}
                </s>
              </span>
            )}
          </p>
        ) : (
          <p className="text-xl font-semibold tracking-tight text-gray-800 text-left">
            <span>{price}</span>
            {product.variants?.[0]?.pricing?.onSale && (
              <span className="text-lg ml-2 opacity-75">
                <s>
                  {product.variants?.[0].pricing.priceUndiscounted &&
                    formatMoney(product.variants[0].pricing.priceUndiscounted.gross)}
                </s>
              </span>
            )}
          </p>
        )}

        {availableVariants && availableVariants.length > 0 && (
          <VariantColorSelector
            product={product}
            currentColor={currentColor}
            commercialColorAttr={commercialColorAttr}
          />
        )}

        <div
          className={clsx("m-auto mb-2 mt-6", {
            "grid grid-cols-2 lg:gap-[50px]": sizeGuide,
            flex: !sizeGuide,
          })}
        >
          <div className="flex flex-col md:py-6 items-start">
            <p className="text-md font-semibold mb-2 text-left">
              <span className="text-left">
                {sizes && sizes.length > 1
                  ? messages["app.chooseSize"]
                  : sizes && sizes[0]
                    ? messages["app.size"]
                    : ""}
              </span>
            </p>

            <VariantSelectorClient
              sizes={sizes as ProductVariant[]}
              product={product}
              hasSizeGuide={sizeGuide ? true : false}
              messages={messages}
              handleSizeSelect={handleSizeSelect}
              handleSizeLoading={handleSizeLoading}
            />
          </div>

          {sizeGuide && <SizeGuide sizeGuide={sizeGuide} messages={messages} />}
        </div>
      </div>

      {isAvailable && (
        <div className="flex items-start">
          <div className="flex-1 pr-6 relative">
            <AddButton
              disabled={isAddToCartButtonDisabled || !sizeSelected}
              loading={loadingSize}
              messages={messages}
              selectedVariantId={selectedVariant?.id}
            />
            {selectedVariant?.quantityAvailable === 0 && (
              <p className="text-base text-left font-semibold text-red-500 pt-2 block">
                {messages["app.product.soldOutVariant"]}
              </p>
            )}
            <p className="text-sm text-left font-semibold text-neutral-500 pt-2 absolute block">
              {!sizeSelected && sizes && sizes.length > 0 && messages["app.chooseSizeCart"]}
            </p>
          </div>
          <div className="flex justify-end w-12">
            <AddToWishlist
              disabled={!sizeSelected}
              messages={messages}
              selectedVariantId={selectedVariant?.id}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default VariantSelector;
