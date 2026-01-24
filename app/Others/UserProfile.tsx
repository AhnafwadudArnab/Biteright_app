import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import ProgressBar from "./Settings_page files/ProgressBar";

/* ============================
   MAIN COMPONENT
============================ */
export default function UserProfile() {
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "John Doe",
    gender: "Male",
    age: 25,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",

    // 🔴 Editable (DB)
    heightCm: 175,
    currentWeight: 160, // lbs
    targetWeight: 150,  // lbs

    // 🟢 Derived (charts)
    bmi: 0,
    bmr: 0,
    progress: 0,

    goal: "Weight Loss",
    diet: ["Vegetarian"],
    activity: ["Moderate Exercise"],
  });

  /* ============================
     DERIVED CALCULATIONS
  ============================ */
  useEffect(() => {
    const weightKg = profile.currentWeight * 0.453592;
    const heightM = profile.heightCm / 100;

    const bmi = +(weightKg / (heightM * heightM)).toFixed(1);

    const bmr =
      10 * weightKg +
      6.25 * profile.heightCm -
      5 * profile.age +
      5;

    const progress =
      profile.currentWeight <= profile.targetWeight
        ? 100
        : Math.min(
            100,
            Math.max(
              0,
              Math.round(
                ((profile.currentWeight - profile.targetWeight) /
                  profile.currentWeight) *
                  100
              )
            )
          );

    setProfile((p) => ({
      ...p,
      bmi,
      bmr: Math.round(bmr),
      progress,
    }));
  }, [
    profile.currentWeight,
    profile.targetWeight,
    profile.heightCm,
    profile.age,
  ]);

  const handleChange = (key: string, value: number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* ================= HEADER ================= */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.subtle}>
                {profile.gender}, {profile.age}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <Ionicons
              name={editMode ? "checkmark" : "pencil"}
              size={22}
              color="#43A047"
            />
          </TouchableOpacity>
        </View>

        {/* ================= RED INPUTS ================= */}
        {editMode && (
          <View style={styles.cardSection}>
            <Input label="Age" value={profile.age} onChange={(v) => handleChange("age", v)} />
            <Input label="Height (cm)" value={profile.heightCm} onChange={(v) => handleChange("heightCm", v)} />
            <Input label="Current Weight (lbs)" value={profile.currentWeight} onChange={(v) => handleChange("currentWeight", v)} />
            <Input label="Target Weight (lbs)" value={profile.targetWeight} onChange={(v) => handleChange("targetWeight", v)} />
          </View>
        )}

        {/* ================= GREEN STATS ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Text style={styles.statText}>{profile.progress}%</Text>
          <ProgressBar progress={profile.progress} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="BMI" value={profile.bmi} />
          <StatCard label="BMR" value={`${profile.bmr} kcal`} />
        </View>

        {/* ================= GOAL ================= */}
        <Section title="My Goal">
          {["Weight Loss", "Weight Gain", "Maintain Weight"].map((opt) => (
            <Chip key={opt} label={opt} active={profile.goal === opt} />
          ))}
        </Section>

        {/* ================= DIET ================= */}
        <Section title="Diet Preferences">
          {["Vegetarian", "Non-Vegetarian", "Other"].map((opt) => (
            <Chip key={opt} label={opt} active={profile.diet.includes(opt)} />
          ))}
        </Section>

        {/* ================= ACTIVITY ================= */}
        <Section title="Lifestyle & Activity">
          {["Moderate Exercise", "Sedentary"].map((opt) => (
            <Chip key={opt} label={opt} active={profile.activity.includes(opt)} />
          ))}
        </Section>

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.push("../(tabs)/landingPage")}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ============================
   REUSABLE COMPONENTS
============================ */
const Input = ({ label, value, onChange }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      value={String(value)}
      keyboardType="numeric"
      onChangeText={(v) => onChange(Number(v.replace(/\D/g, "")))}
      style={styles.input}
    />
  </View>
);

const Chip = ({ label, active }: any) => (
  <View style={[styles.chip, active && styles.chipActive]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.chipRow}>{children}</View>
  </View>
);

const StatCard = ({ label, value }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  container: { backgroundColor: "#F4FAF6" },
  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#43A047",
  },
  name: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  subtle: { color: "#757575" },
  cardSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  statLabel: { color: "#388E3C" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#1B5E20" },
  statText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
  },
  chipActive: { backgroundColor: "#C8E6C9" },
  chipText: { color: "#2E7D32", fontWeight: "600" },
  inputLabel: { color: "#757575", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  logoutBtn: {
    margin: 24,
    padding: 16,
    borderRadius: 30,
    backgroundColor: "#43A047",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: { color: "#fff", fontWeight: "700" },
});
