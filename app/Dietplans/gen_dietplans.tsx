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
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [dietType, setDietType] = useState<"veg" | "non-veg" | "keto">("veg");
  const [meals, setMeals] = useState(3);
  const [allergies, setAllergies] = useState("");

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0) return 0;
    const bmi = w / ((h / 100) * (h / 100));
    if (!isFinite(bmi) || isNaN(bmi)) return 0;
    return +bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    let category = "";
    if (bmi < 18.5) {
      category = "underweight";
    }
    else if (bmi >= 18.5 && bmi < 25) {
      category = "normal";
    }
    else if (bmi >= 25 && bmi < 30) {
      category = "overweight";
    }
    else {
      category = "obese";
    }
    return category;
  };

  const handleGenerate = () => {
    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    router.push({
      pathname: "../Dietplans/gen_dietplans",
      params: {
        age,
        gender,
        height,
        weight,
        bmi: bmi.toString(),
        bmiCategory,
        goal,
        dietType,
        meals: meals.toString(),
        allergies,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(tabs)/MainHomePage")}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.title}>Generate Diet Plan</Text>
        <Text style={styles.subtitle}>Enter your body details</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.mealRow}>
          {["male", "female"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.mealBtn, gender === g && styles.mealBtnActive]}
              onPress={() => setGender(g as any)}
            >
              <Text
                style={[
                  styles.mealBtnText,
                  gender === g && styles.mealBtnTextActive,
                ]}
              >
                {g.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <Text style={styles.label}>Goal</Text>
        <View style={styles.mealRow}>
          {["lose", "maintain", "gain"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.mealBtn, goal === g && styles.mealBtnActive]}
              onPress={() => setGoal(g as any)}
            >
              <Text
                style={[
                  styles.mealBtnText,
                  goal === g && styles.mealBtnTextActive,
                ]}
              >
                {g.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Diet Type</Text>
        <View style={styles.mealRow}>
          {["veg", "non-veg", "keto"].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.mealBtn, dietType === d && styles.mealBtnActive]}
              onPress={() => setDietType(d as any)}
            >
              <Text
                style={[
                  styles.mealBtnText,
                  dietType === d && styles.mealBtnTextActive,
                ]}
              >
                {d.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Meals per Day</Text>
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
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Allergies / Restrictions</Text>
        <TextInput
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
        />

        <Btn
          bgcolor="#38B36A"
          btnlabel="Generate Plan"
          TextColor="#fff"
          Pressable={handleGenerate}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f6f7f9",
    justifyContent: "center",
    padding: 12,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  backBtn: {
    position: "absolute",
    top: 18,
    left: 18,
    zIndex: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#111827",
  },

  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  mealBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  mealBtnActive: {
    backgroundColor: "#e8f8f0",
    borderColor: "#38B36A",
  },

  mealBtnText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },

  mealBtnTextActive: {
    color: "#15803d",
    fontWeight: "700",
  },
});
