import { styled } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const insights = () => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-5">
        <Text>insights</Text>
      </View>
    </SafeAreaView>
  );
};

export default insights;
