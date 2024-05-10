import { useRegions } from "components/RegionsProvider/RegionsProvider";
import { ProductCardFragment } from "@/saleor/api";
import { translate } from "../translations";
import { ATTR_COLOR_SLUG } from "../const";

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
      (attribute) => attribute.attribute.slug === "brand",
    );
    const mainValue = brandAttribute?.values[0];
    if (mainValue?.name) {
      return mainValue.name;
    }
    return "";
  };

  return { getProductPrice, getProductBrand };
};
