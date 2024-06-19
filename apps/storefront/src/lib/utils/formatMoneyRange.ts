import { formatMoney } from "@/lib/utils/formatMoney";

export const formatMoneyRange = (
  range: {
    start?: { amount: number; currency: string } | null;
    stop?: { amount: number; currency: string } | null;
  } | null,
) => {
  const { start, stop } = range || {};
  // console.log('range', range);
  const startMoney = start ? formatMoney(start) : "";
  const stopMoney = stop ? formatMoney(stop) : "";

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
