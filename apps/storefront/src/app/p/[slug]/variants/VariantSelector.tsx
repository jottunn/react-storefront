import clsx from "clsx";
import React from "react";
import {
  PageFragment,
  ProductDetailsFragment,
  ProductVariant,
  ProductVariantDetailsFragment,
} from "@/saleor/api";
import { ATTR_COLOR_COMMERCIAL_SLUG, ATTR_COLOR_SLUG } from "@/lib/const";
import { Messages } from "@/lib/util";
import { formatMoney } from "@/lib/utils/formatMoney";
import VariantSelectorClient from "./VariantSelectorClient";
import SizeGuide from "./SizeGuide";
import { VariantColorSelector } from "./VariantColorSelector";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
  messages: Messages;
  price: string;
  // setShowSizeGuideModal?: React.Dispatch<React.SetStateAction<boolean>>;
  sizeGuide?: any;
}

function getColorOfVariant(productVariant: ProductVariantDetailsFragment) {
  if (productVariant && Array.isArray(productVariant.attributes)) {
    for (const attribute of productVariant.attributes) {
      if (
        attribute.attribute.slug === ATTR_COLOR_SLUG &&
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
  return ""; // Return default color if none is found
}
function getGroupedVariants(currentColor: string, variants: ProductVariant[]) {
  return variants
    .filter((variant) => variant.quantityAvailable)
    .filter((variant) => {
      const colorAttribute = variant.attributes.find(
        (attribute) => attribute.attribute.slug === ATTR_COLOR_SLUG,
      );
      return colorAttribute && colorAttribute.values.some((value) => value.name === currentColor);
    });
}

export function VariantSelector({
  product,
  selectedVariant,
  messages,
  price,
  sizeGuide,
}: VariantSelectorProps) {
  const { variants } = product;
  const availableVariants = variants && variants.filter((variant) => variant.quantityAvailable);
  // console.log('availableVariants', availableVariants);
  const currentColor = selectedVariant ? getColorOfVariant(selectedVariant) : "";
  const sizes = currentColor
    ? getGroupedVariants(currentColor, variants as ProductVariant[])
    : variants;
  const commercialColorAttr = selectedVariant?.attributes.find(
    (attr) => attr.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG,
  );
  // Skip displaying selector when theres no variant
  if (!variants || variants.length === 0) {
    return null;
  }

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

        {product.variants && product.variants?.length > 1 && (
          <VariantColorSelector
            product={product}
            currentColor={currentColor}
            commercialColorAttr={commercialColorAttr}
          />
        )}

        <div
          className={clsx("m-auto mb-6 mt-6", {
            "grid grid-cols-2 gap-[50px]": sizeGuide,
            flex: !sizeGuide,
          })}
        >
          <div className="flex flex-col md:py-6 items-start">
            <p className="text-md font-semibold mb-2 text-left">
              {sizes && sizes.length > 1 ? (
                <span className="text-left">{messages["app.chooseSize"]}</span>
              ) : (
                <span>
                  {sizes && sizes[0] && messages["app.size"]}
                  <span className="text-md font-bold ml-2">
                    {(sizes && sizes[0] && sizes[0].name) || ""}
                  </span>
                </span>
              )}
            </p>

            {sizes && sizes.length > 1 && (
              <VariantSelectorClient
                sizes={sizes as ProductVariant[]}
                selectedVariant={selectedVariant as ProductVariantDetailsFragment}
                product={product}
                hasSizeGuide={sizeGuide ? true : false}
              />
            )}
          </div>

          {sizeGuide && <SizeGuide sizeGuide={sizeGuide} messages={messages} />}
        </div>
      </div>
    </>
  );
}

export default VariantSelector;
