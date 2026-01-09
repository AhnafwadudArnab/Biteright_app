import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const mealTemplates = [
  [
    {
      type: "Breakfast",
      name: "Oatmeal with berries",
      kcal: 350,
      protein: 12,
      carbs: 58,
      fat: 8,
    },
    {
      type: "Lunch",
      name: "Grilled chicken salad",
      kcal: 420,
      protein: 35,
      carbs: 25,
      fat: 18,
    },
    {
      type: "Snack",
      name: "Greek yogurt & almonds",
      kcal: 200,
      protein: 15,
      carbs: 12,
      fat: 10,
    },
    {
      type: "Dinner",
      name: "Salmon with quinoa",
      kcal: 550,
      protein: 40,
      carbs: 45,
      fat: 22,
    },
  ],
  [
    {
      type: "Breakfast",
      name: "Egg white omelette",
      kcal: 300,
      protein: 18,
      carbs: 4,
      fat: 10,
    },
    {
      type: "Lunch",
      name: "Turkey sandwich",
      kcal: 410,
      protein: 28,
      carbs: 40,
      fat: 12,
    },
    {
      type: "Snack",
      name: "Fruit salad",
      kcal: 180,
      protein: 3,
      carbs: 42,
      fat: 1,
    },
    {
      type: "Dinner",
      name: "Grilled shrimp & rice",
      kcal: 520,
      protein: 35,
      carbs: 60,
      fat: 9,
    },
  ],
  [
    {
      type: "Breakfast",
      name: "Avocado toast",
      kcal: 320,
      protein: 8,
      carbs: 36,
      fat: 14,
    },
    {
      type: "Lunch",
      name: "Quinoa bowl",
      kcal: 430,
      protein: 16,
      carbs: 60,
      fat: 12,
    },
    {
      type: "Snack",
      name: "Protein bar",
      kcal: 210,
      protein: 20,
      carbs: 23,
      fat: 7,
    },
    {
      type: "Dinner",
      name: "Chicken stir fry",
      kcal: 540,
      protein: 38,
      carbs: 48,
      fat: 16,
    },
  ],
];

function getRandomMeals() {
  const template =
    mealTemplates[Math.floor(Math.random() * mealTemplates.length)];
  return template.map((meal) => ({
    ...meal,
    kcal: meal.kcal + Math.floor(Math.random() * 50),
  }));
}

const weekDays = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const label = d.toLocaleString("en-US", { weekday: "short" });
  const meals = getRandomMeals();
  const totalKcal = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  return {
    label,
    date: d.getDate(),
    meals,
    totalKcal,
  };
});

export default function DietPlannerItem() {
  const params = useLocalSearchParams();
  const calorieTarget =
    typeof params.calories === "string" ? params.calories : "1520";
  const mealCount =
    typeof params.meals === "string" ? parseInt(params.meals, 10) : 4;
  const [selectedDay, setSelectedDay] = useState(0);

  const meals = weekDays[selectedDay].meals;
  const totalNutrition = meals.reduce(
    (acc, meal) => {
      acc.kcal += meal.kcal;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={{ height: 20 }} />
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/MainHomePage");
          }}
        >
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
      <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      {/* Week Days */}
      <View style={styles.weekRow}>
        {weekDays.map((day, idx) => {
          const isToday = idx === selectedDay;
          return (
            <TouchableOpacity
              key={day.label}
              style={[styles.dayChip, isToday && styles.todayChip]}
              onPress={() => setSelectedDay(idx)}
            >
              <Text style={[styles.dayText, isToday && styles.todayText]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Calories Card */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesLabel}>Total Daily Calories</Text>
        <Text style={styles.caloriesValue}>
          {weekDays[selectedDay].totalKcal} kcal
        </Text>
      </View>
      {/* Meals */}
      {meals.map((meal, idx) => (
        <View key={idx} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <TouchableOpacity>
              <Text style={styles.swapText}>Swap meal</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
            <Text style={styles.nutritionText}>P {meal.protein}g</Text>
            <Text style={styles.nutritionText}>C {meal.carbs}g</Text>
            <Text style={styles.nutritionText}>F {meal.fat}g</Text>
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
          <Text>Protein</Text>
          <Text>{totalNutrition.protein} g</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Carbs</Text>
          <Text>{totalNutrition.carbs} g</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Fat</Text>
          <Text>{totalNutrition.fat} g</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  caloriesLabel: {
    color: "#38B36A",
    fontSize: 14,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  mealCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 24,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealType: {
    color: "#888",
    fontSize: 13,
  },
  swapText: {
    color: "#38B36A",
    fontWeight: "bold",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 6,
  },
  nutritionRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "bold",
    marginRight: 12,
  },
  nutritionText: {
    color: "#666",
    marginRight: 10,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 20,
    padding: 18,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  buttonRow: {
    marginTop: 24,
  },
  regenerateBtn: {
    backgroundColor: "#38B36A",
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  regenerateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  weekViewBtn: { flexDirection: "row", alignItems: "center" },
  weekViewText: { color: "#38B36A", marginLeft: 4, fontSize: 17 },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#e6f7ee",
  },
  todayChip: { backgroundColor: "#38B36A" },
  dayText: { color: "#38B36A", fontWeight: "bold" },
  todayText: { color: "#fff" },
});
