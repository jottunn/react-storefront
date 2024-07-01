import fs from "fs";
import path from "path";
import { DEFAULT_LOCALE } from "src/lib/regions";

/**
 * Maps short locale codes to their full form if needed.
 * @param {string} locale - The short form locale code from the URL.
 * @returns {string} - The full form locale code for internal use.
 */
export function mapLocaleForInternalUse(locale: string): string {
  const localeMap: { [key: string]: string } = {
    en: "en-US",
    ro: "ro-RO",
    // any other mappings
  };

  if (locale in localeMap) {
    return localeMap[locale];
  }

  return locale;
}

// Returns true for non nullable values
export function notNullable<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const formatDate = (date: Date | number) => {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

export function getHrefForVariant({
  productSlug,
  variantId,
}: {
  productSlug: string;
  variantId?: string;
}): string {
  const pathname = `/products/${encodeURIComponent(productSlug)}`;

  if (!variantId) {
    return pathname;
  }

  const query = new URLSearchParams({ variant: variantId });
  return `${pathname}?${query.toString()}`;
}

export const getDiscountPercentage = (
  priceUndiscounted: number,
  priceAfterDiscount: number,
): number => {
  const discountPercentage = ((priceUndiscounted - priceAfterDiscount) / priceUndiscounted) * 100;
  return Math.round(discountPercentage);
};

export function getFourtyFiveDaysAgoDate(): string {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 45);
  return pastDate.toISOString();
}

export const getCurrentHref = () => location.href;
export interface Messages {
  [key: string]: string;
}

export const getMessages = (locale: string, prefix: string = ""): Messages => {
  const filePath = path.resolve("src/locales", `${locale}.json`);
  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(jsonData);
    if (prefix) {
      const filteredData = Object.keys(parsedData)
        .filter((key) => key.startsWith(prefix))
        .reduce((obj, key) => {
          obj[key] = parsedData[key];
          return obj;
        }, {} as Messages);
      return filteredData;
    }
    return parsedData;
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
    return {};
  }
};

/** get order value from metadata
 * metadata key = order
 */

export const getOrderValue = (metadata: any[]) => {
  const orderMetadata = metadata.find((meta) => meta.key === "order");
  return orderMetadata ? parseInt(orderMetadata.value, 10) : Infinity;
};
