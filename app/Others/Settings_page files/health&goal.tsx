import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../AuthContext";
import { useCalories } from "../../CaloriesContext";
import { SERVER_URL } from "../../serverhost";

const GREEN = "#3BB273";
const DARK = "#0F172A";

const GOALS = ["Weight Loss", "Weight Gain", "Maintain Weight"] as const;
const ACTIVITY_LEVELS = [
  "Sedentary",
  "Light Exercise",
  "Moderate Exercise",
  "Active",
] as const;

export default function HealthGoalScreen() {
  const { user, token } = useAuth();
  const { goal: calorieGoal } = useCalories();

  const [loading, setLoading] = useState(true);

  // Form state (read-only display)
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string>("Maintain Weight");
  const [selectedActivity, setSelectedActivity] = useState<string>("Sedentary");

  // Derived
  const bmi =
    currentWeight && height
      ? (
          parseFloat(currentWeight) /
          ((parseFloat(height) / 100) * (parseFloat(height) / 100))
        ).toFixed(1)
      : null;

  const bmiCategory = () => {
    if (!bmi) return { label: "—", color: "#9CA3AF" };
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: "Underweight", color: "#3B82F6" };
    if (b < 25)   return { label: "Normal",      color: GREEN };
    if (b < 30)   return { label: "Overweight",  color: "#F59E0B" };
    return           { label: "Obese",           color: "#EF4444" };
  };

  // Load profile from backend
  useEffect(() => {
    const load = async () => {
      try {
        const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
        if (!userId) return;
        const headers: any = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${SERVER_URL}/api/profile?user_id=${userId}`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentWeight(String(data.current_weight_kg ?? ""));
        setTargetWeight(String(data.target_weight_kg ?? ""));
        setHeight(String(data.height_cm ?? ""));
        setAge(String(data.age ?? ""));
        setSelectedGoal(data.goal ?? "Maintain Weight");
        setSelectedActivity(
          Array.isArray(data.activity) && data.activity.length > 0
            ? data.activity[0]
            : "Sedentary"
        );
      } catch {
        // silent — show empty form
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  const bmi_ = bmiCategory();

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Health & Goals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* BMI summary */}
        {bmi && (
          <View style={[styles.bmiCard, { borderLeftColor: bmi_.color }]}>
            <View>
              <Text style={styles.bmiLabel}>Your BMI</Text>
              <Text style={[styles.bmiValue, { color: bmi_.color }]}>{bmi}</Text>
            </View>
            <View style={[styles.bmiCatBadge, { backgroundColor: bmi_.color + "18" }]}>
              <Text style={[styles.bmiCatText, { color: bmi_.color }]}>
                {bmi_.label}
              </Text>
            </View>
          </View>
        )}

        {/* Measurements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Measurements</Text>
          <View style={styles.inputGrid}>
            <DisplayField label="Age"            value={age}           unit="yrs" />
            <DisplayField label="Height"         value={height}        unit="cm"  />
            <DisplayField label="Current Weight" value={currentWeight} unit="kg"  />
            <DisplayField label="Target Weight"  value={targetWeight}  unit="kg"  />
          </View>
        </View>

        {/* Daily calorie goal display */}
        <View style={styles.calCard}>
          <Ionicons name="flame" size={20} color={GREEN} />
          <Text style={styles.calLabel}>Daily Calorie Goal</Text>
          <Text style={styles.calValue}>{calorieGoal} kcal</Text>
        </View>

        {/* Goal selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Goal</Text>
          <View style={styles.chipRow}>
            {GOALS.map((g) => (
              <View
                key={g}
                style={[styles.chip, selectedGoal === g && styles.chipActive]}
              >
                {selectedGoal === g && (
                  <Ionicons name="checkmark-circle" size={14} color={GREEN} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, selectedGoal === g && styles.chipTextActive]}>
                  {g}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity level */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Level</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_LEVELS.map((a) => (
              <View
                key={a}
                style={[styles.chip, selectedActivity === a && styles.chipActive]}
              >
                {selectedActivity === a && (
                  <Ionicons name="checkmark-circle" size={14} color={GREEN} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, selectedActivity === a && styles.chipTextActive]}>
                  {a}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Save button removed — data is read-only */}
      </ScrollView>
    </View>
  );
}

// ── Display field (read-only) ─────────────────────────────────────────────────
function DisplayField({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.displayRow}>
        <Text style={styles.displayValue}>{value || "—"}</Text>
        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 48,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  backButton: { position: "absolute", left: 16, padding: 8, zIndex: 1 },
  header: { fontSize: 22, fontWeight: "700", color: "#222", textAlign: "center" },
  scroll: { padding: 16, paddingBottom: 40 },

  bmiCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bmiLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  bmiValue: { fontSize: 28, fontWeight: "800" },
  bmiCatBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bmiCatText: { fontSize: 13, fontWeight: "700" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: DARK, marginBottom: 14 },

  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  inputWrap: { width: "47%" },
  inputLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", marginBottom: 6 },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  displayValue: { flex: 1, fontSize: 15, color: DARK, fontWeight: "600" },
  inputUnit: { fontSize: 13, color: "#9CA3AF", fontWeight: "600" },

  calCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  calLabel: { flex: 1, fontSize: 14, color: "#374151", fontWeight: "600" },
  calValue: { fontSize: 18, fontWeight: "800", color: GREEN },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: { backgroundColor: "#ECFDF5", borderColor: GREEN },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActive: { color: GREEN },
});
