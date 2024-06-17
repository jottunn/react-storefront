import { DataProp } from "editorjs-blocks-react-renderer";
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

export const formatAsMoney = (amount = 0, currency = "RON", locale = DEFAULT_LOCALE) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);

// Returns true for non nullable values
export function notNullable<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const parseEditorJSData = (jsonStringData?: string): DataProp | null => {
  if (!jsonStringData) {
    return null;
  }
  let data;
  try {
    data = JSON.parse(jsonStringData);
  } catch (e) {
    return null;
  }

  if (!data.blocks?.length) {
    // No data to render
    return null;
  }

  // Path for compatibility with data from older version od EditorJS
  if (!data.time) {
    data.time = Date.now().toString();
  }
  if (!data.version) {
    data.version = "2.22.2";
  }

  return data;
};

export const formatDate = (date: Date | number) => {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

// export const formatMoney = (amount: number, currency: string) =>
//   new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency,
//   }).format(amount);

export const formatMoney = (amount: number, currency: string) => {
  const formatted = new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Check if the amount has a fractional part
  const [integerPart, fractionalPart] = formatted.split(".");
  if (fractionalPart === "00" || !fractionalPart) {
    return integerPart;
  }

  return formatted;
};

export const formatMoneyRange = (
  range: {
    start?: { amount: number; currency: string } | null;
    stop?: { amount: number; currency: string } | null;
  } | null,
) => {
  const { start, stop } = range || {};
  // console.log('range', range);
  const startMoney = start ? formatMoney(start.amount, start.currency) : "";
  const stopMoney = stop ? formatMoney(stop.amount, stop.currency) : "";

  if (!startMoney && !stopMoney) {
    // Handle case where both start and stop are null/undefined
    return "N/A"; // Or whatever fallback you prefer
  }

  if (startMoney === stopMoney || !stopMoney) {
    return startMoney;
  }
  // Ensure that both startMoney and stopMoney are strings before concatenation
  return `${startMoney || ""} - ${stopMoney || ""}`;
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
