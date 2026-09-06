import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch {
      setLoggingOut(false);
    }
  }, [signOut, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5">
        <Text className="text-2xl font-sans-bold text-primary mb-6">
          Settings
        </Text>

        {/* User info card */}
        {user && (
          <View className="rounded-2xl border border-border bg-card p-5 mb-6">
            <View className="flex-row items-center gap-4">
              {user.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                />
              ) : (
                <View
                  className="items-center justify-center rounded-full bg-accent"
                  style={{ width: 56, height: 56 }}
                >
                  <Text className="text-xl font-sans-bold text-background">
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
                  <Text className="text-lg font-sans-bold text-primary">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                  </Text>
                ) : null}
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sign out */}
        <TouchableOpacity
          className="items-center rounded-2xl border border-destructive/30 bg-destructive/10 py-4"
          onPress={handleSignOut}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color="#dc2626" />
          ) : (
            <Text className="text-base font-sans-bold text-destructive">
              Sign out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
