import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
          <View className="p-5">
            <Text>subscriptions</Text>
          </View>
    </ SafeAreaView>
  );
};

export default subscriptions;
