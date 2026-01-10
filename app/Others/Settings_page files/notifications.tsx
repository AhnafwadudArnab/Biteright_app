import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function NotificationsScreen() {
  const [meals, setMeals] = React.useState(true);
  const [water, setWater] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Meal Reminders</Text>
        <Switch value={meals} onValueChange={setMeals} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Water Reminder</Text>
        <Switch value={water} onValueChange={setWater} />
      </View>
    </View>
  );
}const styles = StyleSheet.create({
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

