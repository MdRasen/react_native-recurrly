import "@/global.css";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

import { posthog } from "@/lib/posthog";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatCurrency, formatStatusLabel } from "@/lib/utils";
import { colors } from "@/constants/theme";
import EditProfileModal from "@/components/EditProfileModal";

/* ────────────────────────────────────────────────────── */
/*  SettingsRow                                           */
/* ────────────────────────────────────────────────────── */
interface SettingsRowProps {
  icon: string;
  iconBg: string;
  label: string;
  detail?: string;
  onPress?: () => void;
}

const SettingsRow = ({ icon, iconBg, label, detail, onPress }: SettingsRowProps) => {
  const content = (
    <View className="settings-row">
      <View className="settings-row-icon-wrap" style={{ backgroundColor: iconBg }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text className="settings-row-label">{label}</Text>
      {detail && <Text className="settings-row-value">{detail}</Text>}
      {onPress && <Text className="settings-row-chevron">›</Text>}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
};

/* ────────────────────────────────────────────────────── */
/*  Settings screen                                       */
/* ────────────────────────────────────────────────────── */
const appVersion = Constants.expoConfig?.version ?? "1.0.0";

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const ph = usePostHog();

  const [loggingOut, setLoggingOut] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    ph?.capture("settings_screen_viewed");
  }, [ph]);

  /* ── Export subscriptions via Share sheet ── */
  const handleExport = useCallback(async () => {
    ph?.capture("settings_export_tapped");

    const lines = HOME_SUBSCRIPTIONS.map(
      (sub, i) =>
        `${i + 1}. ${sub.name} — ${formatCurrency(sub.price, sub.currency)}/${sub.billing}` +
        (sub.status ? ` (${formatStatusLabel(sub.status)})` : ""),
    );

    const activeMonthly = HOME_SUBSCRIPTIONS.filter(
      (s) => s.billing === "Monthly" && s.status === "active",
    ).reduce((sum, s) => sum + s.price, 0);

    const message = [
      "📋 My Subscriptions (Recurrly)\n",
      ...lines,
      "",
      `Active monthly total: ${formatCurrency(activeMonthly)}`,
      `Exported on: ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    ].join("\n");

    try {
      await Share.share({ message, title: "My Subscriptions" });
    } catch {
      // User cancelled share sheet
    }
  }, [ph]);

  /* ── Sign out ── */
  const handleSignOut = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut();
      posthog?.capture("sign_out_completed");
      posthog?.reset();
      router.replace("/(auth)/sign-in");
    } catch {
      setLoggingOut(false);
    }
  }, [signOut, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-30"
        showsVerticalScrollIndicator={false}
      >
        <Text className="settings-title">Settings</Text>

        {/* ── Profile card ── */}
        {user && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setProfileModalVisible(true)}
          >
            <View className="settings-profile-card">
              {user.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              ) : (
                <View
                  className="settings-profile-avatar"
                  style={{ width: 56, height: 56 }}
                >
                  <Text className="settings-profile-avatar-text">
                    {(
                      user.firstName?.[0] ||
                      user.emailAddresses[0]?.emailAddress?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                {user.firstName || user.lastName ? (
                  <Text className="settings-profile-name">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                  </Text>
                ) : null}
                <Text className="settings-profile-email">
                  {user.emailAddresses[0]?.emailAddress}
                </Text>
              </View>
              <Text className="text-sm font-sans-semibold text-accent">Edit</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── General ── */}
        <Text className="settings-section-label">General</Text>
        <View className="settings-card">
          <SettingsRow
            icon="📤"
            iconBg="rgba(6,182,212,0.12)"
            label="Export Subscriptions"
            onPress={handleExport}
          />
          <View className="settings-divider" />
          <SettingsRow
            icon="ℹ️"
            iconBg="rgba(59,130,246,0.12)"
            label="App Version"
            detail={`v${appVersion}`}
          />
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity
          className="settings-sign-out"
          onPress={handleSignOut}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.destructive} />
          ) : (
            <Text className="settings-sign-out-text">Sign Out</Text>
          )}
        </TouchableOpacity>

        {/* ── Footer ── */}
        <View className="settings-version">
          <Text className="settings-version-text">
            Recurrly v{appVersion}
          </Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Settings;
