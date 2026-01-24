import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./Settings_page files/ProgressBar";

/* ============================
   DEFAULT PROFILE
============================ */
const defaultProfile = {
  name: "",
  gender: "",
  age: 0,
  avatar: "https://i.pravatar.cc/150",

  heightCm: 0,
  startWeightKg: 0,
  currentWeightKg: 0,
  targetWeightKg: 0,

  goal: "Maintain Weight",
  diet: [] as string[],
  activity: [] as string[],

  bmi: 0,
  bmr: 0,
  progress: 0,
  dailyExpectedPercent: 0,
  dailyStatus: "On Track",
};

export default function UserProfile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(defaultProfile);

  /* ============================
     FETCH PROFILE
  ============================ */
  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        return;
      }

      // TODO: Replace with your actual backend URL
      const res = await fetch(`http://localhost:3000/api/users/${userId}`);
      const data = await res.json();
      if (!res.ok) return;

      setProfile((prev) => ({
        ...prev,
        name: data.name,
        gender: data.gender,
        age: data.age,
        heightCm: data.height_cm,
        startWeightKg: data.start_weight_kg ?? data.weight_kg,
        currentWeightKg: data.weight_kg,
        targetWeightKg: data.target_weight_kg,
        goal: data.goal ?? "Maintain Weight",
        diet: data.diet ? JSON.parse(data.diet) : [],
        activity: data.activity ? JSON.parse(data.activity) : [],
      }));
    } catch (err) {
      console.log("Profile fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  /* ============================
     DERIVED CALCULATIONS
  ============================ */
  useEffect(() => {
    if (!profile.heightCm || !profile.currentWeightKg) return;

    const heightM = profile.heightCm / 100;

    const bmi = +(profile.currentWeightKg / (heightM * heightM)).toFixed(1);

    const bmr =
      10 * profile.currentWeightKg +
      6.25 * profile.heightCm -
      5 * profile.age +
      5;

    let progress = 0;

    /* ===== TARGET LOGIC FIX ===== */
    if (profile.goal === "Weight Loss") {
      const totalToLose = profile.startWeightKg - profile.targetWeightKg;
      const lostSoFar = profile.startWeightKg - profile.currentWeightKg;

      progress =
        profile.currentWeightKg <= profile.targetWeightKg
          ? 100
          : totalToLose > 0
            ? Math.round((lostSoFar / totalToLose) * 100)
            : 0;
    } else if (profile.goal === "Weight Gain") {
      const totalToGain = profile.targetWeightKg - profile.startWeightKg;
      const gainedSoFar = profile.currentWeightKg - profile.startWeightKg;

      progress =
        profile.currentWeightKg >= profile.targetWeightKg
          ? 100
          : totalToGain > 0
            ? Math.round((gainedSoFar / totalToGain) * 100)
            : 0;
    } else if (profile.goal === "Maintain Weight") {
      const diff = Math.abs(profile.currentWeightKg - profile.startWeightKg);
      progress = diff <= 1 ? 100 : Math.max(0, 100 - diff * 10);
    }

    const dailyExpectedPercent = +(100 / (8 * 7)).toFixed(2);

    setProfile((p) => ({
      ...p,
      bmi,
      bmr: Math.round(bmr),
      progress,
      dailyExpectedPercent,
      dailyStatus: "On Track",
    }));
  }, [
    profile.currentWeightKg,
    profile.targetWeightKg,
    profile.startWeightKg,
    profile.heightCm,
    profile.age,
    profile.goal,
  ]);

  const handleChange = (key: string, value: number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#43A047" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4FAF6" }}>
      <View
        style={{
          paddingTop: 48,
          paddingHorizontal: 24,
          backgroundColor: "#F4FAF6",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#2E7D32",
            textAlign: "center",
          }}
        >
          My Profile
        </Text>
      </View>
      <ScrollView style={styles.container}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.name}>{profile.name || "User"}</Text>
              <Text style={styles.subtle}>
                {profile.gender} {profile.age ? `• ${profile.age} yrs` : ""}
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

        {/* ================= EDIT INPUTS ================= */}
        {editMode && (
          <View style={styles.cardSection}>
            <Input
              label="Age"
              value={profile.age}
              onChange={(v) => handleChange("age", v)}
            />
            <Input
              label="Height (cm)"
              value={profile.heightCm}
              onChange={(v) => handleChange("heightCm", v)}
            />
            <Input
              label="Current Weight (kg)"
              value={profile.currentWeightKg}
              onChange={(v) => handleChange("currentWeightKg", v)}
            />
            <Input
              label="Target Weight (kg)"
              value={profile.targetWeightKg}
              onChange={(v) => handleChange("targetWeightKg", v)}
            />
          </View>
        )}

        {/* ================= PROGRESS ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <Text style={styles.statText}>{profile.progress}%</Text>
          <ProgressBar progress={profile.progress} />
        </View>

        {/* ================= DAILY ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Daily Target</Text>
          <Text style={styles.dailyText}>
            {profile.dailyExpectedPercent}% per day
          </Text>
        </View>

        {/* ================= STATS ================= */}
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
            <Chip
              key={opt}
              label={opt}
              active={profile.activity.includes(opt)}
            />
          ))}
        </Section>

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem("userId");
            router.push("../(tabs)/landingPage");
          }}
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
type InputProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

const Input = ({ label, value, onChange }: InputProps) => (
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

type ChipProps = {
  label: string;
  active: boolean;
};

const Chip = ({ label, active }: ChipProps) => (
  <View style={[styles.chip, active && styles.chipActive]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>
);

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <View style={styles.cardSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.chipRow}>{children}</View>
  </View>
);

type StatCardProps = {
  label: string;
  value: string | number;
};

const StatCard = ({ label, value }: StatCardProps) => (
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
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  statText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 6,
  },
  dailyText: { color: "#388E3C" },

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
