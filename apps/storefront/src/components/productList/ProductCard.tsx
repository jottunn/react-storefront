"use client";

import { translate } from "@/lib/translations";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import { GroupedProduct } from "@/lib/product";
import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { ProductVariant } from "@/saleor/api";
import { TagIcon } from "@heroicons/react/24/outline";
import { useProductInfo } from "@/lib/hooks/useProductInfo";
import { formatMoney } from "@/lib/utils/formatMoney";
import clsx from "clsx";

export interface ProductCardProps {
  product: GroupedProduct;
  loading: "eager" | "lazy";
  priority?: boolean;
  compliantVariant?: ProductVariant;
  isSwiper?: boolean;
}

export function ProductCard({
  product,
  loading,
  priority,
  compliantVariant,
  isSwiper,
}: ProductCardProps) {
  const { getProductBrand } = useProductInfo();
  const productBrand = getProductBrand(product);
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  const checkProductVariant = product.variants?.filter(
    (variant) => variant.quantityAvailable != null && variant.quantityAvailable > 0,
  );
  const variant = compliantVariant || checkProductVariant?.[0];
  const productName = translate(product, "name"); // This should always be a string
  const variantAttr = variant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );
  const colorName = variantAttr?.values[0]?.name || ""; // Fallback to an empty string if color is undefined
  // Construct the string, ensuring that undefined values are handled.
  const productDisplayName = `${productName}${colorName ? ` - ${colorName}` : ""}`;
  // Find the first and second image, falling back to the thumbnail if only one exists
  let thumbnailUrl = product.thumbnail?.url || "";
  let hoverImageUrl = product.media?.[1]?.url || thumbnailUrl; // Use the second image or fallback to the first
  // If variant has images, use those instead
  if (variant && variant.media && variant.media.length > 0) {
    //sort media by sortOrder
    const sortedMedia = variant.media.sort((a, b) => {
      if (a.type === "IMAGE" && b.type === "IMAGE") {
        if (typeof a.sortOrder === "number" && typeof b.sortOrder === "number") {
          return a.sortOrder - b.sortOrder;
        } else {
          return 30;
        }
      } else {
        return 30;
      }
    });
    if (sortedMedia && sortedMedia.length > 0) {
      thumbnailUrl = sortedMedia[0].url;
      hoverImageUrl = sortedMedia.length > 1 ? sortedMedia[1].url : thumbnailUrl; // Fallback to the first if only one exists
    }
  }

  let isPriceRange = false;
  // let salesPercent = "";
  if (colorName === "") {
    isPriceRange =
      product.pricing?.priceRange?.start?.gross.amount !==
      product.pricing?.priceRange?.stop?.gross.amount;
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/p/${product.slug}?variant=${variant?.id}`} prefetch={false}>
        <div className="bg-white w-full aspect-1">
          <div className="border w-full h-full relative flex items-center justify-center">
            {thumbnailUrl && (
              <Image
                alt={productDisplayName}
                className="transition-opacity duration-400 ease-in-out p-3"
                src={isHovered ? hoverImageUrl : thumbnailUrl}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                priority={priority}
                loading={loading}
                style={{
                  objectFit: "contain",
                  opacity: isHovered && hoverImageUrl === thumbnailUrl ? 0.9 : 1,
                }}
              />
            )}
            {product.pricing?.onSale && (
              <div className="absolute right-2 top-2 py-1 px-2">
                {/* {salesPercent}% */}
                <TagIcon className="text-action-1 w-6 h-6" />
              </div>
            )}
          </div>
        </div>
        <p
          className={clsx(
            "block mt-2 font-extrabold text-main text-center hover:text-gray-700 min-h-[75px]",
            isSwiper ? "text-base md:min-h-[75px]" : "text-md md:min-h-[50px]",
          )}
          data-testid={`productName${product.name}`}
        >
          {productDisplayName}
        </p>
      </Link>
      {productBrand && (
        <p className="block text-sm font-normal text-main text-center pt-2 pb-2">{productBrand}</p>
      )}

      <p className="block text-main text-center font-normal mb-6">
        <span className="text-md">
          {isPriceRange
            ? product.pricing?.priceRange?.start?.gross &&
              product.pricing?.priceRange?.stop?.gross &&
              product.pricing?.priceRange?.start?.gross.amount !==
                product.pricing?.priceRange?.stop?.gross.amount
              ? formatMoney(product.pricing?.priceRange?.start?.gross) +
                " - " +
                formatMoney(product.pricing?.priceRange?.stop?.gross)
              : product.pricing?.priceRange?.start?.gross &&
                formatMoney(product.pricing?.priceRange?.start?.gross)
            : variant &&
              variant.pricing?.price?.gross &&
              formatMoney(variant.pricing?.price?.gross)}
        </span>
        {isPriceRange && product.pricing?.onSale ? (
          <span className="text-sm ml-2 opacity-75">
            <s>
              {product.pricing?.priceRangeUndiscounted?.start?.gross &&
              product.pricing?.priceRangeUndiscounted?.stop?.gross &&
              product.pricing?.priceRangeUndiscounted?.start?.gross.amount !==
                product.pricing?.priceRangeUndiscounted?.stop?.gross.amount
                ? formatMoney(product.pricing?.priceRangeUndiscounted?.start?.gross) +
                  " - " +
                  formatMoney(product.pricing?.priceRangeUndiscounted?.stop?.gross)
                : product.pricing?.priceRangeUndiscounted?.start?.gross &&
                  formatMoney(product.pricing?.priceRangeUndiscounted?.start?.gross)}
            </s>
          </span>
        ) : (
          variant &&
          variant.pricing?.onSale &&
          variant.pricing.priceUndiscounted?.gross && (
            <span className="text-sm ml-2 opacity-75">
              <s>{formatMoney(variant.pricing.priceUndiscounted?.gross)}</s>
            </span>
          )
        )}
      </p>
    </div>
  );
}
