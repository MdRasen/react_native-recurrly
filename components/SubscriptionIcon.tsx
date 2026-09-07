import { icons } from "@/constants/icons";
import React, { useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SubscriptionIconProps {
  icon?: ImageSourcePropType | { uri: string };
  name?: string;
  category?: string;
  size?: number;
  borderRadius?: number;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Entertainment: { bg: "#fef3c7", text: "#b45309" },
  Music: { bg: "#fee2e2", text: "#b91c1c" },
  "AI Tools": { bg: "#e0f2fe", text: "#0369a1" },
  "Developer Tools": { bg: "#f3e8ff", text: "#7e22ce" },
  Design: { bg: "#fef9c3", text: "#a16207" },
  Productivity: { bg: "#e0f7fa", text: "#00695c" },
  Cloud: { bg: "#ede9fe", text: "#6d28d9" },
  Fitness: { bg: "#dcfce7", text: "#15803d" },
  Other: { bg: "#f1f5f9", text: "#475569" },
};

export const SubscriptionIcon: React.FC<SubscriptionIconProps> = ({
  icon,
  name = "",
  category = "Other",
  size = 48,
  borderRadius = 14,
}) => {
  const [hasError, setHasError] = useState(false);

  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
  const initial = name.trim().charAt(0).toUpperCase();

  // If icon is provided and hasn't encountered an error
  if (icon && !hasError) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: "#f8fafc",
          },
        ]}
      >
        <Image
          source={icon as ImageSourcePropType}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            borderRadius: borderRadius * 0.5,
          }}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      </View>
    );
  }

  // Graceful fallback: high-contrast stylized initial badge
  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colors.bg,
        },
      ]}
    >
      {initial ? (
        <Text
          style={[
            styles.initialText,
            { color: colors.text, fontSize: size * 0.44 },
          ]}
        >
          {initial}
        </Text>
      ) : (
        <Image
          source={icons.wallet}
          style={{ width: size * 0.5, height: size * 0.5, tintColor: colors.text }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  initialText: {
    fontWeight: "800",
  },
});

export default SubscriptionIcon;
