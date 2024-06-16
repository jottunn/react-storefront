import Link from "next/link";
import { ProductDetailsFragment } from "@/saleor/api";
import Image from "next/image";
import { ATTR_COLOR_SLUG } from "@/lib/const";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  currentColor?: string;
}

export function VariantColorSelector({ product, currentColor }: VariantSelectorProps) {
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
                <div
                  key={`thumb-${variant.id.toString()}-${value.name || ""}`}
                  className={`relative flex items-center justify-center border-2 ${
                    isSelectedColor ? "border-black" : "border-neutral-400"
                  } p-1 h-[80px] w-[80px] overflow-hidden`}
                >
                  <Image
                    src={variantMedia.url}
                    alt={
                      variant.media?.[0] ? variantMedia.alt : `${product.name} ${value.name ?? ""}`
                    }
                    width="80"
                    height="80"
                  />
                </div>
              );
              return isSelectedColor ? (
                imgElement
              ) : (
                <Link
                  key={`link-${variant.id.toString()}-${value.name || ""}`}
                  href={`/p/${product.slug}?variant=${variant.id}`}
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
