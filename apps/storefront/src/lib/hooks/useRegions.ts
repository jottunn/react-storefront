"use client";

import { PriceFragment } from "@/saleor/api";
import { DEFAULT_CHANNEL, DEFAULT_LOCALE } from "../regions";

// const formatAsMoney = (amount = 0, currency = "USD", locale = DEFAULT_LOCALE) =>
//     new Intl.NumberFormat(locale, {
//         style: "currency",
//         currency,
//     }).format(amount);

export const formatAsMoney = (amount: number, currency: string, locale = DEFAULT_LOCALE) => {
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

export const formatPrice = (price?: PriceFragment) => {
  // console.log(formatPrice);
  // console.log(price);
  return formatAsMoney(
    price?.amount || 0,
    price?.currency || DEFAULT_CHANNEL.currencyCode,
    DEFAULT_LOCALE,
  );
};
