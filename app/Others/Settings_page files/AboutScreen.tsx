import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* cross icon to go back */}
        <Ionicons
          name="close"
          size={32}
          color="#333"
          style={{ position: "absolute", top: 20, right: 10, zIndex: 1 }}
          onPress={() => {
            router.back();
          }}
        />
      {/* App Logo / Icon */}
      <View style={styles.header}>
        <Ionicons name="leaf-outline" size={64} color="#4CAF50" />
        <Text style={styles.appName}>BiteRight</Text>
        <Text style={styles.tagline}>
          Eat Smart. Live Better.
        </Text>
      </View>

      {/* About Description */}
      <View style={styles.card}>
        <Text style={styles.title}>About BiteRight</Text>
        <Text style={styles.text}>
          BiteRight is a smart diet planning and nutrition tracking app designed
          to help you make healthier food choices. Using BMI, goals, and AI-based
          recommendations, BiteRight creates personalized meal plans tailored
          just for you.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.card}>
        <Text style={styles.title}>Key Features</Text>

        <Text style={styles.listItem}>• BMI-based diet plans</Text>
        <Text style={styles.listItem}>• Personalized calorie tracking</Text>
        <Text style={styles.listItem}>• AI-powered meal recommendations</Text>
        <Text style={styles.listItem}>• Doctor-recommended guidelines</Text>
        <Text style={styles.listItem}>• Progress & health insights</Text>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <Text style={styles.title}>App Information</Text>
        <Text style={styles.text}>Version: 1.0.0</Text>
        <Text style={styles.text}>Developed by: BiteRight Team</Text>
        <Text style={styles.text}>© 2026 BiteRight. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    paddingHorizontal: 16,
    marginTop: 40,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    color: "#2E7D32",
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#222",
  },
  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  listItem: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
});

