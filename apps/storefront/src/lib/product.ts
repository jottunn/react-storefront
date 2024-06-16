import { NextRouter } from "next/router";

import {
  Product,
  ProductDetailsFragment,
  ProductVariant,
  ProductVariantDetailsFragment,
  SelectedAttributeDetailsFragment,
} from "@/saleor/api";
import { ATTR_COLOR_SLUG } from "./const";
// import { translate } from "./translations";
/**
 * When a variant is selected, the variant attributes are shown together with
 * the attributes of the product. Otherwise, only the product
 * attributes are shown
 * @param   product  The product object
 * @param   selectedVariant   The selected variant object
 * @return  The attributes that will be shown to the user for the chosen product
 */

export const getProductAttributes = (
  product: ProductDetailsFragment,
  selectedVariant?: ProductVariantDetailsFragment | null,
): SelectedAttributeDetailsFragment[] => {
  if (selectedVariant) return product.attributes.concat(selectedVariant.attributes);
  return product.attributes;
};

export const getSelectedVariantID = (product: ProductDetailsFragment, router?: NextRouter) => {
  // Check, if variant is already in the url
  const urlVariant =
    typeof window !== "undefined" && router ? router.query.variant?.toString() : undefined;
  if (!!urlVariant && product.variants?.find((p) => p?.id === urlVariant)) {
    // case, where url contain valid variant id
    return urlVariant;
  }
  if (product?.variants?.length === 1) {
    // case, where product has only one variant to choose from, so we pre-select it
    return product.variants[0]!.id;
  }
  // there are multiple variants and user has not chosen any
  return undefined;
};

function groupVariantsByColor(variants: ProductVariantDetailsFragment[]) {
  const map = new Map<string, ProductVariantDetailsFragment[]>();

  variants.forEach((variant) => {
    if (variant.quantityAvailable && variant.quantityAvailable > 0) {
      const colorValue =
        variant.attributes.find((attr) => attr.attribute.slug === ATTR_COLOR_SLUG)?.values[0]
          ?.name || "No Color";

      if (!map.has(colorValue)) {
        map.set(colorValue, []);
      }
      map.get(colorValue)!.push(variant);
    }
  });

  return map; // Map with key as color or "No Color", and value as array of variants
}

export interface GroupedProduct extends Product {
  colorGroup?: string;
}

export const groupProductsByColor = (products: Product[]): GroupedProduct[] => {
  const groupedProducts: GroupedProduct[] = [];
  products.forEach((product) => {
    // Check if the product has variants
    if (product.variants && product.variants.length > 0) {
      // Group variants by color
      const colorGroups = groupVariantsByColor(product.variants);
      // For each color group, create a new product entry
      colorGroups.forEach((variants, color) => {
        const newProduct = {
          ...product,
          variants: variants as ProductVariant[],
          colorGroup: color, // Adding colorGroup to easily identify this in the output
        };
        groupedProducts.push(newProduct);
      });
    } else {
      // If no variants, push the original product
      groupedProducts.push(product);
    }
  });

  return groupedProducts;
};
