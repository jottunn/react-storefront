import Link from "next/link";
import { ProductDetailsFragment } from "@/saleor/api";
import Image from "next/image";
import { ATTR_COLOR_SLUG } from "@/lib/const";

export interface VariantSelectorProps {
  product: ProductDetailsFragment;
  currentColor?: string;
  commercialColorAttr?: any;
}

export function VariantColorSelector({
  product,
  currentColor,
  commercialColorAttr,
}: VariantSelectorProps) {
  const processedColors = new Set<string>();
  const defaultMedia = product.thumbnail || { url: "", alt: product.name };

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
              let variantMedia = defaultMedia;
              if (variant.media && variant.media.length > 0) {
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
                  variantMedia = {
                    url: sortedMedia[0].url,
                    alt: sortedMedia[0].alt || product.name,
                  };
                }
              }
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
                      variantMedia && variantMedia.alt
                        ? variantMedia.alt
                        : `${product.name} ${value.name ?? ""}`
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
    <>
      {commercialColorAttr?.values[0]?.name && (
        <h2 className="block mt-8 mb-2 text-lg uppercase">
          {commercialColorAttr?.values[0]?.name}
        </h2>
      )}
      <div className="flex flex-wrap gap-3 mb-6" key={"colorsof" + product.id}>
        {colorOptions}
      </div>
    </>
  );
}
