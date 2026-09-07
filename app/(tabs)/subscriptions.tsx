import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  "All",
  ...Array.from(
    new Set(
      HOME_SUBSCRIPTIONS.map((s) => s.category).filter(
        (c): c is string => !!c,
      ),
    ),
  ),
];

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return HOME_SUBSCRIPTIONS.filter((sub) => {
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
  }, [searchQuery, selectedCategory]);

  const handleSubscriptionPress = useCallback(
    (subscription: (typeof HOME_SUBSCRIPTIONS)[number]) => {
      setExpandedSubscriptionId((prev) =>
        prev === subscription.id ? null : subscription.id,
      );
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const resultCount = filteredSubscriptions.length;
  const totalCount = HOME_SUBSCRIPTIONS.length;

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
          {CATEGORIES.map((cat) => (
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
    </SafeAreaView>
  );
};

export default Subscriptions;
