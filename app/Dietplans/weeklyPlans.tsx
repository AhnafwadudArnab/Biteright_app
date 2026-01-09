import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ===== DATA ===== */

// Example meal templates
const mealTemplates = [
  [
    { type: "Breakfast", name: "Oatmeal with berries", kcal: 350 },
    { type: "Lunch", name: "Grilled chicken salad", kcal: 420 },
    { type: "Snack", name: "Greek yogurt & almonds", kcal: 200 },
    { type: "Dinner", name: "Salmon with quinoa", kcal: 550 },
  ],
  [
    { type: "Breakfast", name: "Egg white omelette", kcal: 300 },
    { type: "Lunch", name: "Turkey sandwich", kcal: 410 },
    { type: "Snack", name: "Fruit salad", kcal: 180 },
    { type: "Dinner", name: "Grilled shrimp & rice", kcal: 520 },
  ],
  [
    { type: "Breakfast", name: "Avocado toast", kcal: 320 },
    { type: "Lunch", name: "Quinoa bowl", kcal: 430 },
    { type: "Snack", name: "Protein bar", kcal: 210 },
    { type: "Dinner", name: "Chicken stir fry", kcal: 540 },
  ],
  // Add more templates as needed
];

// Generate random meals for each day
function getRandomMeals() {
  const template =
    mealTemplates[Math.floor(Math.random() * mealTemplates.length)];
  // Optionally, randomize kcal a bit for demo
  return template.map((meal) => ({
    ...meal,
    kcal: meal.kcal + Math.floor(Math.random() * 50), // add up to 50 kcal randomly
  }));
}

const today = new Date();
const weekDays = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
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

/* ===== COMPONENT ===== */

export default function WeeklyPlans() {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleSwap = (mealType: string) => {
    Alert.alert("Swap Meal", `Swap action for ${mealType}`);
  };

  const weeklyCalories = weekDays.reduce((sum, day) => sum + day.totalKcal, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/MainHomePage");
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Weekly Diet Plan</Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "../Dietplans/Daily_diet_plannigs",
              params: {
                day: weekDays[selectedDay].label,
                date: weekDays[selectedDay].date,
                meals: JSON.stringify(weekDays[selectedDay].meals),
                totalKcal: weekDays[selectedDay].totalKcal.toString(),
              },
            })
          }
        >
          <Text style={styles.dayViewText}>Day View</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic date range */}
      <Text style={styles.dateRange}>
        {`${new Date().toLocaleString("en-US", {
          month: "short",
        })} ${new Date().getDate()} - ${new Date(
          new Date().setDate(new Date().getDate() + 6)
        ).toLocaleString("en-US", { month: "short" })} ${new Date(
          new Date().setDate(new Date().getDate() + 6)
        ).getDate()}`}
      </Text>

      {/* ===== 7 DAYS OVERVIEW ===== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
      >
        {weekDays.map((day, idx) => (
          <TouchableOpacity
            key={day.label}
            style={[
              styles.dayCard,
              selectedDay === idx && styles.dayCardActive,
            ]}
            onPress={() => setSelectedDay(idx)}
          >
            <Text
              style={[
                styles.dayLabel,
                selectedDay === idx && styles.dayActiveText,
              ]}
            >
              {day.label}
            </Text>
            <Text
              style={[
                styles.dayDate,
                selectedDay === idx && styles.dayActiveText,
              ]}
            >
              {day.date}
            </Text>
            <Text
              style={[
                styles.dayCalories,
                selectedDay === idx && styles.dayActiveText,
              ]}
            >
              {day.totalKcal} kcal
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* ===== WEEKLY CALORIES ===== */}
      <View style={styles.weeklyCard}>
        <Text style={styles.weeklyLabel}>Total Weekly Calories</Text>
        <Text style={styles.weeklyValue}>{weeklyCalories} kcal</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* ===== DAILY MEALS (SELECTED DAY) ===== */}
      {weekDays[selectedDay].meals.map((meal, idx) => (
        <View key={idx} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <TouchableOpacity onPress={() => handleSwap(meal.type)}>
              <Ionicons name="swap-horizontal" size={20} color="#38B36A" />
            </TouchableOpacity>
          </View>

          <View style={styles.mealRow}>
            <View>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#bbb" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 50,
    paddingBottom: 30,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginLeft: 12,
  },
  dayViewText: {
    color: "#38B36A",
    fontSize: 15,
    fontWeight: "500",
  },
  dateRange: {
    fontSize: 15,
    color: "#666",
    marginLeft: 28,
    marginBottom: 12,
  },

  weekScroll: {
    paddingLeft: 20,
    marginBottom: 1,
  },
  dayCard: {
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    padding: 12,
    marginRight: 10,
    alignItems: "center",
    width: 100,
    height: 100,
  },
  dayCardActive: {
    backgroundColor: "#38B36A",
  },
  dayLabel: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#222",
  },
  dayDate: {
    fontSize: 13,
    color: "#666",
    marginVertical: 2,
  },
  dayCalories: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#222",
  },
  dayActiveText: {
    color: "#fff",
  },

  weeklyCard: {
    backgroundColor: "#e6f7ee",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 14,
    alignItems: "center",
  },
  weeklyLabel: {
    color: "#38B36A",
    fontSize: 14,
    marginBottom: 4,
  },
  weeklyValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },

  divider: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginVertical: 12,
    marginHorizontal: 24,
  },

  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 24,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealType: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "bold",
    fontSize: 15,
  },
});
