import Link from "next/link";
import { usePaths } from "@/lib/paths";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";
import Image from "next/image";
import { ATTR_COLOR_SLUG } from "@/lib/const";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment | null;
}

function getColorOfVariant(productVariant: ProductVariantDetailsFragment) {
  let color = "";
  if (productVariant && Array.isArray(productVariant.attributes)) {
    productVariant.attributes.forEach((attribute) => {
      if (attribute.attribute.slug === ATTR_COLOR_SLUG) {
        attribute.values.forEach((value: any) => {
          color = value.name;
        });
      }
    });
  }
  return color;
}

export function VariantColorSelector({ product, selectedVariant }: VariantSelectorProps) {
  const paths = usePaths();
  const currentColor = selectedVariant ? getColorOfVariant(selectedVariant) : "";
  const processedColors = new Set<string>();

  const defaultMedia = product.media?.[0] || { url: "", alt: "Default Image" };

  const colorOptions =
    product.variants?.flatMap((variant) => {
      if (!variant.quantityAvailable) {
        // only if variant is inStock
        return [];
      }
      return variant.attributes.flatMap((attribute) => {
        if (attribute.attribute.slug === ATTR_COLOR_SLUG) {
          return attribute.values
            .filter((value) => {
              const name = value.name as string;
              const isNewColor = !processedColors.has(name);
              processedColors.add(name); // Mark this color as processed
              return isNewColor; // Only proceed with new, unprocessed colors
            })
            .map((value) => {
              const isSelectedColor = currentColor === value.name;
              const variantMedia = variant.media?.[0] || defaultMedia;
              const imgElement = (
                <Image
                  key={`thumb-${variant.id.toString()}-${value.name || ""}`}
                  src={variantMedia.url}
                  alt={
                    variant.media?.[0] ? variantMedia.alt : `${product.name} ${value.name ?? ""}`
                  }
                  className={`border-2 p-2 h-auto w-auto ${
                    isSelectedColor
                      ? "border-black"
                      : "border-neutral-400 opacity-80 hover:opacity-100"
                  }`}
                  width="80"
                  height="80"
                />
              );
              return isSelectedColor ? (
                imgElement
              ) : (
                <Link
                  key={`link-${variant.id.toString()}-${value.name || ""}`}
                  href={paths.products._slug(product.slug).$url({ query: { variant: variant.id } })}
                  title={`${value.name ?? ""}`}
                >
                  {imgElement}
                </Link>
              );
            });
        }
        return [];
      });
    }) || [];

  return (
    <div
      className="flex flex-wrap gap-3 my-6 justify-items-center justify-center"
      key={"colorsof" + product.id}
    >
      {colorOptions}
    </div>
  );
}
