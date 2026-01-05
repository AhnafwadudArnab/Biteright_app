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

export default function GenerateDietPlan() {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("Maintain");
  const [dietType, setDietType] = useState("Veg");
  const [meals, setMeals] = useState(3);
  const [allergies, setAllergies] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(tabs)/MainHomePage")}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>

        <Text style={styles.title}>Genarate Your Diet Plan</Text>
        <Text style={styles.subtitle}>Enter your body details</Text>
        <View style={styles.divider} />

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholder="Enter age"
        />

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.row}>
          {["Male", "Female"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionBtn, gender === g && styles.activeBtn]}
              onPress={() => setGender(g)}
            >
              <Text
                style={[styles.optionText, gender === g && styles.activeText]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Height */}
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          placeholder="e.g. 170"
        />

        {/* Weight */}
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 65"
        />

        {/* Goal */}
        <Text style={styles.label}>Goal</Text>
        <View style={styles.row}>
          {["Lose", "Maintain", "Gain"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.optionBtn, goal === g && styles.activeBtn]}
              onPress={() => setGoal(g)}
            >
              <Text
                style={[styles.optionText, goal === g && styles.activeText]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diet Type */}
        <Text style={styles.label}>Diet Type</Text>
        <View style={styles.row}>
          {["Veg", "Non-Veg", "Keto"].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.optionBtn, dietType === d && styles.activeBtn]}
              onPress={() => setDietType(d)}
            >
              <Text
                style={[styles.optionText, dietType === d && styles.activeText]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meals */}
        <Text style={styles.label}>Meals per Day</Text>
        <View style={styles.row}>
          {[3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.optionBtn, meals === num && styles.activeBtn]}
              onPress={() => setMeals(num)}
            >
              <Text
                style={[styles.optionText, meals === num && styles.activeText]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Allergies */}
        <Text style={styles.label}>Allergies / Restrictions</Text>
        <TextInput
          style={styles.input}
          value={allergies}
          onChangeText={setAllergies}
          placeholder="e.g. Nuts, lactose"
        />

        <TouchableOpacity
          style={{
            paddingRight: 40,
            paddingLeft: 40,
            backgroundColor: "#38B36A",
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 100,
            marginTop: 20,
            width: 250,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          }}
          onPress={() => {
            router.push({
              pathname: "/Dietplans/Daily_diet_plannigs",
              params: {
                age,
                gender,
                height,
                weight,
                goal,
                dietType,
                meals: meals.toString(),
                allergies,
              },
            });
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Generate Plan
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 40,
    marginVertical: 30,
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
    marginTop: 5,
    marginBottom: 2,
    color: "#222",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 1,
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
  },

  /* Reusable row for buttons */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  optionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  activeBtn: {
    backgroundColor: "#e6f7ee",
    borderColor: "#38B36A",
  },
  optionText: {
    color: "#444",
    fontSize: 15,
  },
  activeText: {
    color: "#38B36A",
    fontWeight: "bold",
  },
});
