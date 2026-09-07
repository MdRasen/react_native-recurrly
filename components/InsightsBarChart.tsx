import { colors } from "@/constants/theme";
import type { WeeklySpending } from "@/constants/data";
import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";

interface InsightsBarChartProps {
  data: WeeklySpending[];
  highlightDay?: string;
}

const CHART_HEIGHT = 200;
const Y_AXIS_WIDTH = 32;
const MAX_Y = 45;
const Y_TICKS = [0, 5, 15, 25, 35, 45];
const BAR_WIDTH = 26;

const InsightsBarChart = ({
  data,
  highlightDay = "Thu",
}: InsightsBarChartProps) => {
  return (
    <View className="insights-chart-card">
      {/* Chart area: Y-axis + bars + grid */}
      <View style={{ flexDirection: "row", height: CHART_HEIGHT }}>
        {/* Y-axis labels */}
        <View
          style={{
            width: Y_AXIS_WIDTH,
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingRight: 8,
          }}
        >
          {[...Y_TICKS].reverse().map((tick) => (
            <Text key={tick} className="insights-chart-y-label">
              {tick}
            </Text>
          ))}
        </View>

        {/* Grid + bars container */}
        <View style={{ flex: 1, position: "relative" }}>
          {/* Horizontal grid lines */}
          {Y_TICKS.map((tick) => (
            <View
              key={`grid-${tick}`}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: (tick / MAX_Y) * CHART_HEIGHT,
                height: 1,
                backgroundColor: "rgba(0,0,0,0.06)",
              }}
            />
          ))}

          {/* Bars */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-around",
            }}
          >
            {data.map((item) => {
              const isHighlighted = item.day === highlightDay;
              const barHeight = Math.max(
                (item.amount / MAX_Y) * CHART_HEIGHT,
                4,
              );

              return (
                <View key={item.day} style={{ alignItems: "center" }}>
                  {/* Tooltip with caret */}
                  {isHighlighted && (
                    <View style={{ alignItems: "center", marginBottom: 4 }}>
                      <View className="insights-chart-tooltip">
                        <Text className="insights-chart-tooltip-text">
                          {formatCurrency(item.amount)}
                        </Text>
                      </View>
                      {/* Caret triangle */}
                      <View
                        style={{
                          width: 0,
                          height: 0,
                          borderLeftWidth: 5,
                          borderRightWidth: 5,
                          borderTopWidth: 5,
                          borderLeftColor: "transparent",
                          borderRightColor: "transparent",
                          borderTopColor: colors.accent,
                        }}
                      />
                    </View>
                  )}

                  {/* Bar */}
                  <View
                    style={{
                      height: barHeight,
                      width: BAR_WIDTH,
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      backgroundColor: isHighlighted
                        ? colors.accent
                        : colors.primary,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Day labels */}
      <View
        style={{
          flexDirection: "row",
          marginLeft: Y_AXIS_WIDTH,
          marginTop: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {data.map((item) => (
            <Text
              key={item.day}
              className="insights-chart-day"
              style={{ width: BAR_WIDTH, textAlign: "center" }}
            >
              {item.day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default InsightsBarChart;
