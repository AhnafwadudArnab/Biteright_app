import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function PrivacySecurityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Privacy & Security</Text>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.item}>🔒 Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={[styles.item, { color: "red" }]}>
          🗑 Delete Account
        </Text>
      </TouchableOpacity>
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
