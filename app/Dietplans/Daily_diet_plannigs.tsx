import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchMealPlan } from "./api.native";

type Meal = {
  type: string;
  name: string;
  kcal: number;
};

type BmiPlan = {
  category: string;
  dailyCalories: number;
  doctorFocus: string[];
  meals: Meal[];
};

type Gender = "male" | "female";

type BmiMealPlans = {
  [gender in Gender]: {
    [range: string]: BmiPlan;
  };
};

// No longer needed: getBmiRangeKey

export default function DietPlannerItem() {
  const params = useLocalSearchParams();
  const gender =
    typeof params.gender === "string" &&
    params.gender.toLowerCase() === "female"
      ? "female"
      : "male";
  const weight =
    typeof params.weight === "string" ? parseFloat(params.weight) : undefined;
  const height =
    typeof params.height === "string" ? parseFloat(params.height) : undefined;
  const bmi = typeof params.bmi === "string" ? parseFloat(params.bmi) : (weight && height && height > 0 ? weight / ((height / 100) * (height / 100)) : 0);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [totalKcal, setTotalKcal] = useState<number>(0);

  useEffect(() => {
    console.log('Params:', params);
    console.log('gender:', gender, 'weight:', weight, 'height:', height, 'bmi:', bmi);
    setLoading(true);
    fetchMealPlan(gender, Number(bmi))
      .then((data) => {
        setPlan(data);
        const mealsPerDay =
          typeof params.meals === "string"
            ? Number(params.meals)
            : data.meals.length;
        const initialMeals = data.meals
          .slice(0, mealsPerDay)
          .map((m: any) => ({ ...m, done: false }));
        setMeals(initialMeals);
        setTotalKcal(
          initialMeals.reduce(
            (sum: any, m: { kcal: any }) => sum + (m.kcal || 0),
            0
          )
        );
      })
      .catch((err) => {
        setPlan({
          _debug: {
            gender,
            bmi: bmi.toFixed(1),
            error: err?.message || err,
          },
        });
      })
      .finally(() => setLoading(false));
  }, [gender, bmi, params.meals]);

  // Calories for completed meals
  const completedKcal = meals.reduce(
    (acc, meal) => acc + (meal.done ? meal.kcal || 0 : 0),
    0
  );

  // Date
  const today = new Date();
  const dayLabel = today.toLocaleString("en-US", { weekday: "short" });
  const date = today.getDate();

  // Nutrition summary
  const totalNutrition = meals.reduce(
    (acc: any, meal: any) => {
      if (!meal.done) acc.kcal += meal.kcal || 0;
      return acc;
    },
    { kcal: 0 }
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (!plan || (plan && plan._debug)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontWeight: "bold" }}>No plan found.</Text>
        {plan && plan._debug && (
          <Text style={{ color: "#555", marginTop: 8, fontSize: 13 }}>
            Gender: {plan._debug.gender}, BMI: {plan._debug.bmi}
            {plan._debug.error ? `\nError: ${plan._debug.error}` : ""}
          </Text>
        )}
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 20 }} />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("../MainHomePage")}> 
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Daily Diet Plan</Text>

        <TouchableOpacity
          style={styles.weekViewBtn}
          onPress={() => router.push("../Dietplans/weeklyPlans")}
        >
          <Ionicons name="calendar-outline" size={20} color="#38B36A" />
          <Text style={styles.weekViewText}></Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{`Day: ${dayLabel}, Date: ${date}`}</Text>

      {/* Calories Card */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesLabel}>Total Daily Calories</Text>
        <Text style={styles.caloriesValue}>{plan.dailyCalories} kcal</Text>
        <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
          {plan.category}
        </Text>
        <Text style={{ color: "#38B36A", fontSize: 13, marginTop: 2 }}>
          Focus: {plan.doctorFocus.join(", ")}
        </Text>
        {/* ✅ Completed kcal box */}
        <View
          style={{
            position: "absolute",
            top: 40,
            right: 16,
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 8,
            minWidth: 120,
            minHeight: 60,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#38B36A",
          }}
        >
          <Text
            style={{
              color: "#38B36A",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            {completedKcal} kcal
          </Text>
          <Text style={{ color: "#888", fontSize: 11 }}>Completed</Text>
        </View>
      </View>

      {/* Meals */}
      {meals.map((meal: any, idx: number) => (
        <View key={idx} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <TouchableOpacity
              onPress={() => {
                const updatedMeals = meals.map((m, i) =>
                  i === idx ? { ...m, done: !m.done } : m
                );
                setMeals(updatedMeals);
                setTotalKcal(
                  updatedMeals.reduce(
                    (sum, m) => sum + (m.done ? 0 : m.kcal || 0),
                    0
                  )
                );
              }}
            >
              {meal.done ? (
                <Ionicons name="checkmark-circle" size={22} color="#38B36A" />
              ) : (
                <Ionicons name="close-circle-outline" size={22} color="#ccc" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.mealName}>{meal.name}</Text>

          <View style={styles.nutritionRow}>
            <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
          </View>
        </View>
      ))}

      {/* Nutrition Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Nutrition Summary</Text>

        <View style={styles.summaryRow}>
          <Text>Total Calories</Text>
          <Text>{totalNutrition.kcal} kcal</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>BMI Value</Text>
          <Text>
            {weight && height && height > 0
              ? (weight / ((height / 100) * (height / 100))).toFixed(1)
              : "N/A"}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>BMI Category</Text>
          <Text>{plan.category}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => router.push("../Dietplans/newPlan")}
          style={styles.regenerateBtn}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.regenerateBtnText}> Regenerate Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ✅ STYLES (UNCHANGED) */
const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#f7f7f7",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
    color: "#222",
    textAlign: "center",
  },
  dateText: {
    color: "#666",
    marginBottom: 16,
  },
  caloriesCard: {
    backgroundColor: "#e6f7ee",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  caloriesLabel: { color: "#38B36A", fontSize: 14 },
  caloriesValue: { fontSize: 28, fontWeight: "bold" },
  mealCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  mealHeader: { flexDirection: "row", justifyContent: "space-between" },
  mealType: { color: "#888", fontSize: 13 },
  swapText: { color: "#38B36A", fontWeight: "bold" },
  mealName: { fontSize: 16, fontWeight: "bold", marginVertical: 6 },
  nutritionRow: { flexDirection: "row", marginTop: 4 },
  kcalText: { color: "#38B36A", fontWeight: "bold", marginRight: 12 },
  nutritionText: { color: "#666", marginRight: 10 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 10,
  },
  summaryTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  buttonRow: { marginTop: 24 },
  regenerateBtn: {
    backgroundColor: "#38B36A",
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  regenerateBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  weekViewBtn: { flexDirection: "row", alignItems: "center" },
  weekViewText: { color: "#38B36A", marginLeft: 4, fontSize: 17 },
});
