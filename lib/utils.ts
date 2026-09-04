import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  // 1. Guard against undefined, null, or invalid numbers to prevent .toFixed crashes
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "$0.00";
  }

  const numericValue = Number(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    // 2. Add the missing $ sign to the fallback
    return `$${numericValue.toFixed(2)}`;
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
