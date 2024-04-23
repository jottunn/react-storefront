import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { usePaths } from "@/lib/paths";
import { translate } from "@/lib/translations";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";

import { useRegions } from "../RegionsProvider";
import { VariantColorSelector } from "./VariantColorSelector";

import { useProductInfo } from "../../lib/hooks/useProductInfo";
import { ATTR_COLOR_SLUG } from "@/lib/const";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
}

export function VariantSelector({ product, selectedVariant }: VariantSelectorProps) {
  const paths = usePaths();
  const router = useRouter();
  const { formatPrice } = useRegions();
  const { getProductPrice } = useProductInfo();
  const [selectedVariantID, setSelectedVariantID] = useState(selectedVariant?.id);
  const { variants } = product;

  //console.log("VariantSelector render");

  // useMemo for computations that don't change often\
  const currentColor = useMemo(() => {
    return selectedVariant ? getColorOfVariant(selectedVariant) : "";
  }, [selectedVariant]);
  // let currentColor = '';
  // if (selectedVariantObj) {
  //   currentColor = getColorOfVariant(selectedVariantObj);
  // }

  useEffect(() => {
    setSelectedVariantID(selectedVariant?.id);
  }, [selectedVariant?.id]);

  // Skip displaying selector when theres less than 2 variants
  if (!variants || variants.length === 1) {
    return null;
  }

  const onChange = async (value: string) => {
    // Set the selected variant immediately.
    setSelectedVariantID(value);

    // Perform the router navigation.
    // This navigation is async, but since React 18+, React batches updates more efficiently.
    await router.replace(
      paths.products._slug(product.slug).$url({ ...(value && { query: { variant: value } }) }),
      undefined,
      { shallow: true, scroll: false }
    );

    // Any other logic that depends on the completion of the navigation.
    // Note: React does not guarantee batching across asynchronous boundaries by default,
    // but in practice, this will lead to fewer, more efficient updates than if these were
    // dispatched separately without consideration.
  };

  // const onChange = (value: string) => {
  //   setSelectedVariant(value);
  //   void router.replace(
  //     paths.products._slug(product.slug).$url({ ...(value && { query: { variant: value } }) }),
  //     undefined,
  //     {
  //       shallow: true,
  //       scroll: false,
  //     }
  //   );
  // };

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

  return (
    <div className="w-full">
      {selectedVariant ? (
        <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
          <span>{formatPrice(selectedVariant?.pricing?.price?.gross)}</span>
          {selectedVariant?.pricing?.onSale && (
            <span className="text-lg ml-2 opacity-75">
              <s>{formatPrice(selectedVariant.pricing.priceUndiscounted?.gross)}</s>
            </span>
          )}
        </h2>
      ) : (
        <h2 className="text-xl font-bold tracking-tight text-gray-800 text-center">
          <span>{getProductPrice(product)}</span>
          {product.variants?.[0]?.pricing?.onSale && (
            <span className="text-lg ml-2 opacity-75">
              <s>{formatPrice(product.variants?.[0].pricing.priceUndiscounted?.gross)}</s>
            </span>
          )}
        </h2>
      )}

      <VariantColorSelector product={product} selectedVariant={selectedVariant} />

      <RadioGroup value={selectedVariantID} onChange={onChange}>
        <div className="grid grid-flow-col auto-cols-max justify-items-center justify-center">
          {variants
            .filter((variant) => variant.quantityAvailable)
            .map((variant) => {
              const hasAttributeWithColor = variant.attributes.some(
                (item) => item.attribute.slug === ATTR_COLOR_SLUG
              );
              const existsAttributeWithCurrentColor = variant.attributes.some(
                (item) =>
                  item.attribute.slug === ATTR_COLOR_SLUG &&
                  item.values.some((value) => value.name === currentColor)
              );
              if (!existsAttributeWithCurrentColor && hasAttributeWithColor) {
                return null;
              }
              return (
                <RadioGroup.Option
                  key={"radio" + variant.id}
                  value={variant.id}
                  className={({ checked }) =>
                    clsx(
                      "bg-white w-full h-full relative cursor-pointer object-contain border border-black", // Base classes
                      {
                        "border-black": checked, // Apply this class when the option is checked
                        "hover:border-main border-main-2": !checked, // Apply these classes when the option is not checked
                      }
                    )
                  }
                >
                  {({ checked }) => (
                    <div
                      className={clsx(
                        "py-2 px-5", // Base classes for the inner div
                        {
                          "text-white bg-black": checked, // Additional classes when the option is checked
                          "text-black": !checked, // Additional classes when the option is not checked
                        }
                      )}
                    >
                      <RadioGroup.Label as="div" className="w-full justify-between">
                        <div
                          className="font-semibold text-sm"
                          data-testid={`variantOf${variant.name}`}
                        >
                          {translate(variant, "name")}
                        </div>
                      </RadioGroup.Label>
                    </div>
                  )}
                </RadioGroup.Option>
              );
            })}
        </div>
      </RadioGroup>
    </div>
  );
}

export default VariantSelector;
