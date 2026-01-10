import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UserProfile() {
  const navigation = useNavigation();

  // Dummy user data
  const user = {
    name: "Ahnaf Wadud Arnab",
    email: "ahnaf@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    age: 22,
    gender: "Male",
    height: 175,
    weight: 71.4,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("../(tabs)/MainHomePage")}
      >
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>
          Age: <Text style={styles.infoValue}>{user.age}</Text>
        </Text>
        <Text style={styles.infoLabel}>
          Gender: <Text style={styles.infoValue}>{user.gender}</Text>
        </Text>
        <Text style={styles.infoLabel}>
          Height: <Text style={styles.infoValue}>{user.height} cm</Text>
        </Text>
        <Text style={styles.infoLabel}>
          Weight: <Text style={styles.infoValue}>{user.weight} kg</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push("/Others/Settings")}
      >
        <Ionicons name="settings-outline" size={20} color="#2563EB" />
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  backButton: { marginTop: 10, marginBottom: 10, alignSelf: "flex-start" },
  avatarContainer: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { fontSize: 15, color: "#64748B", marginBottom: 10 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
    elevation: 2,
  },
  infoLabel: { fontSize: 16, color: "#334155", marginBottom: 8 },
  infoValue: { fontWeight: "600", color: "#2563EB" },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#E0E7FF",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  settingsText: {
    marginLeft: 8,
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 16,
  },
});
