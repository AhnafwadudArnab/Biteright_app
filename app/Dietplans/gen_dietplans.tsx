import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Btn from "../../components/Button";

export default function GenerateDietPlan() {
  const [calories, setCalories] = useState("");
  const [preference, setPreference] = useState("");
  const [meals, setMeals] = useState(3);
  const [allergies, setAllergies] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            router.push("/(tabs)/MainHomePage");
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Generate Diet Plan</Text>
        <Text style={styles.subtitle}>Customize your meal plan</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Daily Calorie Target</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />

        <Text style={styles.label}>Dietary Preference</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={preference}
          onChangeText={setPreference}
        />

        <Text style={styles.label}>Meal Frequency</Text>
        <View style={styles.mealRow}>
          {[3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.mealBtn, meals === num && styles.mealBtnActive]}
              onPress={() => setMeals(num)}
            >
              <Text
                style={[
                  styles.mealBtnText,
                  meals === num && styles.mealBtnTextActive,
                ]}
              >
                {num} meals
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Allergies / Restrictions</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={allergies}
          onChangeText={setAllergies}
        />

        <Btn
          bgcolor="#38B36A"
          btnlabel="Generate Plan"
          TextColor="#fff"
          Pressable={() => {
            router.push({
              pathname: "../Dietplans/gen_dietplans",
              params: {
                calories,
                preference,
                meals: meals.toString(),
                allergies,
              },
            });
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 50,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtn: {
    position: "absolute",
    top: 18,
    left: 18,
    zIndex: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 2,
    textAlign: "left",
    color: "#222",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
    textAlign: "left",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
    marginBottom: 4,
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  mealBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  mealBtnActive: {
    backgroundColor: "#e6f7ee",
    borderColor: "#38B36A",
  },
  mealBtnText: {
    color: "#444",
    fontSize: 15,
  },
  mealBtnTextActive: {
    color: "#38B36A",
    fontWeight: "bold",
  },
});
