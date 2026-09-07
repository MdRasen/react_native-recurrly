import { POPULAR_BRAND_PRESETS, resolveSubscriptionBrand } from "@/lib/brandLogos";
import { calculateNextRenewalDate } from "@/lib/utils";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import {
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5a623",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#a8d8ea",
  Cloud: "#c3aed6",
  Music: "#f8b4b4",
  Other: "#d5e8d4",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [autoRenew, setAutoRenew] = useState(true);
  const [category, setCategory] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<ImageSourcePropType | { uri: string } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  // Compute next renewal date dynamically from custom start date + frequency
  const computedRenewalDate = useMemo(() => {
    return calculateNextRenewalDate(startDate, frequency);
  }, [startDate, frequency]);

  // Auto-detect brand logo & metadata as the user types
  const detectedBrand = useMemo(() => {
    return resolveSubscriptionBrand(name);
  }, [name]);

  const activeIcon = selectedIcon || detectedBrand.icon;
  const activeColor = selectedColor || detectedBrand.suggestedColor || (category ? CATEGORY_COLORS[category] : "#d5e8d4");

  const isValid = useMemo(() => {
    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);
    return trimmedName.length > 0 && !isNaN(numericPrice) && numericPrice > 0;
  }, [name, price]);

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setAutoRenew(true);
    setCategory("");
    setSelectedIcon(null);
    setSelectedColor(null);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSelectPreset = useCallback((preset: (typeof POPULAR_BRAND_PRESETS)[number]) => {
    setName(preset.name);
    setCategory(preset.category);
    setSelectedIcon(preset.icon);
    setSelectedColor(preset.color);
    setErrors((e) => ({ ...e, name: undefined }));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);

    const newErrors: { name?: string; price?: string } = {};
    if (!trimmedName) newErrors.name = "Name is required";
    if (isNaN(numericPrice) || numericPrice <= 0)
      newErrors.price = "Enter a valid price";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const parsedStart = dayjs(startDate).isValid()
      ? dayjs(startDate).toISOString()
      : dayjs().toISOString();

    const finalCategory = category || detectedBrand.suggestedCategory || "Other";
    const finalIcon = selectedIcon || detectedBrand.icon;
    const finalColor = selectedColor || detectedBrand.suggestedColor || CATEGORY_COLORS[finalCategory] || "#d5e8d4";

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: trimmedName,
      price: numericPrice,
      currency: "USD",
      billing: frequency,
      icon: finalIcon,
      category: finalCategory,
      plan: `${frequency} Plan`,
      status: autoRenew ? "active" : "cancelling",
      startDate: parsedStart,
      renewalDate: computedRenewalDate,
      color: finalColor,
    };

    onCreate(subscription);
    resetForm();
    onClose();
  }, [name, price, frequency, startDate, autoRenew, computedRenewalDate, category, detectedBrand, selectedIcon, selectedColor, onCreate, resetForm, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Overlay */}
        <Pressable className="modal-overlay" onPress={handleClose}>
          {/* Modal container — stop propagation */}
          <Pressable
            className="modal-container"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            {/* Body */}
            <ScrollView
              contentContainerClassName="modal-body"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Logo Preview Banner */}
              <View className="mb-4 flex-row items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5">
                <SubscriptionIcon
                  icon={activeIcon}
                  name={name || "New"}
                  category={category || detectedBrand.suggestedCategory || "Other"}
                  size={52}
                />
                <View className="flex-1">
                  <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
                    {name.trim() || "Subscription Logo"}
                  </Text>
                  <Text className="text-xs font-sans-medium text-muted-foreground">
                    {name.trim()
                      ? detectedBrand.domain
                        ? `Auto-linked logo (${detectedBrand.domain})`
                        : "Brand logo matched"
                      : "Type a name to auto-detect brand logo"}
                  </Text>
                </View>
                {name.trim().length > 0 && (
                  <View className="rounded-full bg-success/15 px-2.5 py-1">
                    <Text className="text-xs font-sans-bold text-success">Linked</Text>
                  </View>
                )}
              </View>

              {/* Quick Brand Presets Row */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground">
                  Popular Services
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-2"
                >
                  {POPULAR_BRAND_PRESETS.map((preset) => {
                    const isSelected = name.toLowerCase() === preset.name.toLowerCase();
                    return (
                      <Pressable
                        key={preset.name}
                        onPress={() => handleSelectPreset(preset)}
                        className={clsx(
                          "flex-row items-center gap-2 rounded-xl border px-3 py-2",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card",
                        )}
                      >
                        <SubscriptionIcon
                          icon={preset.icon}
                          name={preset.name}
                          category={preset.category}
                          size={24}
                          borderRadius={6}
                        />
                        <Text
                          className={clsx(
                            "text-xs font-sans-semibold",
                            isSelected ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {preset.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input outline-none",
                    errors.name && "auth-input-error",
                  )}
                  placeholder="e.g. Netflix, Spotify, Disney+…"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setSelectedIcon(null); // Re-trigger auto-detection
                    setSelectedColor(null);
                    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
                  }}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                {errors.name && <Text className="auth-error">{errors.name}</Text>}
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price (USD)</Text>
                <TextInput
                  className={clsx(
                    "auth-input outline-none",
                    errors.price && "auth-input-error",
                  )}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text);
                    if (errors.price)
                      setErrors((e) => ({ ...e, price: undefined }));
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                {errors.price && (
                  <Text className="auth-error">{errors.price}</Text>
                )}
              </View>

              {/* Frequency Toggle */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((opt) => (
                    <Pressable
                      key={opt}
                      onPress={() => setFrequency(opt)}
                      className={clsx(
                        "picker-option",
                        frequency === opt && "picker-option-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === opt && "picker-option-text-active",
                        )}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Starting Date Field */}
              <View className="auth-field">
                <View className="flex-row items-center justify-between">
                  <Text className="auth-label">Starting Date</Text>
                  <View className="flex-row gap-1.5">
                    <Pressable
                      onPress={() => setStartDate(dayjs().format("YYYY-MM-DD"))}
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5",
                        startDate === dayjs().format("YYYY-MM-DD")
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-semibold",
                          startDate === dayjs().format("YYYY-MM-DD")
                            ? "text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        Today
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        setStartDate(
                          dayjs().startOf("month").format("YYYY-MM-DD"),
                        )
                      }
                      className={clsx(
                        "rounded-full border px-2.5 py-0.5",
                        startDate ===
                          dayjs().startOf("month").format("YYYY-MM-DD")
                          ? "border-primary bg-primary"
                          : "border-border bg-card",
                      )}
                    >
                      <Text
                        className={clsx(
                          "text-[10px] font-sans-semibold",
                          startDate ===
                            dayjs().startOf("month").format("YYYY-MM-DD")
                            ? "text-background"
                            : "text-muted-foreground",
                        )}
                      >
                        1st of Month
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  className="auth-input outline-none"
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={startDate}
                  onChangeText={setStartDate}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                />
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-sans-medium text-muted-foreground">
                    Next billing date:
                  </Text>
                  <Text className="text-xs font-sans-bold text-primary">
                    {dayjs(computedRenewalDate).format("MMMM D, YYYY")}
                  </Text>
                </View>
              </View>

              {/* Auto-Renew Toggle */}
              <View className="auth-field">
                <View className="flex-row items-center justify-between rounded-2xl bg-muted/40 p-3.5 border border-border/60">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-sans-bold text-foreground">
                        Auto-Renew
                      </Text>
                      <View
                        className={clsx(
                          "rounded-full px-2 py-0.5",
                          autoRenew ? "bg-success/20" : "bg-amber-500/20",
                        )}
                      >
                        <Text
                          className={clsx(
                            "text-[10px] font-sans-bold uppercase tracking-wider",
                            autoRenew ? "text-success" : "text-amber-600",
                          )}
                        >
                          {autoRenew ? "On" : "Off"}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-[11px] font-sans text-muted-foreground mt-0.5">
                      {autoRenew
                        ? `Renews automatically on ${dayjs(computedRenewalDate).format("MMMM D, YYYY")}`
                        : `Cancels on ${dayjs(computedRenewalDate).format("MMMM D, YYYY")} (No future charges)`}
                    </Text>
                  </View>
                  <Switch
                    value={autoRenew}
                    onValueChange={setAutoRenew}
                    trackColor={{ false: "rgba(0,0,0,0.15)", true: "#22c55e" }}
                    thumbColor={
                      Platform.OS === "android"
                        ? autoRenew
                          ? "#15803d"
                          : "#94a3b8"
                        : undefined
                    }
                  />
                </View>
              </View>

              {/* Category Chips */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() =>
                        setCategory((prev) => (prev === cat ? "" : cat))
                      }
                      className={clsx(
                        "category-chip",
                        (category === cat || (!category && detectedBrand.suggestedCategory === cat)) &&
                          "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          (category === cat || (!category && detectedBrand.suggestedCategory === cat)) &&
                            "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isValid}
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
