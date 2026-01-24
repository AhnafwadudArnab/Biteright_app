import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import MealEditModal from "../Meal_trackers/Meal_edit_model";
import { router } from "expo-router";

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

// TODO: Replace with actual user id from auth context or props
const USER_ID = "demo-user-id";
const API_BASE = "http://localhost:3000/api";

// BMI JSON path (adjust if needed)
const BMI_JSON = require("../Dietplans/JSON files/DoctorSugg_bmi_mealplans.json");

// Helper: get default meals for a user (mock: male, 22-22.9)
function getDefaultMeals(gender = "male", bmiRange = "22-22.9") {
  const plan = BMI_JSON?.bmiMealPlans?.[gender]?.[bmiRange]?.meals || [];
  // Add id, time, and macros as 0 (can be edited by user)
  return plan.map((m, idx) => ({
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

export default function GenMeals() {
  const [meals, setMeals] = React.useState<Meal[]>([]);
  // Removed editing and modal state for read-only view
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  // BMI selection state
  const [selectedGender, setSelectedGender] = React.useState<"male" | "female">(
    "male",
  );
  const [selectedBmi, setSelectedBmi] = React.useState<string>("22-22.9");

  // Get all BMI ranges for gender
  const bmiRanges = Object.keys(BMI_JSON.bmiMealPlans[selectedGender]);

  // Fetch meals from backend, or load default from BMI JSON if none
  const fetchMeals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meals/${USER_ID}`);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }
      if (!data || data.length === 0) {
        // Load default meals from BMI JSON (using selected gender and bmi)
        data = getDefaultMeals(selectedGender, selectedBmi);
      }
      setMeals(data);
    } catch (err) {
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#222"
          onPress={() => {
            router.push("/(tabs)/MainHomePage");
          }}
        />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>View Log</Text>
        </View>
        
        

        {/* <Text style={styles.weeklyText}>Weekly</Text> */}
      </View>
<View style={{ height: 40 }} />
      {/* BMI Selection */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", marginRight: 8 }}>Gender:</Text>
        <TouchableOpacity
          style={{
            backgroundColor: selectedGender === "male" ? "#38B36A" : "#eee",
            padding: 8,
            borderRadius: 8,
            marginRight: 8,
          }}
          onPress={() => handleBmiChange("male", bmiRanges[0])}
        >
          <Text style={{ color: selectedGender === "male" ? "#fff" : "#222" }}>
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: selectedGender === "female" ? "#38B36A" : "#eee",
            padding: 8,
            borderRadius: 8,
            marginRight: 8,
          }}
          onPress={() =>
            handleBmiChange(
              "female",
              Object.keys(BMI_JSON.bmiMealPlans["female"])[0],
            )
          }
        >
          <Text
            style={{ color: selectedGender === "female" ? "#fff" : "#222" }}
          >
            Female
          </Text>
        </TouchableOpacity>

        <Text style={{ fontWeight: "bold", marginRight: 8, marginLeft: 8 }}>
          BMI:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
        >
          {Object.keys(BMI_JSON.bmiMealPlans[selectedGender]).map((bmi) => (
            <TouchableOpacity
              key={bmi}
              style={{
                backgroundColor: selectedBmi === bmi ? "#38B36A" : "#eee",
                padding: 8,
                borderRadius: 8,
                marginRight: 6,
              }}
              onPress={() => handleBmiChange(selectedGender, bmi)}
            >
              <Text style={{ color: selectedBmi === bmi ? "#fff" : "#222" }}>
                {bmi}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.dateText}>Today, {new Date().toDateString()}</Text>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Calories Consumed</Text>
        <Text
          style={[
            styles.totalKcal,
            { color: totalKcal > DAILY_GOAL ? "#FEE2E2" : "#FFFFFF" },
          ]}
        >
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

      {/* Meals Header */}
      <View style={styles.mealHeaderRow}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
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
        <Text style={styles.emptyText}>No meals added today</Text>
      )}

      {/* Meal Cards */}
      {!loading &&
        meals.map((meal) => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealType}>{meal.type}</Text>
            </View>

            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>

            <View style={styles.nutritionRow}>
              <Text style={styles.kcalText}>{meal.kcal} kcal</Text>
              <Text style={styles.nutritionText}>P {meal.protein}g</Text>
              <Text style={styles.nutritionText}>C {meal.carbs}g</Text>
              <Text style={styles.nutritionText}>F {meal.fat}g</Text>
            </View>
          </View>
        ))}

      {/* MealEditModal removed for read-only view */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F6F8",
    paddingBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    marginLeft: 12,
  },
  weeklyText: {
    color: "#38B36A",
    fontWeight: "600",
    fontSize: 15,
  },

  dateText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 20,
    marginBottom: 12,
  },

  totalCard: {
    backgroundColor: "#38B36A",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: {
    color: "#E8F5EC",
    fontSize: 14,
    marginBottom: 6,
  },
  totalKcal: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },

  progressBg: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },

  totalMacros: {
    color: "#F0FFF5",
    fontSize: 14,
  },

  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  addBtn: {
    backgroundColor: "#38B36A",
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 20,
  },

  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    elevation: 3,
  },

  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mealType: {
    fontSize: 16,
    fontWeight: "700",
  },
  mealActions: {
    flexDirection: "row",
  },

  mealName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },

  mealTime: {
    fontSize: 13,
    color: "#9CA3AF",
    marginVertical: 6,
  },

  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "700",
    marginRight: 12,
  },
  nutritionText: {
    marginRight: 12,
    color: "#6B7280",
  },
});
