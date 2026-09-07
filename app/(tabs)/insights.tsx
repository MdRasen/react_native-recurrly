import "@/global.css";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useRouter } from "expo-router";

import InsightsBarChart from "@/components/InsightsBarChart";
import InsightsExpenseCard from "@/components/InsightsExpenseCard";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import {
  INSIGHTS_EXPENSES,
  INSIGHTS_WEEKLY_SPENDING,
} from "@/constants/data";

export default function Insights() {
  const { subscriptions, totalMonthlySpend } = useSubscriptions();
  const posthog = usePostHog();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    posthog?.capture("insights_screen_viewed");
  }, [posthog]);

  const handleViewAllSubscriptions = useCallback(() => {
    router.push("/(tabs)/subscriptions");
  }, [router]);

  const handleSubscriptionPress = useCallback(
    (subscription: Subscription) => {
      const isExpanding = expandedId !== subscription.id;

      posthog?.capture("insights_history_item_toggled", {
        subscription_id: subscription.id,
        subscription_name: subscription.name,
        is_expanded: isExpanding,
      });

      setExpandedId(isExpanding ? subscription.id : null);
    },
    [expandedId, posthog],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Screen title ── */}
        <Text className="subs-screen-title">Monthly Insights</Text>

        {/* ── Upcoming section with bar chart ── */}
        <ListHeading
          title="Upcoming"
          onViewAll={handleViewAllSubscriptions}
        />
        <InsightsBarChart
          data={INSIGHTS_WEEKLY_SPENDING}
          highlightDay="Thu"
        />

        {/* ── Expenses summary ── */}
        <View className="mt-5">
          <InsightsExpenseCard
            data={{
              ...INSIGHTS_EXPENSES,
              total: totalMonthlySpend,
            }}
          />
        </View>

        {/* ── History section (expandable cards) ── */}
        <ListHeading
          title="History"
          onViewAll={handleViewAllSubscriptions}
        />
        <FlatList
          data={subscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedId === item.id}
              onPress={() => handleSubscriptionPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          extraData={expandedId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerClassName="pb-5"
          ListEmptyComponent={
            <Text className="home-empty-state">No payment history yet.</Text>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
