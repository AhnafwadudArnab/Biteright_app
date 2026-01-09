import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import rawMealData from "./JSON files/mealData.json";

export default function DietPlannerItem() {
  const params = useLocalSearchParams();
  const mealData: any = rawMealData;

  const gender =
    typeof params.gender === "string" ? params.gender.toLowerCase() : "male";

  const rawBmi =
    typeof params.bmiCategory === "string"
      ? params.bmiCategory.toLowerCase()
      : "normal";

  // ✅ FORCE VALID BMI CATEGORY
  const bmiCategory = ["underweight", "normal", "overweight", "obese"].includes(
    rawBmi
  )
    ? rawBmi
    : "normal";

  const mealsPerDay =
    typeof params.meals === "string" ? Number(params.meals) : 4;

  // ✅ GET PLAN (SAFE)
  const plan =
    mealData?.meal_plans?.[gender]?.[bmiCategory] ??
    mealData.meal_plans.male.normal;

  // ✅ FLATTEN MEALS (CORRECT WAY)
  const mealGroups = plan.meals;

  const allMeals = [
    ...(mealGroups.breakfast ?? []).map((m: any) => ({
      ...m,
      type: "Breakfast",
    })),
    ...(mealGroups.lunch ?? []).map((m: any) => ({
      ...m,
      type: "Lunch",
    })),
    ...(mealGroups.snack ?? []).map((m: any) => ({
      ...m,
      type: "Snack",
    })),
    ...(mealGroups.dinner ?? []).map((m: any) => ({
      ...m,
      type: "Dinner",
    })),
  ];

  // ✅ RESPECT MEALS PER DAY
  const initialMeals = allMeals.slice(0, Number(mealsPerDay) || 4).map(m => ({ ...m, done: false }));

  const [meals, setMeals] = React.useState<any[]>(initialMeals);
  const [totalKcal, setTotalKcal] = React.useState<number>(
    initialMeals.length > 0
      ? initialMeals.reduce((sum, m) => sum + (m.kcal || 0), 0)
      : plan?.daily_calories || 0
  );

  // ✅ DATE
  const today = new Date();
  const dayLabel = today.toLocaleString("en-US", { weekday: "short" });
  const date = today.getDate();

  // ✅ NUTRITION SUMMARY (SAFE)
  const totalNutrition = meals.reduce(
    (acc: any, meal: any) => {
      acc.kcal += meal.kcal || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 20 }} />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/MainHomePage")}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Daily Diet Plan</Text>

        <TouchableOpacity
          style={styles.weekViewBtn}
          onPress={() => router.push("../Dietplans/weeklyPlans")}
        >
          <Ionicons name="calendar-outline" size={20} color="#38B36A" />
          <Text style={styles.weekViewText}>Week View</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{`Day: ${dayLabel}, Date: ${date}`}</Text>

      {/* Calories Card */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesLabel}>Total Daily Calories</Text>
        <Text style={styles.caloriesValue}>{totalKcal} kcal</Text>
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
            {meal.protein !== undefined && (
              <Text style={styles.nutritionText}>P {meal.protein}g</Text>
            )}
            {meal.carbs !== undefined && (
              <Text style={styles.nutritionText}>C {meal.carbs}g</Text>
            )}
            {meal.fat !== undefined && (
              <Text style={styles.nutritionText}>F {meal.fat}g</Text>
            )}
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
          <Text>BMI Category</Text>
          <Text style={{ textTransform: "capitalize" }}>
            {(() => {
              const weight = typeof params.weight === "string" ? parseFloat(params.weight) : undefined;
              const height = typeof params.height === "string" ? parseFloat(params.height) : undefined;
              if (weight && height && height > 0) {
                const bmi = weight / ((height / 100) * (height / 100));
                let category = "";
                if (bmi < 18.5) {
                  category = "Underweight";
                } else if (bmi >= 18.5 && bmi < 25) {
                  category = "Normal";
                } else if (bmi >= 25 && bmi < 30) {
                  category = "Overweight";
                } else {
                  category = "Obese";
                }
                return category;
              }
              return "N/A";
            })()}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>BMI Value</Text>
          <Text>
            {(() => {
              const weight = typeof params.weight === "string" ? parseFloat(params.weight) : undefined;
              const height = typeof params.height === "string" ? parseFloat(params.height) : undefined;
              if (weight && height && height > 0) {
                const bmi = weight / ((height / 100) * (height / 100));
                return bmi.toFixed(1);
              }
              return "N/A";
            })()}
          </Text>
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
    fontSize: 22,
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
