import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import clsx from "clsx";
import React from "react";
import { Platform, Pressable, Switch, Text, View } from "react-native";

const statusColor = (s?: string, renewalDate?: string) => {
  switch (s) {
    case "active":
      return {
        bg: "bg-success/15",
        dot: "bg-success",
        text: "text-success",
        label: "Active",
      };
    case "cancelling":
      return {
        bg: "bg-amber-500/15",
        dot: "bg-amber-500",
        text: "text-amber-600",
        label: renewalDate
          ? `Cancels on ${formatSubscriptionDateTime(renewalDate)}`
          : "Cancels at period end",
      };
    case "cancelled":
      return {
        bg: "bg-destructive/15",
        dot: "bg-destructive",
        text: "text-destructive",
        label: "Cancelled",
      };
    case "paused":
      return {
        bg: "bg-yellow-500/15",
        dot: "bg-yellow-500",
        text: "text-yellow-600",
        label: "Paused",
      };
    default:
      return {
        bg: "bg-muted",
        dot: "bg-muted-foreground",
        text: "text-muted-foreground",
        label: s ? formatStatusLabel(s) : "Unknown",
      };
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
  onToggleAutoRenew,
  onCancelPress,
  onReactivatePress,
  onDeletePress,
}: SubscriptionCardProps) => {
  const badge = statusColor(status, renewalDate);
  const isCancelled = status === "cancelled";
  const handleToggle = onToggleAutoRenew || onCancelPress;

  return (
    <View
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : {}}
    >
      {/* ── Header row (always visible & tappable) ── */}
      <Pressable onPress={onPress} className="sub-head">
        <View className="sub-main">
          <SubscriptionIcon
            icon={icon}
            name={name}
            category={category}
            size={48}
          />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {status === "cancelling"
                ? `Active until ${formatSubscriptionDateTime(renewalDate)}`
                : isCancelled
                ? "Subscription cancelled"
                : category?.trim() ||
                  plan?.trim() ||
                  (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </Pressable>

      {/* ── Expanded body ── */}
      {expanded && (
        <View className="sub-exp">
          {/* Separator */}
          <View className="sub-divider" />

          {/* Status + Plan row */}
          <View className="sub-badge-row">
            <View className={clsx("sub-badge", badge.bg)}>
              <View className={clsx("sub-badge-dot", badge.dot)} />
              <Text className={clsx("sub-badge-text", badge.text)}>
                {badge.label}
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
              <Text className="sub-tile-label">
                {status === "cancelling"
                  ? "Access Until"
                  : isCancelled
                  ? "Expired On"
                  : "Next Renewal"}
              </Text>
              <Text className="sub-tile-value" numberOfLines={1}>
                {renewalDate
                  ? formatSubscriptionDateTime(renewalDate)
                  : "—"}
              </Text>
            </View>
          </View>

          {/* ── Actions Row ── */}
          {isCancelled ? (
            <View className="mt-3 gap-2">
              {onReactivatePress && (
                <Pressable
                  onPress={onReactivatePress}
                  className="w-full items-center justify-center rounded-xl bg-primary py-3 px-4 shadow-sm"
                >
                  <Text className="text-xs font-sans-bold text-primary-foreground">
                    ✨ Reactivate Subscription
                  </Text>
                </Pressable>
              )}

              {onDeletePress && (
                <Pressable
                  onPress={onDeletePress}
                  className="items-center py-2"
                >
                  <Text className="text-[11px] font-sans-semibold text-destructive">
                    Delete Subscription
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View className="mt-3 gap-2">
              {/* Auto-Renew Toggle Card */}
              <View className="flex-row items-center justify-between rounded-xl bg-muted/40 p-3.5 border border-border/50">
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-sans-bold text-foreground">
                      Auto-Renew
                    </Text>
                    <View
                      className={clsx(
                        "rounded-full px-2 py-0.5",
                        status === "active" ? "bg-success/20" : "bg-amber-500/20",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-bold uppercase tracking-wider",
                          status === "active" ? "text-success" : "text-amber-600",
                        )}
                      >
                        {status === "active" ? "On" : "Off"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[11px] font-sans text-muted-foreground mt-0.5">
                    {status === "active"
                      ? `Renews automatically on ${renewalDate ? formatSubscriptionDateTime(renewalDate) : "next cycle"}`
                      : `Cancels on ${renewalDate ? formatSubscriptionDateTime(renewalDate) : "period end"} (No future bill)`}
                  </Text>
                </View>
                {handleToggle && (
                  <Switch
                    value={status === "active"}
                    onValueChange={handleToggle}
                    trackColor={{ false: "rgba(0,0,0,0.15)", true: "#22c55e" }}
                    thumbColor={
                      Platform.OS === "android"
                        ? status === "active"
                          ? "#15803d"
                          : "#94a3b8"
                        : undefined
                    }
                  />
                )}
              </View>

              {onDeletePress && (
                <Pressable
                  onPress={onDeletePress}
                  className="items-center py-1.5"
                >
                  <Text className="text-[11px] font-sans-medium text-destructive/80">
                    Delete Subscription
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SubscriptionCard;
