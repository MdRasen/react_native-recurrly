import dayjs from "dayjs";
import { Alert, Platform } from "react-native";

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

export const calculateNextRenewalDate = (
  startDateStr: string,
  frequency: "Monthly" | "Yearly" = "Monthly",
): string => {
  let start = dayjs(startDateStr);
  if (!start.isValid()) {
    start = dayjs();
  }
  const now = dayjs();
  let renewal = start;

  if (renewal.isSame(now, "day")) {
    return (frequency === "Monthly" ? renewal.add(1, "month") : renewal.add(1, "year")).toISOString();
  }

  if (renewal.isAfter(now, "day")) {
    return renewal.toISOString();
  }

  if (frequency === "Monthly") {
    while (!renewal.isAfter(now, "day")) {
      renewal = renewal.add(1, "month");
    }
  } else {
    while (!renewal.isAfter(now, "day")) {
      renewal = renewal.add(1, "year");
    }
  }

  return renewal.toISOString();
};

import { resolveSubscriptionBrand } from "./brandLogos";

export const getSubscriptionLogoSource = (name: string) => {
  return resolveSubscriptionBrand(name).icon;
};

export const confirmAction = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmButtonText = "Confirm",
  isDestructive = true,
) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok) {
        onConfirm();
      }
    } else {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Nevermind", style: "cancel" },
      {
        text: confirmButtonText,
        style: isDestructive ? "destructive" : "default",
        onPress: onConfirm,
      },
    ]);
  }
};
