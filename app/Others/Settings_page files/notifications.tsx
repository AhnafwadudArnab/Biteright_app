import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GREEN = "#3BB273";

type NotifSetting = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  desc: string;
};

const SETTINGS: NotifSetting[] = [
  {
    key: "mealReminder",
    icon: "restaurant-outline",
    iconBg: "#ECFDF5",
    title: "Meal Reminders",
    desc: "Get reminded to log your meals",
  },
  {
    key: "waterReminder",
    icon: "water-outline",
    iconBg: "#EFF6FF",
    title: "Water Reminders",
    desc: "Stay hydrated with hourly nudges",
  },
  {
    key: "goalAlert",
    icon: "trophy-outline",
    iconBg: "#FEF3C7",
    title: "Goal Alerts",
    desc: "Notify when you hit daily targets",
  },
  {
    key: "streakAlert",
    icon: "flame-outline",
    iconBg: "#FFEDD5",
    title: "Streak Alerts",
    desc: "Don't break your streak!",
  },
  {
    key: "weeklyReport",
    icon: "bar-chart-outline",
    iconBg: "#F5F3FF",
    title: "Weekly Report",
    desc: "Summary of your weekly progress",
  },
];

export default function NotificationsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    mealReminder: true,
    waterReminder: true,
    goalAlert: false,
    streakAlert: true,
    weeklyReport: false,
  });

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const enabledCount = Object.values(toggles).filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Summary pill */}
        <View style={styles.summaryPill}>
          <Ionicons name="notifications" size={16} color={GREEN} />
          <Text style={styles.summaryText}>
            {enabledCount} of {SETTINGS.length} notifications enabled
          </Text>
        </View>

        {/* Settings list */}
        <View style={styles.card}>
          {SETTINGS.map((s, i) => (
            <View key={s.key}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: s.iconBg }]}>
                  <Ionicons name={s.icon} size={20} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{s.title}</Text>
                  <Text style={styles.rowDesc}>{s.desc}</Text>
                </View>
                <Switch
                  value={toggles[s.key]}
                  onValueChange={() => toggle(s.key)}
                  trackColor={{ false: "#E5E7EB", true: GREEN }}
                  thumbColor="#fff"
                />
              </View>
              {i < SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Disable all */}
        <TouchableOpacity
          style={styles.disableBtn}
          onPress={() =>
            setToggles(
              Object.fromEntries(SETTINGS.map((s) => [s.key, false]))
            )
          }
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-off-outline" size={18} color="#6B7280" />
          <Text style={styles.disableBtnText}>Disable All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 48,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  scroll: { padding: 16, paddingBottom: 40 },

  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryText: { fontSize: 13, color: GREEN, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E" },
  rowDesc:  { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  divider:  { height: 1, backgroundColor: "#F3F4F6", marginLeft: 68 },

  disableBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  disableBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
});
