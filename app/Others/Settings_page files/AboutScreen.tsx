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

export default function AboutScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>About</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* App Logo & Name Centered */}
        <View style={styles.logoBlock}>
          <Ionicons name="leaf-outline" size={64} color="#4CAF50" />
          <Text style={styles.appName}>BiteRight</Text>
        </View>
        <Text style={styles.tagline}>Eat Smart. Live Better.</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    paddingHorizontal: 16,
    marginTop: 40,
  },
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
  logoBlock: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
    color: "#2E7D32",
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
    marginBottom: 16,
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

