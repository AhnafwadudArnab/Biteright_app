import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Droplets, Edit2, Minus, RotateCcw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const GLASS_ML = 250;
const CIRCLE_SIZE = 200;

// ─── Animated glass log item ────────────────────────────────────────────────
const GlassItem: React.FC<{ index: number; waterConsumed: number }> = ({
  index,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.logItem,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.logIconWrap}>
        <Droplets size={16} color="#0891b2" />
      </View>
      <Text style={styles.logText}>Glass {index + 1}</Text>
      <Text style={styles.time}>
        {8 + index}:{(index * 7) % 60 < 10 ? "0" : ""}
        {(index * 7) % 60} AM
      </Text>
    </Animated.View>
  );
};

// ─── Animated press button ───────────────────────────────────────────────────
const AnimatedPressable: React.FC<{
  onPress: () => void;
  style: object;
  children: React.ReactNode;
}> = ({ onPress, style, children }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const WaterIntake: React.FC = () => {
  // ── existing state (unchanged) ──
  const [waterConsumed, setWaterConsumed] = useState<number>(3);
  const [waterTarget, setWaterTarget] = useState<number>(8);

  const percentage = Math.min((waterConsumed / waterTarget) * 100, 100);

  // existing fillAnim (unchanged)
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // existing fillHeight interpolation (unchanged)
  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, CIRCLE_SIZE],
  });

  // ── new animation refs ──
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-24)).current;
  const countBounce = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const prevConsumed = useRef(waterConsumed);

  // header mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.4)),
      }),
    ]).start();
  }, []);

  // pulsing ring loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // bounce count when waterConsumed changes
  useEffect(() => {
    if (prevConsumed.current !== waterConsumed) {
      prevConsumed.current = waterConsumed;
      Animated.sequence([
        Animated.spring(countBounce, {
          toValue: 1.35,
          useNativeDriver: true,
          speed: 40,
          bounciness: 12,
        }),
        Animated.spring(countBounce, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();
    }
  }, [waterConsumed]);

  // animated progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration: 700,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [percentage]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient colors={["#E0F7FA", "#F8FAF9"]} style={styles.bg}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.headerRow,
            {
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/MainHomePage")}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#0891b2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Water Intake</Text>
          <View style={styles.backBtn} />
        </Animated.View>

        {/* ── Main card ── */}
        <Animated.View
          style={[
            styles.cardShadow,
            { opacity: headerFade, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <LinearGradient
            colors={["#22d3ee", "#38bdf8", "#2dd4bf"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* pulsing ring + circle */}
            <View style={styles.circleWrapper}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.circle}>
                {/* wave fill */}
                <Animated.View
                  style={[styles.waterFill, { height: fillHeight }]}
                />
                {/* center content */}
                <View style={styles.centerText}>
                  <Droplets size={36} color="white" />
                  <Animated.Text
                    style={[
                      styles.count,
                      { transform: [{ scale: countBounce }] },
                    ]}
                  >
                    {waterConsumed}
                  </Animated.Text>
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
        </Animated.View>

        {/* ── Stats row ── */}
        <BlurView intensity={60} tint="light" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{waterConsumed * GLASS_ML}</Text>
              <Text style={styles.statLabel}>ml consumed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{waterTarget * GLASS_ML}</Text>
              <Text style={styles.statLabel}>ml target</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#0891b2" }]}>
                {Math.round(percentage)}%
              </Text>
              <Text style={styles.statLabel}>complete</Text>
            </View>
          </View>
          {/* animated progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth },
                percentage >= 100 && { backgroundColor: "#10b981" },
              ]}
            />
          </View>
        </BlurView>

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <AnimatedPressable
            style={styles.addBtn}
            onPress={() =>
              setWaterConsumed((p) => Math.min(p + 1, waterTarget))
            }
          >
            <Droplets size={20} color="#0e7490" />
            <Text style={styles.addText}>Add Water</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.removeBtn}
            onPress={() => setWaterConsumed((p) => Math.max(p - 1, 0))}
          >
            <Minus size={20} color="#4b5563" />
            <Text style={styles.removeText}>Remove</Text>
          </AnimatedPressable>
        </View>

        {/* ── Daily Goal card ── */}
        <BlurView intensity={60} tint="light" style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Daily Goal</Text>
            <Edit2 size={16} color="#0891b2" />
          </View>
          <Text style={styles.goalText}>
            Current goal:{" "}
            <Text style={styles.bold}>{waterTarget} glasses</Text> (
            {waterTarget * GLASS_ML}ml)
          </Text>
        </BlurView>

        {/* ── Log ── */}
        <BlurView intensity={60} tint="light" style={styles.logCard}>
          <Text style={styles.logTitle}>Today's Log</Text>

          {waterConsumed === 0 ? (
            <Text style={styles.emptyLog}>No water logged yet today</Text>
          ) : (
            Array.from({ length: waterConsumed }).map((_, i) => (
              <GlassItem key={i} index={i} waterConsumed={waterConsumed} />
            ))
          )}
        </BlurView>

        {/* ── Reset ── */}
        <AnimatedPressable
          style={styles.resetBtn}
          onPress={() => setWaterConsumed(0)}
        >
          <RotateCcw size={18} color="#6b7280" />
          <Text style={styles.resetText}>Reset Today</Text>
        </AnimatedPressable>
      </ScrollView>
    </LinearGradient>
  );
};

export default WaterIntake;

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 48,
  },

  // header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 48,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0891b2",
    letterSpacing: 0.3,
  },

  // main card
  cardShadow: {
    borderRadius: 32,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  card: {
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
  },

  // circle
  circleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pulseRing: {
    position: "absolute",
    width: CIRCLE_SIZE + 24,
    height: CIRCLE_SIZE + 24,
    borderRadius: (CIRCLE_SIZE + 24) / 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.42)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  centerText: {
    alignItems: "center",
  },
  count: {
    fontSize: 42,
    color: "white",
    fontWeight: "800",
    lineHeight: 48,
  },
  subCount: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  statusText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  mlText: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    fontSize: 13,
  },

  // stats card
  statsCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(8,145,178,0.12)",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0891b2",
    borderRadius: 99,
  },

  // actions
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addText: {
    color: "#0e7490",
    fontWeight: "600",
    fontSize: 15,
  },
  removeBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  removeText: {
    color: "#4b5563",
    fontWeight: "600",
    fontSize: 15,
  },

  // goal card
  goalCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  goalText: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
    color: "#0891b2",
  },

  // log card
  logCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  logTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  logText: {
    flex: 1,
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  time: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "400",
  },
  emptyLog: {
    textAlign: "center",
    color: "#9ca3af",
    paddingVertical: 24,
    fontSize: 14,
  },

  // reset
  resetBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  resetText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 15,
  },
});
