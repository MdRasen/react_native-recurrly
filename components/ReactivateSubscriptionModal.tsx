import SubscriptionIcon from "@/components/SubscriptionIcon";
import { calculateNextRenewalDate, formatCurrency, formatSubscriptionDateTime } from "@/lib/utils";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface ReactivateSubscriptionModalProps {
  visible: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onConfirm: (newStartDate: string, newRenewalDate: string) => void;
}

export default function ReactivateSubscriptionModal({
  visible,
  subscription,
  onClose,
  onConfirm,
}: ReactivateSubscriptionModalProps) {
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [error, setError] = useState<string | null>(null);

  // When modal opens or subscription changes, reset date to today
  useEffect(() => {
    if (visible) {
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setError(null);
    }
  }, [visible, subscription?.id]);

  const frequency = (subscription?.billing as "Monthly" | "Yearly") || "Monthly";

  const computedRenewalDate = useMemo(() => {
    if (!startDate || !dayjs(startDate).isValid()) return null;
    return calculateNextRenewalDate(startDate, frequency);
  }, [startDate, frequency]);

  const handleDateChange = (text: string) => {
    setStartDate(text);
    if (!text.trim()) {
      setError("Please enter an activation date");
    } else if (!dayjs(text.trim()).isValid()) {
      setError("Please enter a valid date (YYYY-MM-DD)");
    } else {
      setError(null);
    }
  };

  const handleConfirm = useCallback(() => {
    const trimmed = startDate.trim();
    if (!trimmed || !dayjs(trimmed).isValid()) {
      setError("Please enter a valid date (YYYY-MM-DD)");
      return;
    }
    const renewal = calculateNextRenewalDate(trimmed, frequency);
    onConfirm(trimmed, renewal);
    onClose();
  }, [startDate, frequency, onConfirm, onClose]);

  if (!subscription) return null;

  const todayStr = dayjs().format("YYYY-MM-DD");
  const tomorrowStr = dayjs().add(1, "day").format("YYYY-MM-DD");
  const firstOfNextMonthStr = dayjs().add(1, "month").startOf("month").format("YYYY-MM-DD");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/60 sm:justify-center sm:p-4">
          {/* Backdrop dismiss */}
          <Pressable
            className="absolute inset-0"
            onPress={onClose}
            accessibilityLabel="Close modal"
          />

          {/* Modal Card */}
          <View className="modal-content max-h-[88%] w-full rounded-t-3xl sm:rounded-3xl sm:max-w-lg sm:self-center overflow-hidden bg-card border border-border">
            {/* Header Handle */}
            <View className="items-center pt-3 pb-1">
              <View className="modal-handle" />
            </View>

            {/* Modal Title */}
            <View className="px-6 pt-2 pb-4 border-b border-border/50">
              <Text className="text-xl font-sans-bold text-foreground">
                Reactivate Subscription
              </Text>
              <Text className="text-xs font-sans text-muted-foreground mt-0.5">
                Set a new activation date to restart your billing cycle.
              </Text>
            </View>

            <ScrollView
              contentContainerClassName="p-6 gap-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Subscription info preview card */}
              <View className="flex-row items-center gap-3.5 rounded-2xl bg-muted/40 p-4 border border-border/60">
                <SubscriptionIcon
                  icon={subscription.icon}
                  name={subscription.name}
                  category={subscription.category}
                  size={46}
                />
                <View className="flex-1">
                  <Text className="text-base font-sans-bold text-foreground" numberOfLines={1}>
                    {subscription.name}
                  </Text>
                  <Text className="text-xs font-sans text-muted-foreground mt-0.5">
                    {subscription.plan ? `${subscription.plan} • ` : ""}
                    {formatCurrency(subscription.price, subscription.currency || "USD")} / {subscription.billing}
                  </Text>
                </View>
              </View>

              {/* Activation Date Section */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-sans-bold text-foreground">
                    New Activation Date
                  </Text>
                  {/* Quick Chips */}
                  <View className="flex-row gap-1.5">
                    <Pressable
                      onPress={() => handleDateChange(todayStr)}
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5",
                        startDate === todayStr
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-semibold",
                          startDate === todayStr
                            ? "text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        Today
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDateChange(tomorrowStr)}
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5",
                        startDate === tomorrowStr
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-semibold",
                          startDate === tomorrowStr
                            ? "text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        Tomorrow
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDateChange(firstOfNextMonthStr)}
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5",
                        startDate === firstOfNextMonthStr
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-semibold",
                          startDate === firstOfNextMonthStr
                            ? "text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        1st Next Mo
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* TextInput for date */}
                <TextInput
                  className={clsx(
                    "h-12 rounded-xl border px-3.5 text-sm font-sans text-foreground bg-input/20 border-border outline-none",
                    error && "border-destructive",
                  )}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={startDate}
                  onChangeText={handleDateChange}
                  keyboardType="numbers-and-punctuation"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                {error && (
                  <Text className="text-[11px] font-sans text-destructive">
                    {error}
                  </Text>
                )}
              </View>

              {/* Next Renewal Preview Banner */}
              {computedRenewalDate && !error && (
                <View className="rounded-xl border border-success/30 bg-success/10 p-3.5 flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-success/20 items-center justify-center">
                    <Text className="text-sm">🔄</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[11px] font-sans-medium text-success/80">
                      Calculated Next Renewal
                    </Text>
                    <Text className="text-xs font-sans-bold text-foreground">
                      {formatSubscriptionDateTime(computedRenewalDate)} ({frequency})
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View className="mt-2 flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="flex-1 items-center justify-center rounded-xl border border-border py-3 px-4 bg-muted/30"
                >
                  <Text className="text-xs font-sans-semibold text-foreground">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  className="flex-1 items-center justify-center rounded-xl bg-primary py-3 px-4 shadow-sm"
                >
                  <Text className="text-xs font-sans-bold text-primary-foreground">
                    Confirm Reactivation
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
