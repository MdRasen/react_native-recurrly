import "@/global.css";
import { ClerkProvider, ClerkLoaded, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";

import { posthog } from "@/lib/posthog";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY – add it to your .env file",
  );
}

function PostHogIdentity() {
  const { isLoaded, isSignedIn, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    posthog?.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(user.firstName ? { first_name: user.firstName } : {}),
        ...(user.lastName ? { last_name: user.lastName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, isSignedIn, user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SubscriptionsProvider>
          {posthog ? (
            <PostHogProvider client={posthog}>
              <PostHogIdentity />
              <PostHogErrorBoundary>
                <Stack screenOptions={{ headerShown: false }} />
              </PostHogErrorBoundary>
            </PostHogProvider>
          ) : (
            <Stack screenOptions={{ headerShown: false }} />
          )}
        </SubscriptionsProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
