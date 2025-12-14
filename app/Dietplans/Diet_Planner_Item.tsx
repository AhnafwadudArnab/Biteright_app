import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

// Default meals template
const defaultMeals = [
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
];

export default function DietPlannerItem() {
  const params = useLocalSearchParams();

  const calorieTarget =
    typeof params.calories === "string" ? params.calories : "1,520";

  const mealCount =
    typeof params.meals === "string" ? parseInt(params.meals, 10) : 4;

  const meals = defaultMeals.slice(0, mealCount);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.push("./(tabs)/MainHomePage")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Your Diet Plan</Text>

        <TouchableOpacity
          style={styles.weekViewBtn}
          onPress={() => router.push("../Dietplans/weeklyPlans")}
        >
          <Ionicons name="calendar-outline" size={20} color="#38B36A" />
          <Text style={styles.weekViewText}>Week View</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <Text style={styles.dateText}>
        {new Date().toLocaleDateString()}
      </Text>

      {/* Week Days */}
      <View style={styles.weekRow}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
          const isToday = idx === new Date().getDay();
          return (
            <View
              key={day}
              style={[styles.dayChip, isToday && styles.todayChip]}
            >
              <Text style={[styles.dayText, isToday && styles.todayText]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Calories */}
      <View style={styles.caloriesCard}>
        <Text style={styles.caloriesLabel}>Total Daily Calories</Text>
        <View style={styles.caloriesRow}>
          <Text style={styles.caloriesValue}>{calorieTarget} kcal</Text>
          <TouchableOpacity>
            <Ionicons name="refresh" size={22} color="#38B36A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meals */}
      {meals.map((meal, idx) => (
        <View key={idx} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <TouchableOpacity>
              <Text style={styles.swapText}>Swap</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.mealName}>{meal.name}</Text>

          <View style={styles.nutritionRow}>
            <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
            <Text style={styles.nutritionText}>P: {meal.protein}g</Text>
            <Text style={styles.nutritionText}>C: {meal.carbs}g</Text>
            <Text style={styles.nutritionText}>F: {meal.fat}g</Text>
          </View>
        </View>
      ))}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.regenerateBtn}
          onPress={() => router.push("../Dietplans/gen_dietplans")}
        >
          <Text style={styles.regenerateBtnText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  weekViewBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  weekViewText: {
    color: "#38B36A",
    marginLeft: 4,
    fontSize: 15,
  },
  dateText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
  },
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
  todayChip: {
    backgroundColor: "#38B36A",
  },
  dayText: {
    color: "#38B36A",
    fontWeight: "bold",
  },
  todayText: {
    color: "#fff",
  },
  caloriesCard: {
    backgroundColor: "#e6f7ee",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  caloriesLabel: {
    color: "#38B36A",
    fontSize: 14,
    marginBottom: 6,
  },
  caloriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
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
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 6,
  },
  nutritionRow: {
    flexDirection: "row",
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "bold",
    marginRight: 12,
  },
  nutritionText: {
    color: "#888",
    marginRight: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  editBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    alignItems: "center",
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },
  editBtnText: {
    fontWeight: "bold",
  },
  regenerateBtn: {
    flex: 1,
    backgroundColor: "#38B36A",
    paddingVertical: 14,
    alignItems: "center",
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  regenerateBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
