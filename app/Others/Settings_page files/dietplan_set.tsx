import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function DietPreferencesScreen() {
  const [vegetarian, setVegetarian] = React.useState(false);
  const [vegan, setVegan] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Diet Preferences</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vegetarian</Text>
        <Switch value={vegetarian} onValueChange={setVegetarian} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Vegan</Text>
        <Switch value={vegan} onValueChange={setVegan} />
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
