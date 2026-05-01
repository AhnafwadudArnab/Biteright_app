import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GREEN = "#3BB273";

type PrefItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  desc: string;
};

const PREFS: PrefItem[] = [
  {
    key: "darkMode",
    icon: "moon-outline",
    iconBg: "#F5F3FF",
    title: "Dark Mode",
    desc: "Switch to a darker color scheme",
  },
  {
    key: "notifications",
    icon: "notifications-outline",
    iconBg: "#FEF3C7",
    title: "Push Notifications",
    desc: "Allow app to send notifications",
  },
  {
    key: "haptics",
    icon: "phone-portrait-outline",
    iconBg: "#ECFDF5",
    title: "Haptic Feedback",
    desc: "Vibrate on button presses",
  },
  {
    key: "analytics",
    icon: "bar-chart-outline",
    iconBg: "#EFF6FF",
    title: "Usage Analytics",
    desc: "Help improve the app anonymously",
  },
];

const STORAGE_KEY = "app_preferences";

export default function AppPreferencesScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    darkMode: false,
    notifications: true,
    haptics: true,
    analytics: false,
  });

  // Load saved prefs
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val) setPrefs(JSON.parse(val));
      })
      .catch(() => {});
  }, []);

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});

    if (key === "darkMode") {
      // Dark mode note — full theming requires a ThemeContext
      // This persists the preference so it can be read at app startup
      Alert.alert(
        "Dark Mode",
        updated.darkMode
          ? "Dark mode preference saved. Restart the app to apply."
          : "Light mode preference saved. Restart the app to apply."
      );
    }
  };

  const bg = prefs.darkMode ? "#1C1C1E" : "#F9F9F9";
  const cardBg = prefs.darkMode ? "#2C2C2E" : "#fff";
  const textColor = prefs.darkMode ? "#F2F2F7" : "#1C1C1E";
  const subColor = prefs.darkMode ? "#8E8E93" : "#9CA3AF";

  return (
    <View style={[{ flex: 1 }, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: textColor }]}>App Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {PREFS.map((p, i) => (
            <View key={p.key}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: p.iconBg }]}>
                  <Ionicons name={p.icon} size={20} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: textColor }]}>{p.title}</Text>
                  <Text style={[styles.rowDesc, { color: subColor }]}>{p.desc}</Text>
                </View>
                <Switch
                  value={prefs[p.key]}
                  onValueChange={() => toggle(p.key)}
                  trackColor={{ false: "#E5E7EB", true: GREEN }}
                  thumbColor="#fff"
                />
              </View>
              {i < PREFS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: prefs.darkMode ? "#3A3A3C" : "#F3F4F6" }]} />
              )}
            </View>
          ))}
        </View>

        {/* App version info */}
        <View style={[styles.versionCard, { backgroundColor: cardBg }]}>
          <Ionicons name="information-circle-outline" size={18} color={GREEN} />
          <Text style={[styles.versionText, { color: subColor }]}>
            BiteRight v1.0.0
          </Text>
        </View>
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
  backButton: { position: "absolute", left: 16, padding: 8, zIndex: 1 },
  header: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  scroll: { padding: 16, paddingBottom: 40 },

  card: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
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
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowDesc:  { fontSize: 12, marginTop: 2 },
  divider:  { height: 1, marginLeft: 68 },

  versionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    justifyContent: "center",
  },
  versionText: { fontSize: 13 },
});
