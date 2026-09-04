import "@/global.css";
// 1. Added ScrollView to the imports
import { FlatList, Image, ScrollView, Text, View } from "react-native";
// 2. Import SafeAreaView directly (no need for 'styled' in modern NativeWind)
import { SafeAreaView } from "react-native-safe-area-context";

import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* 3. Changed View to ScrollView and used contentContainerClassName for padding */}
      <ScrollView
        contentContainerClassName="p-5 pb-20"
        showsVerticalScrollIndicator={false}
      >
        <View className="home-header">
          <View className="home-user">
            <Image
              source={images.avatar}
              className="home-avatar"
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>

          <Image
            source={icons.add}
            className="home-add-icon"
            style={{ width: 48, height: 48 }}
          />
        </View>

        <View className="home-balance-card">
          <Text className="home-balance-label">Balance</Text>

          <View className="home-balance-row">
            <Text className="home-balance-amount">
              {formatCurrency(HOME_BALANCE?.amount)}
            </Text>
            <Text className="home-balance-date">
              {dayjs(HOME_BALANCE?.nextRenewalDate).format("MM/DD")}
            </Text>
          </View>
        </View>

        <View>
          <ListHeading title="Upcoming" />

          <FlatList
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpcomingSubscriptionCard data={item} />}
            keyExtractor={(item) => item.id}
            // 4. Added horizontal scrolling props for the cards!
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="pb-5" // Adds a little breathing room below the cards
            ListEmptyComponent={
              <Text className="home-empty-state">
                No upcoming renewals yet.
              </Text>
            }
          />
        </View>

        <View>
          <ListHeading title="All Subscriptions" />
          <FlatList
            data={HOME_SUBSCRIPTIONS}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() =>
                  setExpandedSubscriptionId((currentId) =>
                    currentId === item.id ? null : item.id,
                  )
                }
              />
            )}
            keyExtractor={(item) => item.id}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="home-empty-state">No subscriptions found.</Text>
            }
            contentContainerClassName="pb-10"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
