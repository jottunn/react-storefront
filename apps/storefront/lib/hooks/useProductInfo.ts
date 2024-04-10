import { useRegions } from "components/RegionsProvider/RegionsProvider";
import { ProductCardFragment } from "@/saleor/api";
import { translate } from "../translations";

export const useProductInfo = () => {
  const { formatPrice } = useRegions();
  /**
   * get color variants of a product together with the link for the first color variant found
   */
  type ProductVariant = {
    color: string;
    url: string | "#";
    thumb: string | undefined;
    price: string | undefined;
    name: string;
  };
  const getColorVariants = (product: ProductCardFragment): ProductVariant[] => {
    //const paths = usePaths();
    let color = "";
    const finalVariants: ProductVariant[] = [];

    product.variants &&
      product.variants.map((variant) =>
        variant.attributes.map((attribute) =>
          attribute.values.map((value) => {
            if (
              attribute.attribute.slug === process.env.NEXT_PUBLIC_ATTR_COLOR_SLUG &&
              value.name !== color
            ) {
              color = value.name || "";
              const productVariant: ProductVariant = {
                color: value.name || "",
                url: "#", //TODOpaths.products._slug(product.slug).$url({...(variant && { query: { variant: variant.id } })}),
                thumb: variant.media?.[0]?.url,
                price: formatPrice(variant.pricing?.price?.gross),
                name: `${translate(product, "name") || ""} - ${value.name || ""}`,
              };
              finalVariants.push(productVariant);
            }
            return null;
          })
        )
      );
    return finalVariants;
  };

  const getProductPrice = (product: ProductCardFragment) => {
    /* display lowest price, if multiple variants */
    if (product.variants && product.variants.length > 0) {
      // Extract prices from variants
      const prices = product.variants
        .map((variant) => variant.pricing?.price?.gross)
        .filter((price) => price && typeof price.amount === "number"); // Filter out prices that are not objects or have no valid amount

      if (prices.length > 0) {
        // Find the lowest price
        const lowestPrice = prices.reduce((minPrice, price) => {
          return price && minPrice && price.amount < minPrice.amount ? price : minPrice;
        });
        return formatPrice(lowestPrice);
      }
    }

    // Return null or default value if no valid price found
    return null;
  };

  const getProductBrand = (product: ProductCardFragment) => {
    const brandAttribute = product.attributes.find(
      (attribute) => attribute.attribute.slug === "brand"
    );
    const mainValue = brandAttribute?.values[0];
    if (mainValue?.name) {
      return mainValue.name;
    }
    return "";
  };

  return { getColorVariants, getProductPrice, getProductBrand };
};
