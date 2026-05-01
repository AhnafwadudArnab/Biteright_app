import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useCalories } from "../CaloriesContext";
import { cachedFetch } from "../lib/apiCache";
import { SERVER_URL } from "../serverhost";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WeightEntry { id: string; weight_kg: number; recorded_at: string }
interface NutritionSummary { total_calories: number; protein_g: number; carbs_g: number; fats_g: number }

const NUTRIENTS = [
  { key: "total_calories" as const, label: "Calories (kcal)", color: "#22C55E", maxKey: "calories" },
  { key: "protein_g"      as const, label: "Protein (g)",     color: "#3B82F6", maxKey: "protein"  },
  { key: "carbs_g"        as const, label: "Carbs (g)",       color: "#F97316", maxKey: "carbs"    },
  { key: "fats_g"         as const, label: "Fat (g)",         color: "#A855F7", maxKey: "fat"      },
];

// ── Animated progress bar ─────────────────────────────────────────────────────
function AnimatedProgressBar({ label, value, max, color, delay }: { label: string; value: number; max: number; color: string; delay: number }) {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 700, delay, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{Math.round(value)} / {max}</Text>
      </View>
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }), backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── Weight row ────────────────────────────────────────────────────────────────
function WeightRow({ day, weight, delay, maxW, minW }: { day: string; weight: number; delay: number; maxW: number; minW: number }) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const range = maxW - minW || 1;
  const barPct = ((weight - minW) / range) * 60 + 20;

  return (
    <Animated.View style={[styles.weekRow, { transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
      <Text style={styles.weekDay}>{day}</Text>
      <View style={styles.barChartTrack}>
        <View style={[styles.barChartFill, { width: `${barPct}%` }]} />
      </View>
      <Text style={styles.weekWeight}>{weight} kg</Text>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const { token } = useAuth();
  const { goal, consumed } = useCalories();

  const [loading, setLoading] = useState(true);
  const [nutrition, setNutrition] = useState<NutritionSummary>({ total_calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 });
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [profileHeight, setProfileHeight] = useState(170);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch nutrition summary, weight history, AND today's meals in parallel
        const [nutData, wtData, mealsData] = await Promise.all([
          cachedFetch(
            `nutrition_today_${token}`,
            async () => {
              const res = await fetch(`${SERVER_URL}/api/progress/nutrition/today`, { headers: authHeaders() });
              return res.ok ? res.json() : null;
            },
            30_000
          ),
          cachedFetch(
            `weight_history_${token}`,
            async () => {
              const res = await fetch(`${SERVER_URL}/api/progress/weight`, { headers: authHeaders() });
              return res.ok ? res.json() : [];
            },
            60_000
          ),
          // Also fetch today's meals to calculate real calorie total
          cachedFetch(
            `meals_today_${token}`,
            async () => {
              if (!user?.id) return [];
              const res = await fetch(`${SERVER_URL}/api/meals/${user.id}`, { headers: authHeaders() });
              return res.ok ? res.json() : [];
            },
            30_000
          ).catch(() => []),
        ]);

        // Calculate calories from meals if nutrition summary is empty
        const mealsCalories = Array.isArray(mealsData)
          ? mealsData.reduce((sum: number, m: any) => {
              const itemCals = Array.isArray(m.meal_items)
                ? m.meal_items.reduce((s: number, i: any) => s + (i.calories || 0), 0)
                : m.kcal || 0;
              return sum + itemCals;
            }, 0)
          : 0;

        // Priority: live consumed > DB nutrition summary > meals calculation
        const effectiveCalories = consumed > 0
          ? consumed
          : (nutData?.total_calories ?? 0) > 0
            ? nutData.total_calories
            : mealsCalories;

        if (nutData) {
          setNutrition({ ...nutData, total_calories: effectiveCalories });
        } else {
          setNutrition((n) => ({ ...n, total_calories: effectiveCalories }));
        }

        if (Array.isArray(wtData)) setWeightHistory(wtData);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [authHeaders, consumed, token]);

  // Goals for progress bars
  const GOALS = { calories: goal, protein: 120, carbs: 250, fat: 70 };

  const maxW = weightHistory.length ? Math.max(...weightHistory.map((w) => w.weight_kg)) : 0;
  const minW = weightHistory.length ? Math.min(...weightHistory.map((w) => w.weight_kg)) : 0;
  const latestWeight = weightHistory[0]?.weight_kg ?? 0;

  // Fetch profile height for accurate BMI
  useEffect(() => {
    if (!token) return;
    cachedFetch(`profile_height_${token}`, async () => {
      const res = await fetch(`${SERVER_URL}/api/profile`, { headers: authHeaders() });
      return res.ok ? res.json() : null;
    }, 120_000).then((d) => {
      if (d?.height_cm && d.height_cm > 0) setProfileHeight(d.height_cm);
    }).catch(() => {});
  }, [token, authHeaders]);

  const bmiNum = latestWeight > 0 && profileHeight > 0
    ? latestWeight / ((profileHeight / 100) * (profileHeight / 100))
    : 0;
  const bmi = bmiNum > 0 ? bmiNum.toFixed(1) : "—";
  const bmiStatus = bmiNum > 0
    ? bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese"
    : "—";

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const summaryScale = useRef(new Animated.Value(0.85)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const adviceOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(summaryScale, { toValue: 1, friction: 6, tension: 80, delay: 200, useNativeDriver: true }),
      Animated.timing(summaryOpacity, { toValue: 1, duration: 300, delay: 200, useNativeDriver: true }),
      Animated.timing(adviceOpacity, { toValue: 1, duration: 600, delay: 1600, useNativeDriver: true }),
    ]).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

      <View style={styles.backButtonWrapper}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/MainHomePage")} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#222" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }}>
        <Text style={styles.title}>Your Progress</Text>
      </Animated.View>

      {/* Summary Card */}
      <Animated.View style={[styles.summaryCard, { opacity: summaryOpacity, transform: [{ scale: summaryScale }] }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Current Weight</Text>
          <Text style={styles.summaryValue}>{latestWeight > 0 ? `${latestWeight} kg` : "—"}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>BMI</Text>
          <Text style={styles.summaryValue}>
            {bmi} <Text style={styles.summaryBadge}>({bmiStatus})</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Daily Nutrition */}
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionAccentBar, { backgroundColor: "#22C55E" }]} />
        <Text style={styles.sectionTitle}>Today's Nutrition</Text>
      </View>
      <View style={styles.card}>
        <AnimatedProgressBar label="Calories (kcal)" value={nutrition.total_calories} max={GOALS.calories} color="#22C55E" delay={500} />
        <AnimatedProgressBar label="Protein (g)"     value={nutrition.protein_g}      max={GOALS.protein}  color="#3B82F6" delay={650} />
        <AnimatedProgressBar label="Carbs (g)"       value={nutrition.carbs_g}        max={GOALS.carbs}    color="#F97316" delay={800} />
        <AnimatedProgressBar label="Fat (g)"         value={nutrition.fats_g}         max={GOALS.fat}      color="#A855F7" delay={950} />
      </View>

      {/* Weekly Weight Trend */}
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionAccentBar, { backgroundColor: "#3B82F6" }]} />
        <Text style={styles.sectionTitle}>Weekly Weight Trend</Text>
      </View>
      <View style={styles.card}>
        {weightHistory.length === 0 ? (
          <Text style={styles.emptyText}>No weight entries yet. Log your weight from your profile.</Text>
        ) : (
          [...weightHistory].reverse().map((item, index) => (
            <WeightRow
              key={item.id}
              day={new Date(item.recorded_at).toLocaleDateString("en-US", { weekday: "short" })}
              weight={item.weight_kg}
              delay={500 + index * 150}
              maxW={maxW}
              minW={minW}
            />
          ))
        )}
      </View>

      {/* Doctor Recommendation */}
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionAccentBar, { backgroundColor: "#A855F7" }]} />
        <Text style={styles.sectionTitle}>Doctor's Recommendation</Text>
      </View>
      <Animated.View style={[styles.adviceCard, { opacity: adviceOpacity }]}>
        {bmiStatus === "Normal" || bmiStatus === "—" ? (
          <>
            <AdviceRow text="Your BMI is within the normal range." />
            <AdviceRow text="Maintain calorie balance and protein intake." />
            <AdviceRow text="Continue light exercise and hydration." />
          </>
        ) : bmiStatus === "Underweight" ? (
          <>
            <AdviceRow text="Increase calorie intake with nutrient-dense foods." />
            <AdviceRow text="Focus on protein and healthy fats." />
            <AdviceRow text="Consult a nutritionist for a weight gain plan." />
          </>
        ) : bmiStatus === "Overweight" ? (
          <>
            <AdviceRow text="Reduce portion sizes and avoid processed foods." />
            <AdviceRow text="Increase physical activity to 30 min/day." />
            <AdviceRow text="Focus on high-fiber, low-calorie meals." />
          </>
        ) : (
          <>
            <AdviceRow text="Consult a doctor for a medically supervised plan." />
            <AdviceRow text="Aim for a calorie deficit of 500 kcal/day." />
            <AdviceRow text="Prioritize walking and low-impact exercise." />
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function AdviceRow({ text }: { text: string }) {
  return (
    <View style={styles.adviceRow}>
      <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
      <Text style={styles.adviceText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  backButtonWrapper: { marginTop: 52, marginBottom: 8 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  title: { textAlign: "center", fontSize: 26, fontWeight: "700", color: "#0F172A", marginBottom: 20, letterSpacing: -0.5 },
  summaryCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 18, padding: 20, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, alignItems: "center" },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#E2E8F0", marginHorizontal: 8 },
  summaryLabel: { color: "#64748B", fontSize: 13, marginBottom: 4, fontWeight: "500" },
  summaryValue: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  summaryBadge: { fontSize: 14, fontWeight: "500", color: "#22C55E" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 8 },
  sectionAccentBar: { width: 4, height: 20, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  progressContainer: { marginBottom: 16 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: "600", color: "#334155" },
  progressValue: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  progressBg: { height: 12, backgroundColor: "#F1F5F9", borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  weekRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  weekDay: { fontSize: 14, fontWeight: "600", color: "#334155", width: 36 },
  barChartTrack: { flex: 1, height: 10, backgroundColor: "#F1F5F9", borderRadius: 5, overflow: "hidden", marginHorizontal: 12 },
  barChartFill: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 5 },
  weekWeight: { fontSize: 14, fontWeight: "700", color: "#0F172A", width: 56, textAlign: "right" },
  emptyText: { textAlign: "center", color: "#9CA3AF", fontSize: 13, paddingVertical: 16 },
  adviceCard: { backgroundColor: "#F0FDF4", borderRadius: 18, padding: 18, marginBottom: 40, borderWidth: 1, borderColor: "#BBF7D0" },
  adviceRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  adviceText: { flex: 1, fontSize: 14, lineHeight: 20, color: "#166534", fontWeight: "500" },
});
