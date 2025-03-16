import Link from "next/link";
import { ProductDetailsFragment } from "@/saleor/api";
import Image from "next/image";
import { ATTR_COLOR_COMMERCIAL_SLUG, ATTR_COLOR_SLUG } from "@/lib/const";
import { getColorSelectorMedia } from "@/lib/media";

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
  const defaultMedia = { url: "", alt: product.name };

  const getColorOptions = (attrSlug: string, currentColor?: string) =>
    product.variants?.flatMap((variant) => {
      if (!variant.quantityAvailable) {
        // only if variant is inStock
        return [];
      }
      return variant.attributes.flatMap((attribute) => {
        if (attribute.attribute.slug === attrSlug) {
          return attribute.values
            .filter((value) => {
              const name = value.name as string;
              const isNewColor = !processedColors.has(name);
              processedColors.add(name); // Mark this color as processed
              return isNewColor; // Only proceed with new, unprocessed colors
            })
            .map((value, index) => {
              const isSelectedColor = currentColor === value.name;
              // Get media for this color - either from this variant or from another with same color
              const variantMedia = getColorSelectorMedia(product, variant);

              const imgElement = (
                <div
                  key={`thumb-${variant.id.toString()}-${value.name || ""}`}
                  className={`relative flex items-center justify-center border-2 ${isSelectedColor ? "border-black hover:border-black" : "border-neutral-400 hover:border-action-1"} p-1 h-[80px] w-[80px] overflow-hidden`}
                >
                  <Image
                    src={variantMedia.url ? variantMedia.url : "/nopic.png"}
                    alt={
                      variantMedia && variantMedia.alt
                        ? variantMedia.alt
                        : `${product.name} ${value.name ?? ""}`
                    }
                    width={100}
                    height={50}
                    style={{ objectFit: "contain", maxHeight: "100%" }}
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

  const colorOptions =
    product.variants?.flatMap((variant) => {
      return variant.attributes.flatMap((attribute) => {
        if (
          attribute.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG &&
          attribute.values?.[0]?.name?.length
        ) {
          return getColorOptions(
            ATTR_COLOR_COMMERCIAL_SLUG,
            commercialColorAttr?.values?.[0]?.name,
          );
        } else if (
          attribute.attribute.slug === ATTR_COLOR_COMMERCIAL_SLUG &&
          (!attribute.values?.[0]?.name || attribute.values?.[0]?.name?.length === 0)
        ) {
          return getColorOptions(ATTR_COLOR_SLUG, currentColor);
        }
        return [];
      });
    }) || [];

  return (
    <>
      {commercialColorAttr?.values[0]?.name && (
        <h2 className="block mt-8 mb-2 text-md uppercase text-main-1">
          {commercialColorAttr?.values[0]?.name}
        </h2>
      )}
      <div className="flex flex-wrap gap-3 mb-6" key={"colorsof" + product.id}>
        {colorOptions}
      </div>
    </>
  );
}
