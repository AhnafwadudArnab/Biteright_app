import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../AuthContext";
import { SERVER_URL } from "../serverhost";

const DAILY_GOAL = 2000;

export type Meal = {
  id: string;
  type: string;
  name: string;
  time: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

// BMI JSON path (adjust if needed)
const BMI_JSON = require("../Dietplans/JSON files/DoctorSugg_bmi_mealplans.json");

// Helper: get default meals for a user (mock: male, 22-22.9)
function getDefaultMeals(gender = "male", bmiRange = "22-22.9") {
  const plan = BMI_JSON?.bmiMealPlans?.[gender]?.[bmiRange]?.meals || [];
  // Add id, time, and macros as 0 (can be edited by user)
  return plan.map((m: any, idx: number) => ({
    id: `${gender}-${bmiRange}-${idx}`,
    type: m.type,
    name: m.name,
    time: "", // let user edit
    kcal: m.kcal,
    protein: 0,
    carbs: 0,
    fat: 0,
  }));
}

// Animated meal card component
function AnimatedMealCard({
  meal,
  index,
}: {
  meal: Meal;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mealCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeBadge}>
          <Text style={styles.mealTypeBadgeText}>{meal.type}</Text>
        </View>
        {meal.time ? (
          <View style={styles.mealTimePill}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.mealTimePillText}>{meal.time}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.mealName}>{meal.name}</Text>

      <View style={styles.divider} />

      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.kcalText}>{meal.kcal}</Text>
          <Text style={styles.nutritionLabel}>kcal</Text>
        </View>
        <View style={styles.nutritionDivider} />
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.protein}g</Text>
          <Text style={styles.nutritionLabel}>Protein</Text>
        </View>
        <View style={styles.nutritionDivider} />
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
          <Text style={styles.nutritionLabel}>Carbs</Text>
        </View>
        <View style={styles.nutritionDivider} />
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{meal.fat}g</Text>
          <Text style={styles.nutritionLabel}>Fat</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Animated progress bar component
function AnimatedProgressBar({ percent }: { percent: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 900,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressBg}>
      <Animated.View
        style={[styles.progressFill, { width: widthInterpolated }]}
      />
    </View>
  );
}

export default function GenMeals() {
  const { user, token } = useAuth();
  const API_BASE = `${SERVER_URL}/api`;
  const [meals, setMeals] = React.useState<Meal[]>([]);
  // Removed editing and modal state for read-only view
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  // BMI selection state
  const [selectedGender, setSelectedGender] = React.useState<"male" | "female">(
    "male",
  );
  const [selectedBmi, setSelectedBmi] = React.useState<string>("22-22.9");

  // Animation refs
  const headerSlide = useRef(new Animated.Value(-40)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  // Get all BMI ranges for gender
  const bmiRanges = Object.keys(BMI_JSON.bmiMealPlans[selectedGender]);

  // Mount animations
  useEffect(() => {
    // Header slides down + fades in
    Animated.parallel([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Calories card springs in
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch meals from backend, or load default from BMI JSON if none
  const fetchMeals = async () => {
    setLoading(true);
    try {
      const userId = user?.id;
      if (userId) {
        const res = await fetch(`${API_BASE}/meals/${userId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        let data: Meal[] = [];
        if (res.ok) data = await res.json();
        if (data && data.length > 0) {
          setMeals(data);
          setLoading(false);
          setInitialized(true);
          return;
        }
      }
      // Fallback to BMI JSON
      setMeals(getDefaultMeals(selectedGender, selectedBmi));
    } catch {
      setMeals(getDefaultMeals(selectedGender, selectedBmi));
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (!initialized) fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // When BMI/gender changes, regenerate meals from JSON
  const handleBmiChange = (gender: "male" | "female", bmi: string) => {
    setSelectedGender(gender);
    setSelectedBmi(bmi);
    setMeals(getDefaultMeals(gender, bmi));
  };

  // Removed handleSaveMeal for read-only view
  // Removed handleDelete for read-only view
  // Removed handleEdit and handleAddMeal for read-only view

  const totalKcal = meals.reduce((s, m) => s + (m.kcal || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const progressPercent = Math.min((totalKcal / DAILY_GOAL) * 100, 100);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerRow,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/MainHomePage")}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>View Log</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Spacer to balance back button */}
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* BMI / Gender Filter Section */}
      <Animated.View
        style={[
          styles.filterSection,
          { opacity: headerFade },
        ]}
      >
        <Text style={styles.filterLabel}>Gender</Text>
        <View style={styles.pillRow}>
          <TouchableOpacity
            style={[
              styles.pill,
              selectedGender === "male" && styles.pillActive,
            ]}
            onPress={() => handleBmiChange("male", bmiRanges[0])}
            activeOpacity={0.8}
          >
            <Ionicons
              name="male"
              size={14}
              color={selectedGender === "male" ? "#fff" : "#6B7280"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.pillText,
                selectedGender === "male" && styles.pillTextActive,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pill,
              selectedGender === "female" && styles.pillActive,
            ]}
            onPress={() =>
              handleBmiChange(
                "female",
                Object.keys(BMI_JSON.bmiMealPlans["female"])[0],
              )
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="female"
              size={14}
              color={selectedGender === "female" ? "#fff" : "#6B7280"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.pillText,
                selectedGender === "female" && styles.pillTextActive,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.filterLabel, { marginTop: 12 }]}>BMI Range</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bmiScroll}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {Object.keys(BMI_JSON.bmiMealPlans[selectedGender]).map((bmi) => (
            <TouchableOpacity
              key={bmi}
              style={[
                styles.pill,
                selectedBmi === bmi && styles.pillActive,
                { marginRight: 8 },
              ]}
              onPress={() => handleBmiChange(selectedGender, bmi)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedBmi === bmi && styles.pillTextActive,
                ]}
              >
                {bmi}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Animated Calories Card */}
      <Animated.View
        style={[
          styles.totalCard,
          {
            opacity: cardFade,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <View style={styles.totalCardTop}>
          <View>
            <Text style={styles.totalLabel}>Calories Consumed</Text>
            <Text
              style={[
                styles.totalKcal,
                { color: totalKcal > DAILY_GOAL ? "#FEE2E2" : "#FFFFFF" },
              ]}
            >
              {totalKcal}
              <Text style={styles.totalKcalGoal}> / {DAILY_GOAL} kcal</Text>
            </Text>
          </View>
          <View style={styles.calorieCircle}>
            <Text style={styles.calorieCircleText}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
        </View>

        <AnimatedProgressBar percent={progressPercent} />

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </Animated.View>

      {/* Section Title with meal count badge */}
      <View style={styles.mealHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {meals.length > 0 && (
          <View style={styles.mealCountBadge}>
            <Text style={styles.mealCountText}>{meals.length}</Text>
          </View>
        )}
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#38B36A"
          style={{ marginTop: 20 }}
        />
      )}

      {/* Empty State */}
      {!loading && meals.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No meals added today</Text>
          <Text style={styles.emptySubText}>
            Select a BMI range above to load meal suggestions
          </Text>
        </View>
      )}

      {/* Animated Meal Cards */}
      {!loading &&
        meals.map((meal, index) => (
          <AnimatedMealCard key={meal.id} meal={meal} index={index} />
        ))}

      {/* MealEditModal removed for read-only view */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAF9",
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  // Filter section
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  bmiScroll: {
    flexGrow: 0,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#38B36A",
    borderColor: "#38B36A",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },

  // Calories card
  totalCard: {
    backgroundColor: "#38B36A",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#38B36A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  totalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  totalKcal: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  totalKcalGoal: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
  },
  calorieCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  calorieCircleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  progressBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  macroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 2,
  },

  // Meals section
  mealHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  mealCountBadge: {
    marginLeft: 10,
    backgroundColor: "#38B36A",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  mealCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
    paddingHorizontal: 40,
  },

  // Meal cards
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTypeBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  mealTypeBadgeText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "600",
  },
  mealTimePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  mealTimePillText: {
    color: "#6B7280",
    fontSize: 12,
  },
  mealName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "700",
    fontSize: 16,
  },
  nutritionValue: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 15,
  },
  nutritionLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 2,
  },
  nutritionDivider: {
    width: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 2,
  },
});
