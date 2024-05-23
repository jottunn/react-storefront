import { useProductInfo } from "@/lib/hooks/useProductInfo";
import { usePaths } from "@/lib/paths";
import { translate } from "@/lib/translations";
import Link from "next/link";
import Image from "next/image";
import { useRegions } from "../RegionsProvider";
import { useState } from "react";
import { GroupedProduct } from "@/lib/product";
import { ATTR_COLOR_COMMERCIAL_SLUG } from "@/lib/const";
import { ProductVariant } from "@/saleor/api";
import { TagIcon } from "@heroicons/react/24/outline";

export interface ProductCardProps {
  product: GroupedProduct;
  loading: "eager" | "lazy";
  priority?: boolean;
  compliantVariant?: ProductVariant;
}

export function ProductCard({ product, loading, priority, compliantVariant }: ProductCardProps) {
  const paths = usePaths();
  const { getProductBrand } = useProductInfo();
  const productBrand = getProductBrand(product);
  const { formatPrice } = useRegions();
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
  // Find the first and second image, falling back to the first if only one exists
  let thumbnailUrl = product.media?.[0]?.url || "";
  let hoverImageUrl = product.media?.[1]?.url || thumbnailUrl; // Use the second image or fallback to the first

  // If variant has images, use those instead
  if (variant && variant.media && variant.media.length > 0) {
    thumbnailUrl = variant.media[0].url;
    hoverImageUrl = variant.media.length > 1 ? variant.media[1].url : thumbnailUrl; // Fallback to the first if only one exists
  }

  let isPriceRange = false;
  // let salesPercent = "";
  if (colorName === "") {
    isPriceRange =
      product.pricing?.priceRange?.start?.gross.amount !==
      product.pricing?.priceRange?.stop?.gross.amount;
  }

  //if isPriceRange, check if it's on sale or not and get both prices
  // if (isPriceRange && product.pricing?.onSale) {
  //   const salesPercentLowest = getDiscountPercentage(
  //     product.pricing?.priceRangeUndiscounted?.start?.gross.amount || 0,
  //     product.pricing?.priceRange?.start?.gross.amount || 0
  //   );
  //   const salesPercentHighest = getDiscountPercentage(
  //     product.pricing?.priceRangeUndiscounted?.stop?.gross.amount || 0,
  //     product.pricing?.priceRange?.stop?.gross.amount || 0
  //   );
  //   let displayedPercentage = salesPercentHighest === 0 ? salesPercentLowest : salesPercentHighest;
  //   if (salesPercentHighest !== 0 && salesPercentLowest !== 0) {
  //     displayedPercentage =
  //       salesPercentHighest > salesPercentLowest ? salesPercentLowest : salesPercentHighest;
  //   }
  //   salesPercent = displayedPercentage > 0 ? `from ${displayedPercentage}` : "";
  // } else if (
  //   variant &&
  //   variant.pricing &&
  //   variant.pricing.price &&
  //   variant.pricing.priceUndiscounted &&
  //   variant.pricing.onSale
  // ) {
  //   salesPercent = getDiscountPercentage(
  //     variant.pricing.priceUndiscounted.gross.amount || 0,
  //     variant.pricing.price.gross.amount
  //   ).toString();
  // }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={
          product.colorGroup && product.colorGroup !== "No Color"
            ? paths.products
                ._slug(product.slug)
                .$url({ ...(product.colorGroup && { query: { variant: variant?.id } }) })
            : paths.products._slug(product.slug).$url()
        }
        prefetch={false}
        passHref
        legacyBehavior
      >
        <a href="pass">
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
            className="block mt-2 text-md font-extrabold text-main text-center hover:text-gray-700 min-h-[75px] md:min-h-[50px]"
            data-testid={`productName${product.name}`}
          >
            {productDisplayName}
          </p>
        </a>
      </Link>
      {productBrand && (
        <p className="block text-sm font-normal text-main text-center pt-2 pb-2">{productBrand}</p>
      )}

      <p className="block text-main text-center font-normal mb-6">
        <span className="text-md">
          {isPriceRange
            ? product.pricing?.priceRange?.start?.gross.amount !==
              product.pricing?.priceRange?.stop?.gross.amount
              ? formatPrice(product.pricing?.priceRange?.start?.gross) +
                " - " +
                formatPrice(product.pricing?.priceRange?.stop?.gross)
              : formatPrice(product.pricing?.priceRange?.start?.gross)
            : variant && formatPrice(variant.pricing?.price?.gross)}
        </span>
        {isPriceRange && product.pricing?.onSale ? (
          <span className="text-sm ml-2 opacity-75">
            <s>
              {product.pricing?.priceRangeUndiscounted?.start?.gross.amount !==
              product.pricing?.priceRangeUndiscounted?.stop?.gross.amount
                ? formatPrice(product.pricing?.priceRangeUndiscounted?.start?.gross) +
                  " - " +
                  formatPrice(product.pricing?.priceRangeUndiscounted?.stop?.gross)
                : formatPrice(product.pricing?.priceRangeUndiscounted?.start?.gross)}
            </s>
          </span>
        ) : (
          variant &&
          variant.pricing?.onSale && (
            <span className="text-sm ml-2 opacity-75">
              <s>{formatPrice(variant.pricing.priceUndiscounted?.gross)}</s>
            </span>
          )
        )}
      </p>
    </div>
  );
}
