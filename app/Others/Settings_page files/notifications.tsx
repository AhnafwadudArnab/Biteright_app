import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
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
});

