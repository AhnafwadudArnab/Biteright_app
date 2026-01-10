import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchMealPlan } from "./api.native";

/* ===== DATA ===== */

// No longer needed: getBmiRangeKey

// Shuffle array utility
function shuffleArray(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WeeklyPlans() {
  const params = useLocalSearchParams();
  const gender = typeof params.gender === "string" && params.gender.toLowerCase() === "female" ? "female" : "male";
  const weight = typeof params.weight === "string" ? parseFloat(params.weight) : 70;
  const height = typeof params.height === "string" ? parseFloat(params.height) : 170;
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  useEffect(() => {
    const bmi = weight && height && height > 0 ? weight / ((height / 100) * (height / 100)) : 0;
    setLoading(true);
    fetchMealPlan(gender, Number(bmi.toFixed(1)))
      .then(setPlan)
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));
  }, [gender, weight, height]);

  // Prepare 7 days using the same plan, optionally shuffle meals for variety
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = d.toLocaleString("en-US", { weekday: "short" });
    // Only shuffle if meals exist
    const meals = plan && plan.meals && plan.meals.length > 0 ? shuffleArray(plan.meals) : [];
    const totalKcal = meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
    return {
      label,
      date: d.getDate(),
      meals,
      totalKcal,
    };
  });

  const handleSwap = (mealType: string) => {
    Alert.alert("Swap Meal", `Swap action for ${mealType}`);
  };

  const weeklyCalories = weekDays.reduce((sum, day) => sum + day.totalKcal, 0);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text>Loading...</Text></View>;
  }

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
                gender,
                height: height.toString(),
                weight: weight.toString(),
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
      {weekDays[selectedDay].meals.length === 0 ? (
        <View style={styles.mealCard}>
          <Text style={styles.mealName}>
            No meals available for your BMI and gender.
          </Text>
        </View>
      ) : (
        weekDays[selectedDay].meals.map((meal, idx) => (
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
        ))
      )}
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
