import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
  const { goal: calorieGoal, setGoal } = useCalories();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
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

  const handleSave = async () => {
    if (!currentWeight || !targetWeight || !height || !age) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId) throw new Error("Not logged in");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${SERVER_URL}/api/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          user_id: userId,
          age: Number(age),
          height_cm: Number(height),
          current_weight_kg: Number(currentWeight),
          target_weight_kg: Number(targetWeight),
          goal: selectedGoal,
          activity: [selectedActivity],
          diet: [],
        }),
      });
      // Update calorie goal based on BMI
      if (bmi) {
        const b = parseFloat(bmi);
        const cal =
          b < 18.5 ? 2400 : b < 25 ? 2000 : b < 30 ? 1700 : 1500;
        setGoal(cal, userId);
      }
      Alert.alert("Saved", "Your health & goals have been updated.");
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
            <InputField
              label="Age"
              value={age}
              onChange={setAge}
              unit="yrs"
            />
            <InputField
              label="Height"
              value={height}
              onChange={setHeight}
              unit="cm"
            />
            <InputField
              label="Current Weight"
              value={currentWeight}
              onChange={setCurrentWeight}
              unit="kg"
            />
            <InputField
              label="Target Weight"
              value={targetWeight}
              onChange={setTargetWeight}
              unit="kg"
            />
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
              <TouchableOpacity
                key={g}
                style={[styles.chip, selectedGoal === g && styles.chipActive]}
                onPress={() => setSelectedGoal(g)}
                activeOpacity={0.8}
              >
                {selectedGoal === g && (
                  <Ionicons name="checkmark-circle" size={14} color={GREEN} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, selectedGoal === g && styles.chipTextActive]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity level */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity Level</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_LEVELS.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.chip, selectedActivity === a && styles.chipActive]}
                onPress={() => setSelectedActivity(a)}
                activeOpacity={0.8}
              >
                {selectedActivity === a && (
                  <Ionicons name="checkmark-circle" size={14} color={GREEN} style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, selectedActivity === a && styles.chipTextActive]}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#C4C4C4"
        />
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: DARK },
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

  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
