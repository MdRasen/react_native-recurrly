import { formatCurrency } from "@/lib/utils";
import SubscriptionIcon from "@/components/SubscriptionIcon";
import React from "react";
import { Text, View } from "react-native";

const UpcomingSubscriptionCard = ({
  data: { name, price, daysLeft, icon, currency },
}: {
  data: UpcomingSubscription;
}) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <SubscriptionIcon
          icon={icon}
          name={name}
          size={48}
        />
        <View>
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
