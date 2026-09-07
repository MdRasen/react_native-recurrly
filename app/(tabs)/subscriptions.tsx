import SubscriptionCard from "@/components/SubscriptionCard";
import ReactivateSubscriptionModal from "@/components/ReactivateSubscriptionModal";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { icons } from "@/constants/icons";
import { confirmAction } from "@/lib/utils";
import dayjs from "dayjs";
import "@/global.css";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const {
    subscriptions,
    toggleAutoRenew,
    reactivateSubscription,
    deleteSubscription,
  } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [reactivatingSubscription, setReactivatingSubscription] =
    useState<Subscription | null>(null);

  const categories = useMemo(() => [
    "All",
    ...Array.from(
      new Set(
        subscriptions.map((s) => s.category).filter((c): c is string => !!c),
      ),
    ),
  ], [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return subscriptions.filter((sub) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "All" || sub.category === selectedCategory;

      // Search filter — match across name, category, plan, and status
      const matchesSearch =
        !query ||
        sub.name.toLowerCase().includes(query) ||
        sub.category?.toLowerCase().includes(query) ||
        sub.plan?.toLowerCase().includes(query) ||
        sub.status?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, subscriptions]);

  const handleSubscriptionPress = useCallback(
    (subscription: Subscription) => {
      setExpandedSubscriptionId((prev) =>
        prev === subscription.id ? null : subscription.id,
      );
    },
    [],
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
        },
        isAutoRenewOn ? "Turn Off Auto-Renew" : "Resume Auto-Renew",
        isAutoRenewOn,
      );
    },
    [toggleAutoRenew],
  );

  const handleDeleteSubscription = useCallback(
    (sub: Subscription) => {
      confirmAction(
        "Delete Subscription",
        `Are you sure you want to permanently delete ${sub.name} from your tracker?`,
        () => {
          deleteSubscription(sub.id);
        },
        "Delete",
        true,
      );
    },
    [deleteSubscription],
  );

  const handleReactivateSubscription = useCallback(
    (newStartDate: string, newRenewalDate: string) => {
      if (!reactivatingSubscription) return;
      reactivateSubscription(
        reactivatingSubscription.id,
        newStartDate,
        newRenewalDate,
      );
      setReactivatingSubscription(null);
    },
    [reactivatingSubscription, reactivateSubscription],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const resultCount = filteredSubscriptions.length;
  const totalCount = subscriptions.length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5 pb-0">
        {/* Screen Title */}
        <Text className="subs-screen-title">Subscriptions</Text>

        {/* Search Bar */}
        <View className="subs-search-bar">
          <Image
            source={icons.activity}
            className="subs-search-icon"
            style={{ width: 20, height: 20, tintColor: "rgba(0,0,0,0.4)" }}
          />
          <TextInput
            className="subs-search-input"
            placeholder="Search subscriptions…"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClearSearch} className="subs-search-clear">
              <Text className="subs-search-clear-text">✕</Text>
            </Pressable>
          )}
        </View>

        {/* Category Filter Chips */}
        <View className="subs-chip-row">
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "category-chip category-chip-active"
                  : "category-chip"
              }
            >
              <Text
                className={
                  selectedCategory === cat
                    ? "category-chip-text category-chip-text-active"
                    : "category-chip-text"
                }
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Result Count */}
        {(searchQuery || selectedCategory !== "All") && (
          <Text className="subs-result-count">
            {resultCount} of {totalCount} subscription
            {totalCount !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Subscription List */}
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
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-30 pt-2"
        ListEmptyComponent={
          <View className="subs-empty">
            <Text className="subs-empty-title">No results found</Text>
            <Text className="subs-empty-subtitle">
              Try a different search term or category
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
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
};

export default Subscriptions;
