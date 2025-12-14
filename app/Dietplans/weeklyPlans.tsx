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

const weekDays = [
  { label: "Mon", date: 8 },
  { label: "Tue", date: 9 },
  { label: "Wed", date: 10 },
  { label: "Thu", date: 11 },
  { label: "Fri", date: 12 },
  { label: "Sat", date: 13 },
];

const meals = [
  {
    type: "Breakfast",
    name: "Oatmeal with berries",
    kcal: 350,
  },
  {
    type: "Lunch",
    name: "Grilled chicken salad",
    kcal: 420,
  },
  {
    type: "Snack",
    name: "Greek yogurt & almonds",
    kcal: 200,
  },
  {
    type: "Dinner",
    name: "Salmon with quinoa",
    kcal: 550,
  },
];

export default function WeeklyPlans() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);
  const [mealList, setMealList] = useState(meals);

  const handleDeletePlan = () => {
    setDeleteMode((prev) => !prev);
  };

  const handleDeleteMeal = (idx: number) => {
    const updated = mealList.filter((_, i) => i !== idx);
    setMealList(updated);
    if (updated.length === 0) setDeleteMode(false);
  };

  const handleSwap = (mealType: string) => {
    Alert.alert("Swap", `Swap action for ${mealType}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Plan</Text>
        <TouchableOpacity
          onPress={() => {
            router.push("../Dietplans/gen_dietplans");
          }}
          style={styles.dayViewBtn}
        >
          <Text style={styles.dayViewText}>Day View</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.dateRange}>Dec 7 - Dec 13</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekScroll}
        contentContainerStyle={{
          paddingVertical: 8,
          alignItems: "center",
          paddingLeft: 2,
        }}
      >
        {weekDays.map((day, idx) => (
          <TouchableOpacity
            key={day.label}
            style={[
              styles.dayBtn,
              selectedDay === idx && styles.dayBtnActive,
              idx === 0 ? { marginLeft: 0 } : {},
            ]}
            onPress={() => setSelectedDay(idx)}
          >
            <Text
              style={[
                styles.dayBtnText,
                selectedDay === idx && styles.dayBtnTextActive,
              ]}
            >
              {day.label}
            </Text>
            <Text
              style={[
                styles.dayBtnDate,
                selectedDay === idx && styles.dayBtnTextActive,
              ]}
            >
              {day.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      <View style={{ marginTop: 8 }}>
        {mealList.map((meal, idx) => (
          <View key={idx} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealType}>{meal.type}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => handleSwap(meal.type)}>
                  <Ionicons name="swap-horizontal" size={20} color="#38B36A" />
                </TouchableOpacity>
                {deleteMode && (
                  <TouchableOpacity
                    onPress={() => handleDeleteMeal(idx)}
                    style={{ marginLeft: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
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
      </View>

      <TouchableOpacity
        style={[
          styles.deleteBtn,
          deleteMode && { borderColor: "#aaa", backgroundColor: "#fbe9e7" },
        ]}
        onPress={handleDeletePlan}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#F44336"
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.deleteBtnText, deleteMode && { color: "#222" }]}>
          {deleteMode ? "Cancel Delete" : "Delete Plan"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    padding: 0,
    paddingTop: 0,
    alignItems: "stretch",
    marginTop: 50,
  },
  headerTitle2: {},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 2,
    paddingHorizontal: 24,
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
    textAlign: "left",
  },
  dayViewBtn: {
    padding: 4,
  },
  dayViewText: {
    color: "#38B36A",
    fontWeight: "500",
    fontSize: 15,
  },
  dateRange: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
    marginLeft: 28,
    marginTop: 2,
  },
  weekScroll: {
    marginBottom: 8,
    paddingLeft: 16,
    paddingRight: 8,
  },
  dayBtn: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: "center",
    minWidth: 54,
  },
  dayBtnActive: {
    backgroundColor: "#38B36A",
  },
  dayBtnText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
  },
  dayBtnTextActive: {
    color: "#fff",
  },
  dayBtnDate: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginVertical: 8,
    marginHorizontal: 24,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    marginHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90, // Ensures consistent card height
    justifyContent: "center",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  mealType: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  mealName: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 6,
  },
  kcalText: {
    color: "#38B36A",
    fontWeight: "bold",
    fontSize: 15,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#F44336",
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 18,
    marginBottom: 24,
    backgroundColor: "#fff",
    marginHorizontal: 24,
  },
  deleteBtnText: {
    color: "#F44336",
    fontWeight: "bold",
    fontSize: 16,
  },
});
