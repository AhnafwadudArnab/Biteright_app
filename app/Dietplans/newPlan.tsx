import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────
const GREEN = "#38B36A";
const BG = "#F7F7F7";

// ─── Animated section wrapper ─────────────────────────────────────────────────
function FadeSection({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GenerateDietPlan() {
  // ── State (unchanged) ──────────────────────────────────────────────────────
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("Maintain");
  const [dietType, setDietType] = useState("Veg");
  const [meals, setMeals] = useState(3);
  const [allergies, setAllergies] = useState("");

  // ── Focus states for input border highlight ────────────────────────────────
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // ── Card slide-up + fade on mount ─────────────────────────────────────────
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(60)).current;

  // ── Title / subtitle slide-down from top ──────────────────────────────────
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-24)).current;

  // ── Generate button scale ─────────────────────────────────────────────────
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Card spring
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Header fade-in from top
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Button press bounce ────────────────────────────────────────────────────
  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  // ── Generate logic (unchanged) ─────────────────────────────────────────────
  const handleGenerate = () => {
    if (!age || !height || !weight) {
      alert("Please fill in all required fields: Age, Height, and Weight.");
      return;
    }
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (
      isNaN(heightNum) ||
      isNaN(weightNum) ||
      heightNum <= 0 ||
      weightNum <= 0
    ) {
      alert("Please enter valid numeric values for Height and Weight.");
      return;
    }
    const bmi = weightNum / ((heightNum / 100) * (heightNum / 100));
    alert(`Your BMI is ${bmi.toFixed(1)}`);
    router.push({
      pathname: "/Dietplans/Daily_diet_plannigs",
      params: {
        age,
        gender: gender.toLowerCase(),
        height: heightNum.toString(),
        weight: weightNum.toString(),
        bmi: bmi.toFixed(1),
        goal,
        dietType: dietType.toLowerCase(),
        meals: meals.toString(),
        allergies,
      },
    });
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const inputStyle = (name: string) => [
    styles.input,
    focusedInput === name && styles.inputFocused,
  ];

  const sections = [
    // index 0 – Age
    <View key="age">
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={inputStyle("age")}
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        placeholder="Enter age"
        placeholderTextColor="#bbb"
        onFocus={() => setFocusedInput("age")}
        onBlur={() => setFocusedInput(null)}
      />
    </View>,

    // index 1 – Gender
    <View key="gender">
      <Text style={styles.label}>Gender</Text>
      <View style={styles.row}>
        {["male", "female"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.optionBtn, gender === g && styles.activeBtn]}
            onPress={() => setGender(g)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.optionText, gender === g && styles.activeText]}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // index 2 – Height
    <View key="height">
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={inputStyle("height")}
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
        placeholder="e.g. 170"
        placeholderTextColor="#bbb"
        onFocus={() => setFocusedInput("height")}
        onBlur={() => setFocusedInput(null)}
      />
    </View>,

    // index 3 – Weight
    <View key="weight">
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={inputStyle("weight")}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g. 65"
        placeholderTextColor="#bbb"
        onFocus={() => setFocusedInput("weight")}
        onBlur={() => setFocusedInput(null)}
      />
    </View>,

    // index 4 – Goal
    <View key="goal">
      <Text style={styles.label}>Goal</Text>
      <View style={styles.row}>
        {["Lose", "Maintain", "Gain"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.optionBtn, goal === g && styles.activeBtn]}
            onPress={() => setGoal(g)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, goal === g && styles.activeText]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // index 5 – Diet Type
    <View key="diet">
      <Text style={styles.label}>Diet Type</Text>
      <View style={styles.row}>
        {["Veg", "Non-Veg"].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.optionBtn, dietType === d && styles.activeBtn]}
            onPress={() => setDietType(d)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.optionText, dietType === d && styles.activeText]}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // index 6 – Meals
    <View key="meals">
      <Text style={styles.label}>Meals per Day</Text>
      <View style={styles.row}>
        {[3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.optionBtn, meals === num && styles.activeBtn]}
            onPress={() => setMeals(num)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.optionText, meals === num && styles.activeText]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // index 7 – Allergies
    <View key="allergies">
      <Text style={styles.label}>Allergies / Restrictions</Text>
      <TextInput
        style={inputStyle("allergies")}
        value={allergies}
        onChangeText={setAllergies}
        placeholder="e.g. Nuts, lactose"
        placeholderTextColor="#bbb"
        onFocus={() => setFocusedInput("allergies")}
        onBlur={() => setFocusedInput(null)}
      />
    </View>,
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        {/* Back button – rounded square */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(tabs)/MainHomePage")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#222" />
        </TouchableOpacity>

        {/* Header animates from top */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            alignItems: "center",
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          <Text style={styles.title}>Generate Your Diet Plan</Text>
          <Text style={styles.subtitle}>Enter your body details</Text>
        </Animated.View>

        <View style={styles.divider} />

        {/* Staggered form sections */}
        {sections.map((section, index) => (
          <FadeSection key={index} delay={index * 100}>
            {section}
          </FadeSection>
        ))}

        {/* Generate button with bounce */}
        <FadeSection delay={sections.length * 100}>
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleGenerate}
          >
            <Animated.View
              style={[styles.generateBtn, { transform: [{ scale: btnScale }] }]}
            >
              <Text style={styles.generateBtnText}>Generate Plan</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </FadeSection>
      </Animated.View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: BG,
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    paddingTop: 20,
    marginVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#fafafa",
    color: "#222",
  },
  inputFocused: {
    borderColor: GREEN,
    backgroundColor: "#f0faf4",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingVertical: 11,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  activeBtn: {
    backgroundColor: "#e8f7ef",
    borderColor: GREEN,
  },
  optionText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    color: GREEN,
    fontWeight: "700",
  },
  generateBtn: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
