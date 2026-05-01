import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Data (unchanged) ────────────────────────────────────────────────────────

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

// ─── Nutrient config ─────────────────────────────────────────────────────────

const NUTRIENTS = [
  { key: "calories", label: "Calories (kcal)", color: "#22C55E" },
  { key: "protein",  label: "Protein (g)",     color: "#3B82F6" },
  { key: "carbs",    label: "Carbs (g)",        color: "#F97316" },
  { key: "fat",      label: "Fat (g)",          color: "#A855F7" },
] as const;

// ─── Animated Progress Bar ───────────────────────────────────────────────────

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
}

const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max,
  color,
  delay,
}) => {
  const percent = Math.min((value / max) * 100, 100);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {value} / {max}
        </Text>
      </View>
      <View style={styles.progressBg}>
        <Animated.View
          style={[
            styles.progressFill,
            { width: animatedWidth, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

// ─── Animated Weight Row ─────────────────────────────────────────────────────

interface WeightRowProps {
  day: string;
  weight: number;
  delay: number;
  maxWeight: number;
  minWeight: number;
}

const AnimatedWeightRow: React.FC<WeightRowProps> = ({
  day,
  weight,
  delay,
  maxWeight,
  minWeight,
}) => {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Bar chart: normalise weight within the week's range
  const range = maxWeight - minWeight || 1;
  const barPercent = ((weight - minWeight) / range) * 60 + 20; // 20–80% visual range

  return (
    <Animated.View
      style={[
        styles.weekRow,
        { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={styles.weekDay}>{day}</Text>

      {/* Mini bar chart */}
      <View style={styles.barChartTrack}>
        <View style={[styles.barChartFill, { width: `${barPercent}%` }]} />
      </View>

      <Text style={styles.weekWeight}>{weight} kg</Text>
    </Animated.View>
  );
};

// ─── Section Title ────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; accentColor?: string }> = ({
  title,
  accentColor = "#22C55E",
}) => (
  <View style={styles.sectionTitleRow}>
    <View style={[styles.sectionAccentBar, { backgroundColor: accentColor }]} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const bmi = 22.4;
  const bmiStatus = "Normal";

  // Header animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;

  // Summary card spring
  const summaryScale = useRef(new Animated.Value(0.85)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;

  // Doctor advice fade
  const adviceOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Header fades + slides down
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Summary card springs in
    Animated.parallel([
      Animated.spring(summaryScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(summaryOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Doctor advice fades in last (after bars + rows finish)
    Animated.timing(adviceOpacity, {
      toValue: 1,
      duration: 600,
      delay: 1600,
      useNativeDriver: true,
    }).start();
  }, []);

  const maxWeight = Math.max(...weeklyWeight.map((w) => w.weight));
  const minWeight = Math.min(...weeklyWeight.map((w) => w.weight));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <View style={styles.backButtonWrapper}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("../MainHomePage")}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <Text style={styles.title}>Your Progress</Text>
      </Animated.View>

      {/* Summary Card */}
      <Animated.View
        style={[
          styles.summaryCard,
          {
            opacity: summaryOpacity,
            transform: [{ scale: summaryScale }],
          },
        ]}
      >
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Current Weight</Text>
          <Text style={styles.summaryValue}>71.4 kg</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>BMI</Text>
          <Text style={styles.summaryValue}>
            {bmi}{" "}
            <Text style={styles.summaryBadge}>({bmiStatus})</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Daily Nutrition */}
      <SectionTitle title="Today's Nutrition" accentColor="#22C55E" />

      <View style={styles.card}>
        {NUTRIENTS.map((nutrient, index) => (
          <AnimatedProgressBar
            key={nutrient.key}
            label={nutrient.label}
            value={TODAY_PROGRESS[nutrient.key]}
            max={DAILY_GOAL[nutrient.key]}
            color={nutrient.color}
            delay={500 + index * 150}
          />
        ))}
      </View>

      {/* Weekly Weight Trend */}
      <SectionTitle title="Weekly Weight Trend" accentColor="#3B82F6" />

      <View style={styles.card}>
        {weeklyWeight.map((item, index) => (
          <AnimatedWeightRow
            key={item.day}
            day={item.day}
            weight={item.weight}
            delay={500 + index * 150}
            maxWeight={maxWeight}
            minWeight={minWeight}
          />
        ))}
      </View>

      {/* Doctor Recommendation */}
      <SectionTitle title="Doctor's Recommendation" accentColor="#A855F7" />

      <Animated.View style={[styles.adviceCard, { opacity: adviceOpacity }]}>
        <View style={styles.adviceRow}>
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text style={styles.adviceText}>
            Your BMI is within the normal range.
          </Text>
        </View>
        <View style={styles.adviceRow}>
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text style={styles.adviceText}>
            Maintain calorie balance and protein intake.
          </Text>
        </View>
        <View style={styles.adviceRow}>
          <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
          <Text style={styles.adviceText}>
            Continue light exercise and hydration.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Back button
  backButtonWrapper: {
    marginTop: 52,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Header
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Summary card
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryBadge: {
    fontSize: 14,
    fontWeight: "500",
    color: "#22C55E",
  },

  // Section title
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  // Generic white card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  // Progress bars
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  progressValue: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  progressBg: {
    height: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  // Weekly weight rows
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weekDay: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    width: 36,
  },
  barChartTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  barChartFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 5,
  },
  weekWeight: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    width: 56,
    textAlign: "right",
  },

  // Doctor advice
  adviceCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 18,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  adviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#166534",
    fontWeight: "500",
  },
});
