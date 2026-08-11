import "@/global.css";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <Text className="text-xl font-bold text-success">
          Welcome to Nativewind!
        </Text>

        <Link
          href="/onboarding"
          className="mt-4 rounded bg-primary p-4 text-white"
        >
          Go to Onboarding
        </Link>

        <Link
          href="/(auth)/sign-in"
          className="mt-4 rounded bg-primary p-4 text-white"
        >
          Go to Sign In
        </Link>

        <Link
          href="/(auth)/sign-up"
          className="mt-4 rounded bg-primary p-4 text-white"
        >
          Go to Sign Up
        </Link>

        <Link href="/subscriptions/spotify" className="mt-4">
          View Spotify Subscription
        </Link>

        <Link
          href={{
            pathname: "/subscriptions/[id]",
            params: { id: "claude" },
          }}
          className="mt-4"
        >
          Claude Max Subscription
        </Link>
      </View>
    </SafeAreaView>
  );
}
