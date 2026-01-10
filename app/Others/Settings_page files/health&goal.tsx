import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HealthGoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health & Goals</Text>

      <View style={styles.card}>
        <Text style={styles.item}>🎯 Goal: Weight Loss</Text>
        <Text style={styles.item}>⚖ Target Weight: 65 kg</Text>
        <Text style={styles.item}>🔥 Daily Calories: 2000 kcal</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
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
