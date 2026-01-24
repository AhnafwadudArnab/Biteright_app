import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

/* -------------------- MOCK / CONSTANTS -------------------- */

const API_BASE = "http://YOUR_API_URL";
const USER_ID = "1";
const DAILY_GOAL = 2200;

import bmiJsonRaw from "../Dietplans/JSON files/DoctorSugg_bmi_mealplans.json";
const BMI_JSON = bmiJsonRaw;

type Meal = {
  id: string;
  type: string;
  name: string;
  time: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

/* -------------------- HELPERS -------------------- */

const getDefaultMeals = (gender: "male" | "female", bmi: string): Meal[] => {
  const plan =
    BMI_JSON.bmiMealPlans?.[gender]?.[bmi] ||
    Object.values(BMI_JSON.bmiMealPlans?.[gender] || {})[0];
  if (!plan || !plan.meals) return [];
  // Map JSON meals to Meal type, add id, and fill missing macros as 0
  return plan.meals.map((m: any, idx: number) => ({
    id: `${gender}-${bmi}-${m.type?.toLowerCase() || idx}`,
    type: m.type || "Meal",
    name: m.name || "Meal",
    time: "",
    kcal: m.kcal || 0,
    protein: m.protein || 0,
    carbs: m.carbs || 0,
    fat: m.fat || 0,
  }));
};

/* -------------------- COMPONENT -------------------- */

export default function DailyMealLog() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"male" | "female">(
    "male",
  );
  const [selectedBmi, setSelectedBmi] = useState(
    Object.keys(BMI_JSON.bmiMealPlans.male)[0],
  );

  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showBmiBox, setShowBmiBox] = useState(true);

  // Always load meals from JSON for BMI/gender selection
  useEffect(() => {
    setMeals(getDefaultMeals(selectedGender, selectedBmi));
  }, [selectedGender, selectedBmi]);

  /* -------------------- HANDLERS -------------------- */

  const handleBmiChange = (gender: "male" | "female", bmi: string) => {
    setSelectedGender(gender);
    setSelectedBmi(bmi);
  };

  const handleDelete = async (meal: Meal) => {
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
  };

  /* -------------------- TOTALS -------------------- */

  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  const progressPercent = Math.min((totalKcal / DAILY_GOAL) * 100, 100);

  /* -------------------- RENDER -------------------- */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#222"
          onPress={() => router.push("/(tabs)/MainHomePage")}
        />
        <Text style={styles.headerTitle}>Daily Meal Log</Text>
        <Text style={styles.weeklyText}>Weekly</Text>
      </View>

      {/* BMI BOX */}
      {showBmiBox && (
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <View style={styles.bmiCard}>
            {/* Gender */}
            <View style={styles.row}>
              <Text style={styles.label}>Gender:</Text>
              {(["male", "female"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.bmiBtn,
                    selectedGender === g && styles.bmiBtnActive,
                  ]}
                  onPress={() =>
                    handleBmiChange(g, Object.keys(BMI_JSON.bmiMealPlans[g])[0])
                  }
                >
                  <Text
                    style={[
                      styles.bmiText,
                      selectedGender === g && styles.bmiTextActive,
                    ]}
                  >
                    {g.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* BMI */}
            <View style={styles.rowWrap}>
              <Text style={styles.label}>BMI:</Text>
              {Object.keys(BMI_JSON.bmiMealPlans[selectedGender]).map((bmi) => (
                <TouchableOpacity
                  key={bmi}
                  style={[
                    styles.bmiBtnSmall,
                    selectedBmi === bmi && styles.bmiBtnActive,
                  ]}
                  onPress={() => handleBmiChange(selectedGender, bmi)}
                >
                  <Text
                    style={[
                      styles.bmiText,
                      selectedBmi === bmi && styles.bmiTextActive,
                    ]}
                  >
                    {bmi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <Text style={styles.dateText}>Today, {new Date().toDateString()}</Text>

      {/* TOTAL CARD */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Calories Consumed</Text>
        <Text style={styles.totalKcal}>
          {totalKcal} / {DAILY_GOAL} kcal
        </Text>

        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        <Text style={styles.totalMacros}>
          P {totalProtein}g • C {totalCarbs}g • F {totalFat}g
        </Text>
      </View>

      {/* MEALS */}
      {loading && <ActivityIndicator size="large" color="#38B36A" />}

      {!loading &&
        meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealType}>{meal.type}</Text>
              <TouchableOpacity onPress={() => handleDelete(meal)}>
                <Ionicons name="trash-outline" size={20} color="#E57373" />
              </TouchableOpacity>
            </View>

            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>

            <View style={styles.nutritionRow}>
              <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
              <Text>P {meal.protein}g</Text>
              <Text>C {meal.carbs}g</Text>
              <Text>F {meal.fat}g</Text>
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#F4F6F8" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: "700", marginLeft: 12 },
  weeklyText: { color: "#38B36A", fontWeight: "600" },

  dateText: { marginLeft: 20, color: "#6B7280", marginBottom: 12 },

  bmiCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  label: { fontWeight: "700", marginRight: 8 },

  bmiBtn: {
    borderWidth: 1.5,
    borderColor: "#38B36A",
    padding: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  bmiBtnSmall: {
    borderWidth: 1.5,
    borderColor: "#38B36A",
    padding: 8,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  bmiBtnActive: { backgroundColor: "#38B36A" },
  bmiText: { color: "#38B36A", fontWeight: "700" },
  bmiTextActive: { color: "#fff" },

  totalCard: {
    backgroundColor: "#38B36A",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: { color: "#E8F5EC" },
  totalKcal: { fontSize: 28, fontWeight: "800", color: "#fff" },
  progressBg: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    marginVertical: 10,
  },
  progressFill: { height: "100%", backgroundColor: "#fff" },
  totalMacros: { color: "#F0FFF5" },

  mealCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  mealHeader: { flexDirection: "row", justifyContent: "space-between" },
  mealType: { fontWeight: "700" },
  mealName: { fontWeight: "600", marginTop: 4 },
  mealTime: { color: "#9CA3AF", fontSize: 13 },
  nutritionRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  kcalText: { color: "#38B36A", fontWeight: "700" },
});
