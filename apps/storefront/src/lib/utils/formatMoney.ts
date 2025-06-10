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
    formatted = formatted.replace(/\./g, "");
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

export const formatMoneyRange = (
  range: {
    start?: { amount: number; currency: string } | null;
    stop?: { amount: number; currency: string } | null;
  } | null,
) => {
  const { start, stop } = range || {};
  const startMoney = start ? formatMoney(start) : "";
  const stopMoney = stop ? formatMoney(stop) : "";

  if (!startMoney && !stopMoney) {
    // Handle case where both start and stop are null/undefined
    return "N/A";
  }

  if (startMoney === stopMoney || !stopMoney) {
    return startMoney;
  }
  // Ensure that both startMoney and stopMoney are strings before concatenation
  return `${startMoney || ""} - ${stopMoney || ""}`;
};
