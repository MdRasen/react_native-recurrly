import type { ExpenseSummary } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";

interface InsightsExpenseCardProps {
  data: ExpenseSummary;
}

const InsightsExpenseCard = ({ data }: InsightsExpenseCardProps) => {
  const formattedAmount = formatCurrency(data.total);

  return (
    <View className="insights-expense-card">
      {/* Top row: label + amount */}
      <View className="insights-expense-row">
        <Text className="insights-expense-label">Expenses</Text>
        <Text className="insights-expense-amount">−{formattedAmount}</Text>
      </View>

      {/* Bottom row: month/year + change % */}
      <View className="insights-expense-row mt-1">
        <Text className="insights-expense-meta">
          {data.month} {data.year}
        </Text>
        <Text className="insights-expense-change">
          +{data.changePercent}%
        </Text>
      </View>
    </View>
  );
};

export default InsightsExpenseCard;
