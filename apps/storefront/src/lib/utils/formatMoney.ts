import { PriceFragment } from "@/saleor/api";
import { DEFAULT_CHANNEL } from "../regions";

export const formatMoney = (price: PriceFragment) => {
  let formatted;
  const currency = price.currency || DEFAULT_CHANNEL.currencyCode;
  const amount = price.amount;

  if (currency === "RON") {
    formatted = amount.toLocaleString("ro-RO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatted = formatted.replace(/\./g, ""); // replace dots with spaces
    return `${formatted} Lei`;
  } else {
    formatted = new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    formatted = formatted.replace(/\./g, ""); // replace dots with spaces
  }

  // Check if the amount has a fractional part
  const [integerPart, fractionalPart] = formatted.split(".");
  if (fractionalPart === "00" || !fractionalPart) {
    return integerPart;
  }

  return formatted;
};
