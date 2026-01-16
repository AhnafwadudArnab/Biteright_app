import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ============================
   USER PROFILE SCREEN
============================ */

export default function UserProfile() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    avatar: "https://i.pravatar.cc/150?img=3",
    name: "Anna Johnson",
    age: 29,
    gender: "Female",
    currentWeight: 165,
    targetWeight: 140,
    height: "5'6\"",
    bmi: 26.6,
    bmr: 1450,
    goal: "Weight Loss",
    diet: ["Vegetarian", "Allergies"],
    activity: ["Moderate Exercise", "Sedentary"],
    health: ["Diabetes", "High BP", "Water Intake"],
    progress: 58,
    email: "anna.johnson@email.com",
  });

  // Handler for updating profile fields
  const handleChange = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Options for dropdowns and multi-selects
  const genderOptions = ["Male", "Female", "Other"];
  const goalOptions = ["Weight Loss", "Weight Gain", "Maintain Weight"];
  const dietOptions = ["Vegetarian", "Non-Vegetarian", "Allergies"];
  const activityOptions = ["Moderate Exercise", "Sedentary"];
  const healthOptions = ["Diabetes", "High BP", "Water Intake"];

  const [Notification, setNotification] = useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headertitle}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 4, marginTop: 30 }}
        >
          <Ionicons name="arrow-back" size={24} color="#388E3C" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "700",
            color: "#388E3C",
            marginLeft: -24, // compensate for back button width
            marginTop: 30,
            marginBottom: 0,
          }}
        >
          Settings
        </Text>
        {/* Placeholder for spacing to center the title */}
        <View style={{ width: 28 }} />
      </View>
      {/* Profile Info */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={{ marginLeft: 16 }}>
            {editMode ? (
              <Input
                label="Name"
                value={profile.name}
                onChangeText={(text: string) => handleChange("name", text)}
                editable={editMode}
              />
            ) : (
              <Text style={styles.name}>{profile.name}</Text>
            )}
            <Text style={styles.subtle}>{profile.gender}</Text>
            {editMode ? (
              <Input
                label="Age"
                value={String(profile.age)}
                onChangeText={(v: string) =>
                  handleChange("age", v.replace(/\D/g, ""))
                }
                keyboardType="numeric"
                editable={editMode}
              />
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => setEditMode(!editMode)}
        >
          <Ionicons
            name={editMode ? "checkmark" : "pencil"}
            size={20}
            color="#4CAF50"
          />
        </TouchableOpacity>
      </View>

      {/* Weight/Progress */}
      <View
        style={[
          styles.cardRow,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
        ]}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.infoLabel}>Current</Text>
          {editMode ? (
            <Input
              label="Weight"
              value={String(profile.currentWeight)}
              onChangeText={(v: string) =>
                handleChange("currentWeight", v.replace(/\D/g, ""))
              }
              keyboardType="numeric"
              editable={editMode}
            />
          ) : (
            <Text style={styles.infoValue}>{profile.currentWeight} lbs</Text>
          )}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.infoLabel}>Target</Text>
          {editMode ? (
            <Input
              label="Target"
              value={String(profile.targetWeight)}
              onChangeText={(v: string) =>
                handleChange("targetWeight", v.replace(/\D/g, ""))
              }
              keyboardType="numeric"
              editable={editMode}
            />
          ) : (
            <Text style={styles.infoValue}>{profile.targetWeight} lbs</Text>
          )}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.infoLabel}>Progress</Text>
          <Text style={styles.infoValue}>{profile.progress}%</Text>
        </View>
      </View>

      {/* Body Info */}
      <View
        style={[
          styles.cardRow,
          { alignItems: "flex-start", marginLeft: 16, marginRight: 16 },
        ]}
      >
        <View
          style={[
            styles.infoCol,
            { alignItems: "flex-start", flex: 1, marginRight: 8 },
          ]}
        >
          <Text style={styles.infoLabel}>Height</Text>
          {editMode ? (
            <Input
              label="Height"
              value={String(profile.height)}
              onChangeText={(v: string) => handleChange("height", v)}
              editable={editMode}
            />
          ) : (
            <Text style={styles.infoValue}>{profile.height}</Text>
          )}
        </View>
        <View
          style={[
            styles.infoCol,
            { alignItems: "flex-start", flex: 1, marginHorizontal: 8 },
          ]}
        >
          <Text style={styles.infoLabel}>BMI</Text>
          <Text style={styles.infoValue}>{String(profile.bmi)}</Text>
        </View>
        <View
          style={[
            styles.infoCol,
            { alignItems: "flex-start", flex: 1, marginLeft: 8 },
          ]}
        >
          <Text style={styles.infoLabel}>BMR</Text>
          <Text style={styles.infoValue}>{String(profile.bmr)} kcal</Text>
        </View>
      </View>

      {/* Goal */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>My Goal</Text>
        {editMode ? (
          <Dropdown
            label="Goal"
            options={goalOptions}
            value={profile.goal}
            editable={editMode}
            onChange={(v: string) => handleChange("goal", v)}
          />
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 8,
            }}
          >
            {goalOptions.map((opt) => (
              <Chip
                key={opt}
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
                label={opt}
                active={profile.goal === opt}
              />
            ))}
          </View>
        )}
      </View>

      {/* Diet Preferences */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Diet Preferences</Text>
        {editMode ? (
          <MultiSelect
            label="Diet"
            options={dietOptions}
            selected={profile.diet}
            editable={editMode}
            onChange={(v: string[]) => handleChange("diet", v)}
          />
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            {dietOptions.map((opt) => (
              <Chip
                key={opt}
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
                label={opt}
                active={profile.diet.includes(opt)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Lifestyle & Activity */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Lifestyle & Activity</Text>
        {editMode ? (
          <MultiSelect
            label="Activity"
            options={activityOptions}
            selected={profile.activity}
            editable={editMode}
            onChange={(v: string[]) => handleChange("activity", v)}
          />
        ) : (
          <View style={styles.chipRow}>
            {activityOptions.map((opt) => (
              <Chip
                key={opt}
                icon={
                  <MaterialCommunityIcons
                    name={opt === "Moderate Exercise" ? "run" : "sofa-single"}
                    size={16}
                    color="#388E3C"
                  />
                }
                label={opt}
                active={profile.activity.includes(opt)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 10 }} />
      </View>

      {/* Progress Tracking (Preview) */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Progress Tracking</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={styles.chartCard}>
            <Text style={styles.chartLabel}>Weight Loss</Text>
            <View style={styles.chartPreview} />
          </View>
          <View style={styles.chartCard}>
            <Text style={styles.chartLabel}>Weight Gained</Text>
            <View style={styles.chartPreview} />
          </View>
        </View>
      </View>

      {/* Notification on/off */}
      <View style={styles.cardSection}>
        <View style={styles.settingsRow}>
          <Ionicons
            name="notifications-outline"
            size={18}
            color="#388E3C"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.settingsLabel}>Notifications</Text>
          <View style={{ marginLeft: "auto" }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 24,
                borderRadius: 12,
                backgroundColor: Notification ? "#C8E6C9" : "#E0E0E0",
                justifyContent: "center",
                padding: 2,
              }}
              onPress={() => setNotification((prev: boolean) => !prev)}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: Notification ? "#43A047" : "#BDBDBD",
                  alignSelf: Notification ? "flex-end" : "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => router.push("../(tabs)/landingPage")}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FAF6",
  },
  headertitle: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: "#fff",
    position: "relative",
  },
  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 10,
    padding: 18,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#43A047",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#388E3C",
  },
  subtle: {
    color: "#757575",
    fontSize: 15,
    marginTop: 2,
  },
  editIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 6,
    zIndex: 1,
  },
  cardRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  infoCol: {
    flex: 1,
    alignItems: "center",
  },
  infoLabel: {
    color: "#757575",
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#388E3C",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#43A047",
    borderRadius: 4,
  },
  cardSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#388E3C",
    marginBottom: 5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#C8E6C9",
  },
  chipText: {
    color: "#388E3C",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#1B5E20",
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#F4FAF6",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  chartLabel: {
    color: "#7CB342",
    marginBottom: 6,
  },
  chartPreview: {
    height: 36,
    width: "100%",
    backgroundColor: "#E0F2F1",
    borderRadius: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  settingsLabel: {
    fontSize: 15,
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
  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});

/* ============================
   REUSABLE COMPONENTS
============================ */
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  editable?: boolean;
}
const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
}) => {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        style={{
          borderWidth: 1,

          borderColor: "#C8E6C9",
          borderRadius: 8,
          padding: 8,
          backgroundColor: editable ? "#fff" : "#F4FAF6",
        }}
      />
    </View>
  );
};
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
}
const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  editable = true,
}) => {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>
        {label}
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: "#C8E6C9",
          borderRadius: 8,
          padding: 8,
          backgroundColor: editable ? "#fff" : "#F4FAF6",
        }}
      >
        <Text>{value}</Text>
      </View>
    </View>
  );
};

// Simple MultiSelect component for demonstration
interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  editable?: boolean;
}
const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  editable = true,
}) => {
  const toggle = (option: string) => {
    if (!editable) return;
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: "#757575", fontSize: 13, marginBottom: 4 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            onPress={() => toggle(opt)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 16,
              backgroundColor: selected.includes(opt) ? "#C8E6C9" : "#E8F5E9",
              marginRight: 6,
              marginBottom: 6,
              opacity: editable ? 1 : 0.6,
            }}
            disabled={!editable}
          >
            <Text style={{ color: "#388E3C", fontWeight: "600" }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
interface ChipProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}
const Chip: React.FC<ChipProps> = ({ icon, label, active = false }) => {
  return (
    <View style={[styles.chip, active ? styles.chipActive : null]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
          {label}
        </Text>
      </View>
    </View>
  );
};
