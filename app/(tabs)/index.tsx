import "@/global.css";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
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
import { usePostHog } from "posthog-react-native";
import { useCallback, useState } from "react";

export default function App() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);
  const posthog = usePostHog();

  const handleSubscriptionPress = useCallback(
    (subscription: Subscription) => {
      const isExpanded = expandedSubscriptionId !== subscription.id;

      posthog?.capture("subscription_details_toggled", {
        subscription_id: subscription.id,
        subscription_category: subscription.category,
        subscription_status: subscription.status,
        is_expanded: isExpanded,
      });
      setExpandedSubscriptionId(isExpanded ? subscription.id : null);
    },
    [expandedSubscriptionId, posthog],
  );

  const handleCreateSubscription = useCallback(
    (newSub: Subscription) => {
      setSubscriptions((prev) => [newSub, ...prev]);

      posthog?.capture("subscription_created", {
        subscription_id: newSub.id,
        subscription_category: newSub.category,
        subscription_billing: newSub.billing,
      });
    },
    [posthog],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
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

          <Pressable onPress={() => setModalVisible(true)}>
            <Image
              source={icons.add}
              className="home-add-icon"
              style={{ width: 48, height: 48 }}
            />
          </Pressable>
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
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="pb-5"
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
            data={subscriptions}
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
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="home-empty-state">No subscriptions found.</Text>
            }
            contentContainerClassName="pb-10"
          />
        </View>
      </ScrollView>

      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateSubscription}
      />
    </SafeAreaView>
  );
}
