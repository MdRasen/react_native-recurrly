import "@/global.css";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import { usePostHog } from "posthog-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ReactivateSubscriptionModal from "@/components/ReactivateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { confirmAction, formatCurrency } from "@/lib/utils";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const posthog = usePostHog();

  const {
    subscriptions,
    currentMonthlySpend,
    projectedFutureSpend,
    activeCount,
    addSubscription,
    toggleAutoRenew,
    reactivateSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reactivatingSubscription, setReactivatingSubscription] = useState<Subscription | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = useMemo(() => {
    if (user?.firstName) return user.firstName;
    if (user?.fullName) return user.fullName;
    return HOME_USER.name;
  }, [user]);

  // Next upcoming renewal date computation
  const nextRenewalInfo = useMemo(() => {
    const activeSubs = subscriptions.filter((s) => s.status === "active" && s.renewalDate);
    if (activeSubs.length === 0) return null;
    const sorted = [...activeSubs].sort((a, b) =>
      dayjs(a.renewalDate).diff(dayjs(b.renewalDate)),
    );
    return sorted[0];
  }, [subscriptions]);

  // Category filter chips on home screen
  const availableCategories = useMemo(() => {
    const cats = Array.from(
      new Set(subscriptions.map((s) => s.category).filter((c): c is string => !!c)),
    );
    return ["All", "Active", ...cats];
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (selectedFilter === "All") return subscriptions;
    if (selectedFilter === "Active")
      return subscriptions.filter((s) => s.status === "active");
    return subscriptions.filter((s) => s.category === selectedFilter);
  }, [subscriptions, selectedFilter]);

  const handleSubscriptionPress = useCallback(
    (subscription: Subscription) => {
      const isExpanded = expandedSubscriptionId !== subscription.id;

      posthog?.capture("subscription_details_toggled", {
        subscription_id: subscription.id,
        subscription_category: subscription.category ?? "Other",
        subscription_status: subscription.status ?? "active",
        is_expanded: isExpanded,
      });
      setExpandedSubscriptionId(isExpanded ? subscription.id : null);
    },
    [expandedSubscriptionId, posthog],
  );

  const handleToggleAutoRenew = useCallback(
    (sub: Subscription) => {
      const isAutoRenewOn = sub.status === "active";
      const renewalDateText = sub.renewalDate
        ? dayjs(sub.renewalDate).format("MMMM D, YYYY")
        : "the end of your billing cycle";

      confirmAction(
        isAutoRenewOn ? "Turn Off Auto-Renew" : "Resume Auto-Renew",
        isAutoRenewOn
          ? `Turn off auto-renew for ${sub.name}? You will continue to have access until ${renewalDateText}, and it will not charge you again.`
          : `Resume auto-renew for ${sub.name}? Your subscription will renew automatically on ${renewalDateText}.`,
        () => {
          toggleAutoRenew(sub.id);
          posthog?.capture("subscription_autorenew_toggled", {
            subscription_id: sub.id,
            subscription_name: sub.name,
            new_status: isAutoRenewOn ? "cancelling" : "active",
          });
        },
        isAutoRenewOn ? "Turn Off Auto-Renew" : "Resume Auto-Renew",
        isAutoRenewOn,
      );
    },
    [toggleAutoRenew, posthog],
  );

  const handleDeleteSubscription = useCallback(
    (sub: Subscription) => {
      confirmAction(
        "Delete Subscription",
        `Are you sure you want to permanently delete ${sub.name} from your tracker?`,
        () => {
          deleteSubscription(sub.id);
          posthog?.capture("subscription_deleted", {
            subscription_id: sub.id,
            subscription_name: sub.name,
          });
        },
        "Delete",
        true,
      );
    },
    [deleteSubscription, posthog],
  );

  const handleReactivateSubscription = useCallback(
    (newStartDate: string, newRenewalDate: string) => {
      if (!reactivatingSubscription) return;
      reactivateSubscription(
        reactivatingSubscription.id,
        newStartDate,
        newRenewalDate,
      );
      posthog?.capture("subscription_reactivated", {
        subscription_id: reactivatingSubscription.id,
        subscription_name: reactivatingSubscription.name,
        new_start_date: newStartDate,
        new_renewal_date: newRenewalDate,
      });
      setReactivatingSubscription(null);
    },
    [reactivatingSubscription, reactivateSubscription, posthog],
  );

  const handleCreateSubscription = useCallback(
    (newSub: Subscription) => {
      addSubscription(newSub);

      posthog?.capture("subscription_created", {
        subscription_id: newSub.id,
        subscription_category: newSub.category ?? "Other",
        subscription_billing: newSub.billing,
      });
    },
    [addSubscription, posthog],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="p-5 pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Home Header ── */}
        <View className="home-header">
          <Pressable
            className="flex-row items-center gap-3.5"
            onPress={() => router.push("/settings")}
          >
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              style={{ width: 52, height: 52, borderRadius: 26 }}
            />
            <View className="justify-center">
              <Text className="text-xs font-sans-medium text-muted-foreground">
                {greeting},
              </Text>
              <Text
                className="text-xl font-sans-bold text-primary leading-tight"
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setModalVisible(true)}
            className="items-center justify-center rounded-2xl bg-accent p-3"
          >
            <Image
              source={icons.add}
              className="home-add-icon"
              style={{ width: 26, height: 26 }}
            />
          </Pressable>
        </View>

        {/* ── Monthly Spend Summary Card ── */}
        <View className="home-balance-card">
          <View className="flex-row items-center justify-between">
            <Text className="home-balance-label">Monthly Expenses</Text>
            <View className="rounded-full bg-primary/10 px-2.5 py-0.5">
              <Text className="text-xs font-sans-bold text-primary">
                {activeCount} Active
              </Text>
            </View>
          </View>

          <View className="home-balance-row mt-1">
            <Text className="home-balance-amount">
              {formatCurrency(currentMonthlySpend)}
            </Text>
            {nextRenewalInfo && (
              <View className="items-end">
                <Text className="text-xs font-sans-medium text-muted-foreground">
                  Next Due
                </Text>
                <Text className="home-balance-date">
                  {dayjs(nextRenewalInfo.renewalDate).format("MMM DD")}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stat Pill Row */}
          <View className="mt-4 flex-row items-center justify-between border-t border-border/40 pt-3">
            <View>
              <Text className="text-xs font-sans-medium text-muted-foreground">
                Projected Yearly
              </Text>
              <Text className="text-sm font-sans-bold text-primary">
                {formatCurrency(projectedFutureSpend * 12)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-sans-medium text-muted-foreground">
                Tracked Total
              </Text>
              <Text className="text-sm font-sans-bold text-primary">
                {subscriptions.length} Services
              </Text>
            </View>
          </View>
        </View>

        {/* ── Upcoming Renewals ── */}
        <View className="mt-2">
          <ListHeading title="Upcoming Renewals" />

          <FlatList
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpcomingSubscriptionCard data={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="pb-3 gap-3"
            ListEmptyComponent={
              <Text className="home-empty-state">
                No upcoming renewals this week.
              </Text>
            }
          />
        </View>

        {/* ── Subscriptions Section ── */}
        <View className="mt-3">
          <ListHeading
            title="All Subscriptions"
            onViewAll={() => router.push("/subscriptions")}
          />

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pb-3 pt-1"
          >
            {availableCategories.map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  className={`rounded-full px-3.5 py-1.5 border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-semibold ${
                      isSelected ? "text-background" : "text-muted-foreground"
                    }`}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Subscriptions List */}
          <FlatList
            data={filteredSubscriptions}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => handleSubscriptionPress(item)}
                onToggleAutoRenew={() => handleToggleAutoRenew(item)}
                onReactivatePress={() => setReactivatingSubscription(item)}
                onDeletePress={() => handleDeleteSubscription(item)}
              />
            )}
            keyExtractor={(item) => item.id}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-3" />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Let the parent ScrollView handle scrolling
            ListEmptyComponent={
              <View className="items-center justify-center rounded-2xl border border-dashed border-border p-6 mt-2">
                <Text className="text-sm font-sans-bold text-primary">
                  No subscriptions found
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground text-center">
                  Tap the + button above to add your first subscription.
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>

      {/* ── Create Subscription Modal ── */}
      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateSubscription}
      />

      {/* ── Reactivate Subscription Modal ── */}
      <ReactivateSubscriptionModal
        visible={!!reactivatingSubscription}
        subscription={reactivatingSubscription}
        onClose={() => setReactivatingSubscription(null)}
        onConfirm={handleReactivateSubscription}
      />
    </SafeAreaView>
  );
}
