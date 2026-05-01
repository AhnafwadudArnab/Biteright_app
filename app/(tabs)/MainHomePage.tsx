import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useCalories } from "../CaloriesContext";

const GREEN = "#3BB273";
const DARK = "#0F172A";

export default function MainHomePage() {
  const { goal, consumed, loadUserGoal } = useCalories();
  const { user } = useAuth();
  const remaining = Math.max(0, goal - consumed);
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  // Entrance animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardScale = useRef(new Animated.Value(0.92)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Load this user's saved calorie goal on mount
  useEffect(() => {
    if (user?.id) loadUserGoal(user.id);
  }, [user?.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 7, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <View style={styles.root}>
      {/* Background decoration */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View>
            <Text style={styles.greeting}>Good day, {firstName} 👋</Text>
            <Text style={styles.subtitle}>Let's track your nutrition today</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={DARK} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { marginLeft: 8 }]}
              onPress={() => router.push("/Others/UserProfile")}
            >
              <Ionicons name="person-circle-outline" size={22} color={DARK} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Calories Card ── */}
        <Animated.View style={[styles.caloriesCard, { transform: [{ scale: cardScale }] }]}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.caloriesTitle}>Today's Calories</Text>
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieBadgeText}>Daily Goal</Text>
            </View>
          </View>

          <View style={styles.caloriesRow}>
            <CalStat value={goal} label="Goal" color="#A7F3D0" />
            <View style={styles.calDivider} />
            <CalStat value={consumed} label="Consumed" color="#FDE68A" />
            <View style={styles.calDivider} />
            <CalStat value={remaining} label="Remaining" color="#BFDBFE" />
          </View>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressBarWidth, backgroundColor: progress > 0.9 ? "#F87171" : "#fff" },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {Math.round(progress * 100)}% of daily goal
          </Text>
        </Animated.View>

        {/* ── Diet Plan ── */}
        <SectionLabel title="Personalized Diet Plan" />
        <ActionCard
          bg="#ECFDF5"
          iconBg="#D1FAE5"
          icon={<Ionicons name="restaurant" size={22} color={GREEN} />}
          title="Your Custom Meal Plans"
          desc="AI-generated plans tailored to your goals"
          actions={[
            { label: "Generate Plan", filled: false, color: GREEN, onPress: () => router.push("../Dietplans/newPlan") },
            { label: "View Plan", filled: true, color: GREEN, onPress: () => router.push("../Dietplans/Daily_diet_plannigs") },
          ]}
        />

        {/* ── Meal Tracking ── */}
        <SectionLabel title="Meal Tracking" />
        <ActionCard
          bg="#FFFBEB"
          iconBg="#FEF3C7"
          icon={<MaterialCommunityIcons name="food-apple" size={22} color="#F59E0B" />}
          title="Track Your Meals"
          desc="Log meals and monitor your progress"
          actions={[
            { label: "+ Add Meal", filled: true, color: "#F59E0B", onPress: () => router.push("../Meal_trackers/Gen_meals") },
            { label: "View Logs", filled: false, color: "#F59E0B", onPress: () => router.push("../Meal_trackers/ViewLogs") },
          ]}
        />

        {/* ── Water Intake ── */}
        <SectionLabel title="Water Intake" />
        <ActionCard
          bg="#EFF6FF"
          iconBg="#DBEAFE"
          icon={<Ionicons name="water" size={22} color="#3B82F6" />}
          title="Track Your Hydration"
          desc="Stay hydrated and reach your daily water goals"
          actions={[
            { label: "Log Water", filled: true, color: "#3B82F6", onPress: () => router.push("../WaterFiles/waterintake") },
          ]}
        />

        {/* ── Quick Actions ── */}
        <SectionLabel title="Quick Actions" />
        <View style={styles.quickGrid}>
          <QuickBtn icon="calendar" color="#3B82F6" label="Weekly Plan" onPress={() => router.push("../Dietplans/weeklyPlans")} />
          <QuickBtn icon="bar-chart" color="#8B5CF6" label="Progress" onPress={() => router.push("../Others/Progress")} />
          <QuickBtn icon="heart" color="#EC4899" label="Health" onPress={() => router.push("../HealthInsights/HealthInsight")} />
          <QuickBtn icon="settings" color="#6B7280" label="Settings" onPress={() => router.push("../Others/Settings")} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={styles.navBar}>
        <NavBtn icon="home" label="Home" active onPress={() => {}} />
        <NavBtn icon="add-circle" label="Add" onPress={() => router.push("../Dietplans/newPlan")} />
        <NavBtn icon="stats-chart" label="Stats" onPress={() => router.push("/Others/Progress")} />
        <NavBtn icon="person" label="Profile" onPress={() => router.push("/Others/UserProfile")} />
      </View>
    </View>
  );
}

/* ── Sub-components ── */

function CalStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.calStat}>
      <View style={[styles.calStatDot, { backgroundColor: color }]} />
      <Text style={styles.calStatValue}>{isNaN(value) || value < 0 ? 0 : value}</Text>
      <Text style={styles.calStatLabel}>{label}</Text>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function ActionCard({ bg, iconBg, icon, title, desc, actions }: {
  bg: string; iconBg: string; icon: React.ReactNode;
  title: string; desc: string;
  actions: { label: string; filled: boolean; color: string; onPress: () => void }[];
}) {
  return (
    <View style={[styles.actionCard, { backgroundColor: bg }]}>
      <View style={styles.actionCardTop}>
        <View style={[styles.actionIconBox, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDesc}>{desc}</Text>
        </View>
      </View>
      <View style={styles.actionBtns}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[
              styles.actionBtn,
              a.filled
                ? { backgroundColor: a.color, borderColor: a.color }
                : { backgroundColor: "transparent", borderColor: a.color },
            ]}
            onPress={a.onPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, { color: a.filled ? "#fff" : a.color }]}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function QuickBtn({ icon, color, label, onPress }: { icon: any; color: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickIconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function NavBtn({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={active ? GREEN : "#9CA3AF"} />
      <Text style={[styles.navLabel, active && { color: GREEN }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  bgBlob1: {
    position: "absolute", top: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#D1FAE5", opacity: 0.5,
  },
  bgBlob2: {
    position: "absolute", top: 200, left: -60,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#DBEAFE", opacity: 0.35,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56 },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: "800", color: DARK },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  headerActions: { flexDirection: "row" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },

  // Calories card
  caloriesCard: {
    backgroundColor: GREEN, borderRadius: 24, padding: 20, marginBottom: 8,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  caloriesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  caloriesTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  calorieBadge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  calorieBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  caloriesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  calStat: { flex: 1, alignItems: "center" },
  calStatDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  calStatValue: { color: "#fff", fontSize: 22, fontWeight: "800" },
  calStatLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  calDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  progressBg: {
    height: 8, backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4, overflow: "hidden", marginBottom: 6,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, textAlign: "right" },

  // Section label
  sectionLabel: { fontSize: 16, fontWeight: "800", color: DARK, marginTop: 20, marginBottom: 10 },

  // Action card
  actionCard: { borderRadius: 20, padding: 16, marginBottom: 4 },
  actionCardTop: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  actionIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actionTitle: { fontSize: 15, fontWeight: "700", color: DARK },
  actionDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  actionBtns: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, alignItems: "center",
  },
  actionBtnText: { fontSize: 13, fontWeight: "700" },

  // Quick actions
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickBtn: {
    width: "46%", backgroundColor: "#fff", borderRadius: 18,
    padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  quickIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: "600", color: DARK },

  // Bottom nav
  navBar: {
    flexDirection: "row", backgroundColor: "#fff",
    paddingVertical: 10, paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: "#F1F5F9",
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  navBtn: { flex: 1, alignItems: "center", paddingVertical: 4 },
  navLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 3, fontWeight: "600" },
});
