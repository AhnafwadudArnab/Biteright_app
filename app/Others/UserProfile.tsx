import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

/* ============================
   MAIN SCREEN
============================ */
function UserProfile() {
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState(true);

  const [profile, setProfile] = useState({
    name: "John Doe",
    gender: "Male",
    age: 25,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    currentWeight: 160,
    targetWeight: 150,
    progress: 20,
    height: "5'9\"",
    bmi: 23.6,
    bmr: 1600,
    goal: "Weight Loss",
    diet: ["Vegetarian"],
    activity: ["Moderate Exercise"],
  });

  const goalOptions = ["Weight Loss", "Weight Gain", "Maintain Weight"];
  const dietOptions = ["Vegetarian", "Non-Vegetarian", "Other"];
  const activityOptions = ["Moderate Exercise", "Sedentary"];

  const handleChange = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    // TODO: save to backend / storage
    console.log("Profile saved", profile);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* ================= HEADER ================= */}
        <View style={styles.headerCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 16 }}>
              {editMode ? (
                <Input
                  label="Name"
                  value={profile.name}
                  onChangeText={(t) => handleChange("name", t)}
                />
              ) : (
                <Text style={styles.name}>{profile.name}</Text>
              )}
              <Text style={styles.subtle}>{profile.gender}</Text>
              {editMode && (
                <Input
                  label="Age"
                  value={String(profile.age)}
                  keyboardType="numeric"
                  onChangeText={(v) =>
                    handleChange("age", v.replace(/\D/g, ""))
                  }
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.editIcon}
            onPress={async () => {
              if (editMode) await saveProfile();
              setEditMode(!editMode);
            }}
          >
            <Ionicons
              name={editMode ? "checkmark" : "pencil"}
              size={20}
              color="#4CAF50"
            />
          </TouchableOpacity>
        </View>

        {/* ================= QUICK INFO ================= */}
        <View style={styles.infoRowCompact}>
          <Text style={styles.infoLabelSmall}>
            Current: <Text style={styles.infoValueSmall}>{profile.currentWeight} lbs</Text>
          </Text>
          <Text style={styles.infoLabelSmall}>
            Target: <Text style={styles.infoValueSmall}>{profile.targetWeight} lbs</Text>
          </Text>
          <Text style={styles.infoLabelSmall}>
            Progress: <Text style={styles.infoValueSmall}>{profile.progress}%</Text>
          </Text>
        </View>

        <View style={styles.infoRowCompact}>
          <Text style={styles.infoLabelSmall}>
            Height: <Text style={styles.infoValueSmall}>{profile.height}</Text>
          </Text>
          <Text style={styles.infoLabelSmall}>
            BMI: <Text style={styles.infoValueSmall}>{profile.bmi}</Text>
          </Text>
          <Text style={styles.infoLabelSmall}>
            BMR: <Text style={styles.infoValueSmall}>{profile.bmr} kcal</Text>
          </Text>
        </View>

        {/* ================= GOAL ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>My Goal</Text>
          <View style={styles.chipRow}>
            {goalOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                active={profile.goal === opt}
                icon={
                  <MaterialCommunityIcons
                    name={
                      opt === "Weight Loss"
                        ? "weight-lifter"
                        : opt === "Weight Gain"
                        ? "weight"
                        : "scale-balance"
                    }
                    size={16}
                    color="#388E3C"
                  />
                }
              />
            ))}
          </View>
        </View>

        {/* ================= DIET ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Diet Preferences</Text>
          <View style={styles.chipRow}>
            {dietOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                active={profile.diet.includes(opt)}
                icon={
                  <MaterialCommunityIcons
                    name={
                      opt === "Vegetarian"
                        ? "leaf"
                        : opt === "Non-Vegetarian"
                        ? "food-drumstick"
                        : "alert-circle-outline"
                    }
                    size={14}
                    color="#388E3C"
                  />
                }
              />
            ))}
          </View>
        </View>

        {/* ================= ACTIVITY ================= */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Lifestyle & Activity</Text>
          <View style={styles.chipRow}>
            {activityOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                active={profile.activity.includes(opt)}
                icon={
                  <MaterialCommunityIcons
                    name={opt === "Moderate Exercise" ? "run" : "sofa-single"}
                    size={16}
                    color="#388E3C"
                  />
                }
              />
            ))}
          </View>
        </View>

        {/* ================= NOTIFICATIONS ================= */}
        <View style={styles.cardSection}>
          <View style={styles.settingsRow}>
            <Ionicons name="notifications-outline" size={18} color="#388E3C" />
            <Text style={styles.settingsLabel}>Notifications</Text>

            <TouchableOpacity
              onPress={() => setNotification(!notification)}
              style={[
                styles.toggle,
                { backgroundColor: notification ? "#C8E6C9" : "#E0E0E0" },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  {
                    alignSelf: notification ? "flex-end" : "flex-start",
                    backgroundColor: notification ? "#43A047" : "#BDBDBD",
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

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

export default UserProfile;

/* ============================
   REUSABLE COMPONENTS
============================ */
const Input = ({ label, value, onChangeText, keyboardType = "default" }: any) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ color: "#757575", fontSize: 13 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={styles.input}
    />
  </View>
);

const Chip = ({ icon, label, active }: any) => (
  <View style={[styles.chip, active && styles.chipActive]}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {icon}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </View>
  </View>
);

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4FAF6" },

  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#43A047",
  },

  name: { fontSize: 20, fontWeight: "700", color: "#388E3C" },
  subtle: { color: "#757575" },

  editIcon: {
    backgroundColor: "#E8F5E9",
    padding: 6,
    borderRadius: 16,
  },

  infoRowCompact: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: 10,
    justifyContent: "space-between",
  },

  infoLabelSmall: { fontSize: 12, color: "#757575" },
  infoValueSmall: { fontWeight: "700", color: "#388E3C" },

  cardSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#388E3C",
    marginBottom: 8,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
  },

  chipActive: { backgroundColor: "#C8E6C9" },
  chipText: { color: "#388E3C", fontWeight: "600" },
  chipTextActive: { color: "#1B5E20" },

  settingsRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    marginLeft: "auto",
    padding: 2,
    justifyContent: "center",
  },

  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
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

  input: {
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
  },
});
