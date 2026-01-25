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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProgressBar from "./Settings_page files/ProgressBar";

/* ============================
   CONFIG
============================ */
// ⚠️ Use your LAN IP when testing on phone/emulator
const API_BASE = "http://localhost:3000/api";

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
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ============================
     FETCH PROFILE
  ============================ */
  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`${API_BASE}/profile?user_id=${userId}`);
      if (!res.ok) return;

      const data = await res.json();

      setProfile((p) => ({
        ...p,
        name: data.name ?? "",
        gender: data.gender ?? "",
        age: data.age ?? 0,
        heightCm: data.height_cm ?? 0,
        startWeightKg: data.start_weight_kg ?? data.weight_kg ?? 0,
        currentWeightKg: data.weight_kg ?? 0,
        targetWeightKg: data.target_weight_kg ?? 0,
        goal: data.goal ?? "Maintain Weight",
        diet: data.diet ?? [],
        activity: data.activity ?? [],
      }));
    } catch (e) {
      console.log("Profile fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ============================
     SAVE PROFILE
  ============================ */
  const saveProfile = async () => {
    try {
      setSaving(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          age: profile.age,
          height_cm: profile.heightCm,
          start_weight_kg: profile.startWeightKg,
          target_weight_kg: profile.targetWeightKg,
          goal: profile.goal,
          diet: profile.diet,
          activity: profile.activity,
        }),
      });

      Alert.alert("Saved", "Profile updated successfully");
    } catch {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  /* ============================
     DERIVED METRICS
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

    if (profile.goal === "Weight Loss") {
      const total = profile.startWeightKg - profile.targetWeightKg;
      const done = profile.startWeightKg - profile.currentWeightKg;
      progress =
        total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    }

    if (profile.goal === "Weight Gain") {
      const total = profile.targetWeightKg - profile.startWeightKg;
      const done = profile.currentWeightKg - profile.startWeightKg;
      progress =
        total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    }

    if (profile.goal === "Maintain Weight") {
      const diff = Math.abs(profile.currentWeightKg - profile.startWeightKg);
      progress = diff <= 1 ? 100 : Math.max(0, 100 - diff * 10);
    }

    setProfile((p) => ({
      ...p,
      bmi,
      bmr: Math.round(bmr),
      progress,
      dailyExpectedPercent: +(100 / 56).toFixed(2),
    }));
  }, [
    profile.currentWeightKg,
    profile.targetWeightKg,
    profile.heightCm,
    profile.age,
    profile.goal,
  ]);

  const updateNumber = (key: string, value: number) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const toggleArray = (key: "diet" | "activity", value: string) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(value)
        ? p[key].filter((v) => v !== value)
        : [...p[key], value],
    }));

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#43A047" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4FAF6" }}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.name}>{profile.name || "User"}</Text>
              <Text style={styles.subtle}>
                {profile.gender} • {profile.age} yrs
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={async () => {
              if (editMode) await saveProfile();
              setEditMode(!editMode);
            }}
          >
            <Ionicons
              name={editMode ? "checkmark" : "pencil"}
              size={22}
              color="#43A047"
            />
          </TouchableOpacity>
        </View>

        {editMode && (
          <View style={styles.cardSection}>
            <Input
              label="Age"
              value={profile.age}
              onChange={(v) => updateNumber("age", v)}
            />
            <Input
              label="Height (cm)"
              value={profile.heightCm}
              onChange={(v) => updateNumber("heightCm", v)}
            />
            <Input
              label="Current Weight (kg)"
              value={profile.currentWeightKg}
              onChange={(v) => updateNumber("currentWeightKg", v)}
            />
            <Input
              label="Target Weight (kg)"
              value={profile.targetWeightKg}
              onChange={(v) => updateNumber("targetWeightKg", v)}
            />
          </View>
        )}

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <Text style={styles.statText}>{profile.progress}%</Text>
          <ProgressBar progress={profile.progress} />
        </View>

        <View style={styles.statsRow}>
          <StatCard label="BMI" value={profile.bmi} />
          <StatCard label="BMR" value={`${profile.bmr} kcal`} />
        </View>

        <Section title="My Goal">
          {["Weight Loss", "Weight Gain", "Maintain Weight"].map((g) => (
            <Chip
              key={g}
              label={g}
              active={profile.goal === g}
              onPress={() => setProfile((p) => ({ ...p, goal: g }))}
            />
          ))}
        </Section>

        <Section title="Diet Preferences">
          {["Vegetarian", "Non-Vegetarian", "Other"].map((d) => (
            <Chip
              key={d}
              label={d}
              active={profile.diet.includes(d)}
              onPress={() => toggleArray("diet", d)}
            />
          ))}
        </Section>

        <Section title="Lifestyle & Activity">
          {["Moderate Exercise", "Sedentary"].map((a) => (
            <Chip
              key={a}
              label={a}
              active={profile.activity.includes(a)}
              onPress={() => toggleArray("activity", a)}
            />
          ))}
        </Section>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem("userId");
            router.replace("../(tabs)/landingPage");
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
   REUSABLES
============================ */
const Input = ({ label, value, onChange }: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      value={String(value)}
      keyboardType="numeric"
      onChangeText={(v) => onChange(Number(v) || 0)}
      style={styles.input}
    />
  </View>
);

const Chip = ({ label, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={styles.chipText}>{label}</Text>
  </TouchableOpacity>
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
  statText: { fontSize: 22, fontWeight: "700", color: "#1B5E20" },
  statsRow: { flexDirection: "row", marginHorizontal: 16, gap: 12 },
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
