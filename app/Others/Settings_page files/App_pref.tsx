import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export default function AppPreferencesScreen() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#222" : "#F9F9F9" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>App Preferences</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.label, { color: darkMode ? "#fff" : "#222" }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
    position: "relative",
    marginTop: 40,
    paddingHorizontal: 16,
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
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  item: {
    fontSize: 15,
  },
});
