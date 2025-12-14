import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Droplets, Edit2, Minus, RotateCcw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GLASS_ML = 250;

const WaterIntake: React.FC = () => {
  const [waterConsumed, setWaterConsumed] = useState<number>(3);
  const [waterTarget, setWaterTarget] = useState<number>(8);

  const percentage = Math.min((waterConsumed / waterTarget) * 100, 100);

  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Calculate the fill height in pixels instead of percentage strings
  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 180], // 180 is the height of the circle
  });

  return (
    //header container
    <ScrollView style={styles.container}>
      {/* Header Container */}
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{ marginTop: 35 }}
      >
        <Ionicons name="arrow-back" size={24} color="#222" />
      </TouchableOpacity>
      <View style={{ marginBottom: 17, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#0891b2",
            textAlign: "center",
          }}
        >
          Water Intake
        </Text>
      </View>

      {/* Main Card */}
      <LinearGradient
        colors={["#22d3ee", "#38bdf8", "#2dd4bf"]}
        style={styles.card}
      >
        {/* Circle */}
        <View style={styles.circleWrapper}>
          <View style={styles.circle}>
            <Animated.View
              style={[
                styles.waterFill,
                {
                  height: fillHeight,
                },
              ]}
            />
            <View style={styles.centerText}>
              <Droplets size={52} color="white" />
              <Text style={styles.count}>{waterConsumed}</Text>
              <Text style={styles.subCount}>/ {waterTarget} glasses</Text>
            </View>
          </View>
        </View>

        <Text style={styles.statusText}>
          {waterConsumed >= waterTarget
            ? "🎉 Great job! Goal achieved!"
            : `${waterTarget - waterConsumed} more to go`}
        </Text>
        <Text style={styles.mlText}>
          ≈ {waterConsumed * GLASS_ML}ml / {waterTarget * GLASS_ML}ml
        </Text>
      </LinearGradient>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.addBtn}
          onPress={() => setWaterConsumed((p) => Math.min(p + 1, waterTarget))}
        >
          <Droplets size={20} color="#0e7490" />
          <Text style={styles.addText}>Add Water</Text>
        </Pressable>

        <Pressable
          style={styles.removeBtn}
          onPress={() => setWaterConsumed((p) => Math.max(p - 1, 0))}
        >
          <Minus size={20} color="#4b5563" />
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>

      {/* Daily Goal */}
      <BlurView intensity={30} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Daily Goal</Text>
          <Edit2 size={16} color="#0891b2" />
        </View>
        <Text style={styles.goalText}>
          Current goal: <Text style={styles.bold}>{waterTarget} glasses</Text> (
          {waterTarget * GLASS_ML}ml)
        </Text>
      </BlurView>

      {/* Log */}
      <View style={styles.logCard}>
        <Text style={styles.logTitle}>Today&apos;s Log</Text>

        {waterConsumed === 0 ? (
          <Text style={styles.emptyLog}>No water logged yet today</Text>
        ) : (
          Array.from({ length: waterConsumed }).map((_, i) => (
            <View key={i} style={styles.logItem}>
              <Droplets size={16} color="#06b6d4" />
              <Text style={styles.logText}>Glass {i + 1}</Text>
              <Text style={styles.time}>
                {8 + i}:{(i * 7) % 60 < 10 ? "0" : ""}
                {(i * 7) % 60} AM
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Reset */}
      <Pressable style={styles.resetBtn} onPress={() => setWaterConsumed(0)}>
        <RotateCcw size={18} />
        <Text style={styles.resetText}>Reset Today</Text>
      </Pressable>
    </ScrollView>
  );
};

export default WaterIntake;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  card: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },

  circleWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  centerText: {
    alignItems: "center",
  },

  count: {
    fontSize: 36,
    color: "white",
    fontWeight: "700",
  },

  subCount: {
    color: "white",
    opacity: 0.9,
  },

  statusText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
  },

  mlText: {
    color: "white",
    opacity: 0.9,
    textAlign: "center",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },

  addBtn: {
    flex: 1,
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  addText: {
    color: "#0e7490",
  },

  removeBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 999,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  removeText: {
    color: "#4b5563",
  },

  goalCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  goalText: {
    color: "#374151",
  },

  bold: {
    fontWeight: "600",
  },

  logCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
  },

  logTitle: {
    fontSize: 18,
    marginBottom: 12,
  },

  logItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  logText: {
    flex: 1,
    color: "#4b5563",
  },

  time: {
    color: "#9ca3af",
    fontSize: 12,
  },

  emptyLog: {
    textAlign: "center",
    color: "#9ca3af",
    paddingVertical: 20,
  },

  resetBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 40,
  },

  resetText: {
    color: "#374151",
  },
});
