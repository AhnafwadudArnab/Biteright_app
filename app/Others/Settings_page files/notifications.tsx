import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GREEN = "#3BB273";
const STORAGE_KEY = "notification_prefs";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type NotifSetting = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  desc: string;
  scheduleFn?: () => Promise<void>;
};

// ── Schedule helpers ──────────────────────────────────────────────────────────

async function scheduleDailyNotif(id: string, title: string, body: string, hour: number, minute: number) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: { hour, minute, repeats: true } as any,
  });
}

async function cancelNotif(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

// ── Request permission ────────────────────────────────────────────────────────
async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// ── Settings config ───────────────────────────────────────────────────────────
const SETTINGS: NotifSetting[] = [
  {
    key: "mealReminder",
    icon: "restaurant-outline",
    iconBg: "#ECFDF5",
    title: "Meal Reminders",
    desc: "Reminded at 8am, 1pm & 7pm to log meals",
  },
  {
    key: "waterReminder",
    icon: "water-outline",
    iconBg: "#EFF6FF",
    title: "Water Reminders",
    desc: "Hourly nudge at 10am & 3pm",
  },
  {
    key: "goalAlert",
    icon: "trophy-outline",
    iconBg: "#FEF3C7",
    title: "Goal Alerts",
    desc: "Evening reminder to check your daily goal",
  },
  {
    key: "streakAlert",
    icon: "flame-outline",
    iconBg: "#FFEDD5",
    title: "Streak Alerts",
    desc: "9pm reminder to keep your streak alive",
  },
  {
    key: "weeklyReport",
    icon: "bar-chart-outline",
    iconBg: "#F5F3FF",
    title: "Weekly Report",
    desc: "Sunday 8pm summary of your week",
  },
];

// ── Apply notification schedules based on toggles ─────────────────────────────
async function applySchedules(toggles: Record<string, boolean>) {
  if (toggles.mealReminder) {
    await scheduleDailyNotif("meal_breakfast", "🍳 Breakfast time!", "Don't forget to log your breakfast.", 8, 0);
    await scheduleDailyNotif("meal_lunch",     "🥗 Lunch time!",     "Log your lunch to stay on track.",    13, 0);
    await scheduleDailyNotif("meal_dinner",    "🍽️ Dinner time!",    "Log your dinner for the day.",        19, 0);
  } else {
    await cancelNotif("meal_breakfast");
    await cancelNotif("meal_lunch");
    await cancelNotif("meal_dinner");
  }

  if (toggles.waterReminder) {
    await scheduleDailyNotif("water_10", "💧 Stay hydrated!", "Have you had enough water today?", 10, 0);
    await scheduleDailyNotif("water_15", "💧 Water check!",   "Time for another glass of water.", 15, 0);
  } else {
    await cancelNotif("water_10");
    await cancelNotif("water_15");
  }

  if (toggles.goalAlert) {
    await scheduleDailyNotif("goal_check", "🎯 Daily Goal Check", "How are you doing with your calorie goal today?", 18, 0);
  } else {
    await cancelNotif("goal_check");
  }

  if (toggles.streakAlert) {
    await scheduleDailyNotif("streak_alert", "🔥 Keep your streak!", "Log a meal tonight to keep your streak going!", 21, 0);
  } else {
    await cancelNotif("streak_alert");
  }

  if (toggles.weeklyReport) {
    // Sunday = 1 in Expo's weekday numbering
    await Notifications.cancelScheduledNotificationAsync("weekly_report").catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: "weekly_report",
      content: { title: "📊 Weekly Report Ready", body: "Check your health insights for this week!", sound: true },
      trigger: { weekday: 1, hour: 20, minute: 0, repeats: true } as any,
    });
  } else {
    await cancelNotif("weekly_report");
  }
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    mealReminder: false,
    waterReminder: false,
    goalAlert: false,
    streakAlert: false,
    weeklyReport: false,
  });
  const [permGranted, setPermGranted] = useState(false);

  // Load saved prefs
  useEffect(() => {
    const load = async () => {
      const granted = await requestPermission();
      setPermGranted(granted);
      const saved = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
      if (saved) setToggles(JSON.parse(saved));
    };
    load();
  }, []);

  const toggle = async (key: string) => {
    if (!permGranted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to use this feature.",
          [{ text: "OK" }]
        );
        return;
      }
      setPermGranted(true);
    }

    const updated = { ...toggles, [key]: !toggles[key] };
    setToggles(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    await applySchedules(updated);
  };

  const disableAll = async () => {
    const all = Object.fromEntries(SETTINGS.map((s) => [s.key, false]));
    setToggles(all);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const testNotif = async () => {
    if (!permGranted) { Alert.alert("Enable notifications first"); return; }
    await Notifications.scheduleNotificationAsync({
      content: { title: "🔔 Test Notification", body: "BiteRight notifications are working!", sound: true },
      trigger: { seconds: 2 } as any,
    });
    Alert.alert("Test sent", "You'll receive a notification in 2 seconds.");
  };

  const enabledCount = Object.values(toggles).filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Permission banner */}
        {!permGranted && (
          <TouchableOpacity style={styles.permBanner} onPress={requestPermission}>
            <Ionicons name="alert-circle-outline" size={18} color="#D97706" />
            <Text style={styles.permText}>Tap to enable notification permissions</Text>
          </TouchableOpacity>
        )}

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
                  value={toggles[s.key] ?? false}
                  onValueChange={() => toggle(s.key)}
                  trackColor={{ false: "#E5E7EB", true: GREEN }}
                  thumbColor="#fff"
                />
              </View>
              {i < SETTINGS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Test button */}
        <TouchableOpacity style={styles.testBtn} onPress={testNotif} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={18} color={GREEN} />
          <Text style={styles.testBtnText}>Send Test Notification</Text>
        </TouchableOpacity>

        {/* Disable all */}
        <TouchableOpacity style={styles.disableBtn} onPress={disableAll} activeOpacity={0.8}>
          <Ionicons name="notifications-off-outline" size={18} color="#6B7280" />
          <Text style={styles.disableBtnText}>Disable All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    position: "relative", marginTop: 48, marginBottom: 8, paddingHorizontal: 16,
  },
  backButton: { position: "absolute", left: 16, padding: 8, zIndex: 1 },
  header:     { fontSize: 22, fontWeight: "700", color: "#222", textAlign: "center" },
  scroll:     { padding: 16, paddingBottom: 40 },

  permBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF3C7", padding: 14, borderRadius: 14, marginBottom: 14,
  },
  permText: { flex: 1, fontSize: 13, color: "#92400E", fontWeight: "600" },

  summaryPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#ECFDF5", alignSelf: "flex-start",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 16,
  },
  summaryText: { fontSize: 13, color: GREEN, fontWeight: "600" },

  card: {
    backgroundColor: "#fff", borderRadius: 18, overflow: "hidden", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  row:     { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E" },
  rowDesc:  { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  divider:  { height: 1, backgroundColor: "#F3F4F6", marginLeft: 68 },

  testBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: GREEN,
    backgroundColor: "#ECFDF5", marginBottom: 12,
  },
  testBtnText: { fontSize: 14, color: GREEN, fontWeight: "600" },

  disableBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff",
  },
  disableBtnText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
});
