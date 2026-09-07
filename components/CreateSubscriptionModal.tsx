import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
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
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const isValid = useMemo(() => {
    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);
    return trimmedName.length > 0 && !isNaN(numericPrice) && numericPrice > 0;
  }, [name, price]);

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("");
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

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

    const now = dayjs();
    const renewalDate =
      frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      name: trimmedName,
      price: numericPrice,
      currency: "USD",
      billing: frequency,
      icon: icons.wallet,
      category: category || "Other",
      plan: `${frequency} Plan`,
      status: "active",
      startDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      color: CATEGORY_COLORS[category || "Other"] ?? "#d5e8d4",
    };

    onCreate(subscription);
    resetForm();
    onClose();
  }, [name, price, frequency, category, onCreate, resetForm, onClose]);

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
          {/* Modal container — stop propagation so tapping inside doesn't close */}
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
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input outline-none",
                    errors.name && "auth-input-error",
                  )}
                  placeholder="e.g. Netflix, Spotify…"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
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
                        category === cat && "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
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
