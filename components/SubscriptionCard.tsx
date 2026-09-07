import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

const statusColor = (s?: string) => {
  switch (s) {
    case "active":
      return { bg: "bg-success/15", text: "text-success" };
    case "paused":
      return { bg: "bg-yellow-500/15", text: "text-yellow-600" };
    case "cancelled":
      return { bg: "bg-destructive/15", text: "text-destructive" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
  }
};

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  paymentMethod,
  startDate,
  status,
  expanded,
  onPress,
}: SubscriptionCardProps) => {
  const badge = statusColor(status);

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : {}}
    >
      {/* ── Header row (always visible) ── */}
      <View className="sub-head">
        <View className="sub-main">
          <Image
            source={icon}
            className="sub-icon"
            style={{ width: 48, height: 48 }}
          />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {/* ── Expanded body ── */}
      {expanded && (
        <View className="sub-exp">
          {/* Separator */}
          <View className="sub-divider" />

          {/* Status + Plan row */}
          <View className="sub-badge-row">
            <View className={clsx("sub-badge", badge.bg)}>
              <View className={clsx("sub-badge-dot", badge.text === "text-success" ? "bg-success" : badge.text === "text-yellow-600" ? "bg-yellow-500" : badge.text === "text-destructive" ? "bg-destructive" : "bg-muted-foreground")} />
              <Text className={clsx("sub-badge-text", badge.text)}>
                {status ? formatStatusLabel(status) : "Unknown"}
              </Text>
            </View>
            {plan && (
              <View className="sub-plan-pill">
                <Text className="sub-plan-pill-text">{plan}</Text>
              </View>
            )}
          </View>

          {/* Full-width payment tile */}
          <View className="sub-tile sub-tile-full">
            <Text className="sub-tile-label">Payment</Text>
            <Text className="sub-tile-value" numberOfLines={1} ellipsizeMode="tail">
              {paymentMethod?.trim() || "—"}
            </Text>
          </View>

          {/* Detail tiles grid */}
          <View className="sub-tile-grid">
            <View className="sub-tile">
              <Text className="sub-tile-label">Category</Text>
              <Text className="sub-tile-value" numberOfLines={1} ellipsizeMode="tail">
                {category?.trim() || "—"}
              </Text>
            </View>
            <View className="sub-tile">
              <Text className="sub-tile-label">Started</Text>
              <Text className="sub-tile-value" numberOfLines={1}>
                {startDate
                  ? formatSubscriptionDateTime(startDate)
                  : "—"}
              </Text>
            </View>
            <View className="sub-tile">
              <Text className="sub-tile-label">Next Renewal</Text>
              <Text className="sub-tile-value" numberOfLines={1}>
                {renewalDate
                  ? formatSubscriptionDateTime(renewalDate)
                  : "—"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;

