import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DAILY_GOAL = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 70,
};

const TODAY_PROGRESS = {
  calories: 1450,
  protein: 95,
  carbs: 180,
  fat: 48,
};

const weeklyWeight = [
  { day: "Mon", weight: 72.5 },
  { day: "Tue", weight: 72.2 },
  { day: "Wed", weight: 71.9 },
  { day: "Thu", weight: 71.6 },
  { day: "Fri", weight: 71.4 },
];

const ProgressBar = ({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) => {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {value} / {max}
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

export default function ProgressScreen() {
  const navigation = useNavigation();
  const bmi = 22.4;
  const bmiStatus = "Normal";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <View style={{ marginTop: 20, marginBottom: 4 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("../MainHomePage")}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Header */}
      <Text style={styles.title}>Your Progress</Text>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Current Weight</Text>
          <Text style={styles.summaryValue}>71.4 kg</Text>
        </View>

        <View>
          <Text style={styles.summaryLabel}>BMI</Text>
          <Text style={styles.summaryValue}>
            {bmi} ({bmiStatus})
          </Text>
        </View>
      </View>

      {/* Daily Nutrition Progress */}
      <Text style={styles.sectionTitle}>Today’s Nutrition</Text>

      <ProgressBar
        label="Calories (kcal)"
        value={TODAY_PROGRESS.calories}
        max={DAILY_GOAL.calories}
      />
      <ProgressBar
        label="Protein (g)"
        value={TODAY_PROGRESS.protein}
        max={DAILY_GOAL.protein}
      />
      <ProgressBar
        label="Carbs (g)"
        value={TODAY_PROGRESS.carbs}
        max={DAILY_GOAL.carbs}
      />
      <ProgressBar
        label="Fat (g)"
        value={TODAY_PROGRESS.fat}
        max={DAILY_GOAL.fat}
      />

      {/* Weekly Weight */}
      <Text style={styles.sectionTitle}>Weekly Weight Trend</Text>

      <View style={styles.weekCard}>
        {weeklyWeight.map((item) => (
          <View key={item.day} style={styles.weekRow}>
            <Text style={styles.weekDay}>{item.day}</Text>
            <Text style={styles.weekWeight}>{item.weight} kg</Text>
          </View>
        ))}
      </View>

      {/* Doctor Recommendation */}
      <Text style={styles.sectionTitle}>Doctor’s Recommendation</Text>
      <View style={styles.adviceCard}>
        <Text style={styles.adviceText}>
          ✔ Your BMI is within the normal range.
          {"\n"}✔ Maintain calorie balance and protein intake.
          {"\n"}✔ Continue light exercise and hydration.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },
  backButton: {
    marginTop: 25,
    marginBottom: 4,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  backButtonText: {
    marginTop: 3,
    fontSize: 16,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 3, // Add some top margin to push it down
    marginBottom: 15,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    color: "#64748B",
  },
  progressBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22C55E",
  },
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 14,
    color: "#334155",
  },
  weekWeight: {
    fontSize: 14,
    fontWeight: "600",
  },
  adviceCard: {
    backgroundColor: "#ECFEFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 40,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#065F46",
  },
});
