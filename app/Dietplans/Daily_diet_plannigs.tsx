import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useCalories } from "../CaloriesContext";
import { SERVER_URL } from "../serverhost";
import { fetchMealPlan } from "./api.native";

const GREEN = "#38B36A";
const DARK  = "#0F172A";

type Meal = { type: string; name: string; kcal: number; done?: boolean };

// ── Animated meal card ────────────────────────────────────────────────────────
function MealCard({
  meal,
  index,
  onToggle,
}: {
  meal: Meal & { done: boolean };
  index: number;
  onToggle: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const MEAL_ICONS: Record<string, string> = {
    Breakfast: "sunny-outline",
    Lunch:     "restaurant-outline",
    Snack:     "nutrition-outline",
    Dinner:    "moon-outline",
  };

  return (
    <Animated.View
      style={[
        styles.mealCard,
        meal.done && styles.mealCardDone,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.mealCardLeft}>
        <View style={[styles.mealIconBox, meal.done && { backgroundColor: "#ECFDF5" }]}>
          <Ionicons
            name={(MEAL_ICONS[meal.type] || "restaurant-outline") as any}
            size={18}
            color={meal.done ? GREEN : "#94A3B8"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealType}>{meal.type}</Text>
          <Text style={[styles.mealName, meal.done && styles.mealNameDone]}>
            {meal.name}
          </Text>
          <View style={styles.kcalBadge}>
            <Ionicons name="flame-outline" size={12} color={meal.done ? "#94A3B8" : GREEN} />
            <Text style={[styles.kcalText, meal.done && { color: "#94A3B8" }]}>
              {meal.kcal} kcal
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle} style={styles.checkBtn} activeOpacity={0.7}>
        {meal.done ? (
          <Ionicons name="checkmark-circle" size={28} color={GREEN} />
        ) : (
          <Ionicons name="ellipse-outline" size={28} color="#CBD5E1" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Animated progress ring (simple arc via border trick) ──────────────────────
function ProgressRing({ pct }: { pct: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.ringContainer}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <Text style={styles.ringPct}>{Math.round(pct * 100)}%</Text>
          <Text style={styles.ringLabel}>done</Text>
        </View>
      </View>
    </View>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statPill, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Ionicons name={icon as any} size={16} color={color} />
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DietPlannerItem() {
  const { user, token } = useAuth();
  const { setGoal }     = useCalories();
  const params          = useLocalSearchParams();

  const gender =
    typeof params.gender === "string" && params.gender.toLowerCase() === "female"
      ? "female" : "male";
  const weight = typeof params.weight === "string" ? parseFloat(params.weight) : undefined;
  const height = typeof params.height === "string" ? parseFloat(params.height) : undefined;
  const bmi =
    typeof params.bmi === "string"
      ? parseFloat(params.bmi)
      : weight && height && height > 0
        ? weight / ((height / 100) ** 2)
        : 0;

  // Pre-loaded meals passed from weeklyPlans (JSON string)
  const preloadedMeals: Meal[] | null = (() => {
    try {
      if (typeof params.meals === "string" && params.meals.startsWith("[")) {
        const parsed = JSON.parse(params.meals);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return null;
  })();

  const [plan,    setPlan]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [meals,   setMeals]   = useState<(Meal & { done: boolean })[]>([]);
  const [error,   setError]   = useState<string | null>(null);

  // Header fade
  const headerAnim = useRef(new Animated.Value(0)).current;

  const savePlanToDb = async (planData: any) => {
    try {
      if (!user?.id || !token) return;
      await fetch(`${SERVER_URL}/api/mealplan/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bmi: Number(bmi.toFixed(1)),
          gender,
          category:       planData.category,
          daily_calories: planData.dailyCalories,
          doctor_focus:   planData.doctorFocus,
          meals:          planData.meals,
          source:         planData.source || "ai",
        }),
      });
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 1. Pre-loaded meals passed directly from weeklyPlans
    if (preloadedMeals) {
      const totalKcal = preloadedMeals.reduce((s: number, m: Meal) => s + (m.kcal || 0), 0);
      const fakePlan = {
        dailyCalories: typeof params.totalKcal === "string" ? Number(params.totalKcal) : totalKcal,
        category: typeof params.category === "string" ? params.category : "Your Plan",
        doctorFocus: [],
        meals: preloadedMeals,
        source: "preloaded",
      };
      setPlan(fakePlan);
      setMeals(preloadedMeals.map((m: Meal) => ({ ...m, done: false })));
      Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      setLoading(false);
      return;
    }

    // 2. BMI provided → generate fresh via AI
    if (bmi > 0) {
      fetchMealPlan(gender, Number(bmi))
        .then((data) => {
          setPlan(data);
          savePlanToDb(data);
          if (data.dailyCalories) setGoal(data.dailyCalories, user?.id);
          const count = typeof params.meals === "string" && !params.meals.startsWith("[")
            ? Number(params.meals) : data.meals.length;
          setMeals(data.meals.slice(0, count).map((m: Meal) => ({ ...m, done: false })));
          Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        })
        .catch((err) => setError(err?.message || "Failed to load plan"))
        .finally(() => setLoading(false));
      return;
    }

    // 3. No BMI → load latest saved plan from DB
    fetch(`${SERVER_URL}/api/mealplan/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No saved plan found. Please generate a plan first.");
        return res.json();
      })
      .then((data) => {
        // Normalize DB field names (daily_calories → dailyCalories, doctor_focus → doctorFocus)
        const normalized = {
          ...data,
          dailyCalories: data.dailyCalories ?? data.daily_calories ?? 2000,
          doctorFocus:   data.doctorFocus   ?? data.doctor_focus   ?? [],
        };
        setPlan(normalized);
        if (normalized.dailyCalories) setGoal(normalized.dailyCalories, user?.id);
        const mealList = normalized.meals || [];
        setMeals(mealList.map((m: Meal) => ({ ...m, done: false })));
        Animated.timing(headerAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      })
      .catch((err) => setError(err?.message || "Failed to load plan"))
      .finally(() => setLoading(false));
  }, [gender, bmi]);

  const completedKcal = meals.reduce((s, m) => s + (m.done ? m.kcal : 0), 0);
  const totalKcal     = meals.reduce((s, m) => s + m.kcal, 0);
  const pct           = totalKcal > 0 ? completedKcal / totalKcal : 0;

  const today    = new Date();
  const dayLabel = today.toLocaleString("en-US", { weekday: "long" });
  const dateStr  = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const toggleMeal = (idx: number) => {
    setMeals((prev) => prev.map((m, i) => (i === idx ? { ...m, done: !m.done } : m)));
  };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.loadingCard}>
          <Ionicons name="restaurant-outline" size={40} color={GREEN} />
          <Text style={styles.loadingTitle}>Generating your plan…</Text>
          <Text style={styles.loadingSubtitle}>AI is crafting meals for your BMI</Text>
          <View style={styles.loadingDots}>
            {[0, 1, 2].map((i) => <LoadingDot key={i} delay={i * 200} />)}
          </View>
        </View>
      </View>
    );
  }

  // ── Error ──
  if (error || !plan) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Couldn't load plan</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View style={[styles.headerRow, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("../MainHomePage")}>
          <Ionicons name="arrow-back" size={20} color={DARK} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Your Daily Diet Plan</Text>
          <Text style={styles.headerSub}>{dayLabel}, {dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.calendarBtn} onPress={() => router.push("../Dietplans/weeklyPlans")}>
          <Ionicons name="calendar-outline" size={20} color={GREEN} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Hero card ── */}
      <Animated.View style={[styles.heroCard, { opacity: headerAnim }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>Daily Calorie Target</Text>
          <Text style={styles.heroKcal}>{plan.dailyCalories} <Text style={styles.heroUnit}>kcal</Text></Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{plan.category}</Text>
          </View>
        </View>
        <ProgressRing pct={pct} />
      </Animated.View>

      {/* ── Doctor focus pills ── */}
      <View style={styles.focusRow}>
        {(plan.doctorFocus || []).map((tip: string, i: number) => (
          <View key={i} style={styles.focusPill}>
            <Ionicons name="checkmark-circle" size={13} color={GREEN} />
            <Text style={styles.focusPillText} numberOfLines={2}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <StatPill icon="flame"          label="Completed"  value={`${completedKcal} kcal`} color="#F97316" delay={200} />
        <StatPill icon="body-outline"   label="BMI"        value={bmi.toFixed(1)}           color="#3B82F6" delay={300} />
        <StatPill icon="checkmark-done" label="Meals done" value={`${meals.filter(m => m.done).length}/${meals.length}`} color={GREEN} delay={400} />
      </View>

      {/* ── Meal cards ── */}
      <Text style={styles.sectionTitle}>Today's Meals</Text>
      {meals.map((meal, idx) => (
        <MealCard key={idx} meal={meal} index={idx} onToggle={() => toggleMeal(idx)} />
      ))}

      {/* ── Nutrition summary ── */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Nutrition Summary</Text>
        {[
          { label: "Total Calories",  value: `${plan.dailyCalories} kcal` },
          { label: "Calories Done",   value: `${completedKcal} kcal` },
          { label: "Remaining",       value: `${Math.max(0, plan.dailyCalories - completedKcal)} kcal` },
          { label: "BMI Value",       value: bmi.toFixed(1) },
          { label: "BMI Category",    value: plan.category },
        ].map(({ label, value }, i) => (
          <View key={i} style={[styles.summaryRow, i < 4 && styles.summaryRowBorder]}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* ── Regenerate ── */}
      <TouchableOpacity style={styles.regenBtn} onPress={() => router.push("../Dietplans/newPlan")} activeOpacity={0.85}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.regenBtnText}>Regenerate Plan</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Loading dot ───────────────────────────────────────────────────────────────
function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -8, duration: 400, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,  duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.dot, { transform: [{ translateY: anim }] }]} />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#F8FAF9" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAF9", padding: 24 },

  // Loading
  loadingCard:     { alignItems: "center", backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  loadingTitle:    { fontSize: 18, fontWeight: "700", color: DARK, marginTop: 16, marginBottom: 6 },
  loadingSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 20 },
  loadingDots:     { flexDirection: "row", gap: 8 },
  dot:             { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },

  // Error
  errorCard:  { alignItems: "center", backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%" },
  errorTitle: { fontSize: 18, fontWeight: "700", color: DARK, marginTop: 12, marginBottom: 6 },
  errorMsg:   { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 20 },
  retryBtn:   { backgroundColor: GREEN, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { color: "#fff", fontWeight: "700" },

  // Header
  headerRow:  { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 16, gap: 12 },
  backBtn:    { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  headerTitle:{ fontSize: 18, fontWeight: "800", color: DARK },
  headerSub:  { fontSize: 12, color: "#6B7280", marginTop: 2 },
  calendarBtn:{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },

  // Hero card
  heroCard:   { backgroundColor: GREEN, borderRadius: 24, padding: 22, flexDirection: "row", alignItems: "center", marginBottom: 12, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  heroLabel:  { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 4 },
  heroKcal:   { color: "#fff", fontSize: 36, fontWeight: "800" },
  heroUnit:   { fontSize: 18, fontWeight: "500" },
  categoryBadge: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryText:  { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Progress ring
  ringContainer: { alignItems: "center", justifyContent: "center" },
  ringOuter:     { width: 72, height: 72, borderRadius: 36, borderWidth: 5, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  ringInner:     { alignItems: "center" },
  ringPct:       { color: "#fff", fontSize: 18, fontWeight: "800" },
  ringLabel:     { color: "rgba(255,255,255,0.8)", fontSize: 10 },

  // Focus pills
  focusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  focusPill: { flexDirection: "row", alignItems: "flex-start", gap: 5, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flex: 1, minWidth: "45%" },
  focusPillText: { fontSize: 11, color: "#374151", flex: 1, lineHeight: 15 },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statPill: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 16, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 13, fontWeight: "700", color: DARK },
  statLabel: { fontSize: 10, color: "#9CA3AF" },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 12 },

  // Meal card
  mealCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  mealCardDone: { backgroundColor: "#F9FAFB", shadowOpacity: 0.03 },
  mealCardLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  mealIconBox:  { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  mealType:     { fontSize: 11, color: "#9CA3AF", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  mealName:     { fontSize: 14, fontWeight: "700", color: DARK, marginBottom: 6, lineHeight: 20 },
  mealNameDone: { color: "#9CA3AF", textDecorationLine: "line-through" },
  kcalBadge:    { flexDirection: "row", alignItems: "center", gap: 4 },
  kcalText:     { fontSize: 13, fontWeight: "700", color: GREEN },
  checkBtn:     { padding: 4 },

  // Summary
  summaryCard:       { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginTop: 8, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  summaryTitle:      { fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 14 },
  summaryRow:        { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  summaryRowBorder:  { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  summaryLabel:      { fontSize: 13, color: "#6B7280" },
  summaryValue:      { fontSize: 13, fontWeight: "700", color: DARK },

  // Regen button
  regenBtn:     { backgroundColor: GREEN, borderRadius: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  regenBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
