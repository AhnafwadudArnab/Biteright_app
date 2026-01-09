import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MealEditModal from "./Meal_edit_model";
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

export default function GenMeals() {
  const [meals, setMeals] = React.useState<Meal[]>([
    {
      id: "1",
      type: "Breakfast",
      name: "Avocado Toast",
      time: "8:30 AM",
      kcal: 380,
      protein: 12,
      carbs: 45,
      fat: 18,
    },
    {
      id: "2",
      type: "Lunch",
      name: "Chicken Wrap",
      time: "1:15 PM",
      kcal: 520,
      protein: 32,
      carbs: 48,
      fat: 22,
    },
    {
      id: "3",
      type: "Snack",
      name: "Protein Bar",
      time: "4:00 PM",
      kcal: 220,
      protein: 20,
      carbs: 24,
      fat: 8,
    },
  ]);

  const [editingMeal, setEditingMeal] = React.useState<Meal | null>(null);
  const [showMealModal, setShowMealModal] = React.useState(false);

  const totalKcal = meals.reduce((s, m) => s + m.kcal, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  const progressPercent = Math.min((totalKcal / DAILY_GOAL) * 100, 100);

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealModal(true);
  };

  const handleDelete = (meal: Meal) => {
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
  };

  const handleSaveMeal = (meal: Meal) => {
    if (editingMeal) {
      setMeals((prev) => prev.map((m) => (m.id === editingMeal.id ? meal : m)));
    } else {
      setMeals((prev) => [...prev, { ...meal, id: Date.now().toString() }]);
    }
    setShowMealModal(false);
    setEditingMeal(null);
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setShowMealModal(true);
  };

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
        <Text style={styles.headerTitle}>Daily Meal Log</Text>
        <Text style={styles.weeklyText}>Weekly</Text>
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
        <TouchableOpacity style={styles.addBtn} onPress={handleAddMeal}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {meals.length === 0 && (
        <Text style={styles.emptyText}>No meals added today</Text>
      )}

      {/* Meal Cards */}
      {meals.map((meal) => (
        <View key={meal.id} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{meal.type}</Text>
            <View style={styles.mealActions}>
              <TouchableOpacity onPress={() => handleEdit(meal)}>
                <Ionicons name="create-outline" size={20} color="#38B36A" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(meal)}
                style={{ marginLeft: 12 }}
              >
                <Ionicons name="trash-outline" size={20} color="#E57373" />
              </TouchableOpacity>
            </View>
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

      {showMealModal && (
        <MealEditModal
          meal={
            editingMeal || {
              id: "",
              type: "",
              name: "",
              time: "",
              kcal: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            }
          }
          onSave={handleSaveMeal}
          onCancel={() => {
            setShowMealModal(false);
            setEditingMeal(null);
          }}
        />
      )}
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
