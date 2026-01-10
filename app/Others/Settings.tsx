import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
};

const SettingItem = ({ icon, title, onPress }: SettingItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={22} color="#4CAF50" />
      <Text style={styles.itemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
      <Text style={styles.header}>Settings</Text>
      </View>

      <SettingItem icon="person-outline" title="Account" onPress={() => router.push("/Others/UserProfile")} />
      <SettingItem icon="restaurant-outline" title="Diet Preferences" onPress={() => router.push("/Others/Settings_page files/dietplan_set")} />
      <SettingItem icon="fitness-outline" title="Health & Goals" onPress={() => router.push("/Others/Settings_page files/health&goal")} />
      <SettingItem icon="notifications-outline" title="Notifications" onPress={() => router.push("/Others/Settings_page files/notifications")} />
      <SettingItem icon="color-palette-outline" title="App Preferences" onPress={() => router.push("/Others/Settings_page files/App_pref")} />
      <SettingItem icon="lock-closed-outline" title="Privacy & Security" onPress={() => router.push("/Others/Settings_page files/Privacypolicy")} />
      <SettingItem icon="information-circle-outline" title="About" onPress={() => router.push("/Others/Settings_page files/AboutScreen")} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    alignContent: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    flex: 1,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 4,
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    justifyContent: "space-between",
    elevation: 2,
  },
  itemLeft: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
