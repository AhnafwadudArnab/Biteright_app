import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HealthGoalScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Health & Goals</Text>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.card}>
          <Text style={styles.item}>🎯 Goal: Weight Loss</Text>
          <Text style={styles.item}>⚖ Target Weight: 65 kg</Text>
          <Text style={styles.item}>🔥 Daily Calories: 2000 kcal</Text>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
    minWidth: 260,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  item: {
    fontSize: 16,
    marginVertical: 4,
  },
});
