import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { SERVER_URL } from "../serverhost";

const GREEN = "#38B36A";
const DARK  = "#0F172A";

type Meal = { type: string; name: string; kcal: number };

type DayPlan = {
  label: string;
  shortDate: string;
  date: number;
  meals: Meal[];
  totalKcal: number;
  isToday: boolean;
};

// ── Animated day tab ──────────────────────────────────────────────────────────
function DayTab({
  day, active, onPress, index,
}: {
  day: DayPlan; active: boolean; onPress: () => void; index: number;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay: index * 60, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.timing(fade,  { toValue: 1, delay: index * 60, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.dayTab, active && styles.dayTabActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {day.isToday && <View style={styles.todayDot} />}
        <Text style={[styles.dayTabLabel, active && styles.dayTabTextActive]}>{day.label}</Text>
        <Text style={[styles.dayTabDate,  active && styles.dayTabTextActive]}>{day.date}</Text>
        <Text style={[styles.dayTabKcal,  active && styles.dayTabTextActive]}>{day.totalKcal}</Text>
        <Text style={[styles.dayTabKcalUnit, active && styles.dayTabTextActive]}>kcal</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Animated meal row ─────────────────────────────────────────────────────────
function MealRow({ meal, index }: { meal: Meal; index: number }) {
  const slide = useRef(new Animated.Value(40)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 350, delay: index * 80, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade,  { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [meal.name]);

  const ICONS: Record<string, string> = {
    Breakfast: "sunny-outline",
    Lunch:     "restaurant-outline",
    Snack:     "nutrition-outline",
    Dinner:    "moon-outline",
  };

  return (
    <Animated.View style={[styles.mealRow, { opacity: fade, transform: [{ translateX: slide }] }]}>
      <View style={styles.mealIconBox}>
        <Ionicons name={(ICONS[meal.type] || "restaurant-outline") as any} size={16} color={GREEN} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealType}>{meal.type}</Text>
        <Text style={styles.mealName}>{meal.name}</Text>
      </View>
      <View style={styles.kcalBadge}>
        <Text style={styles.kcalBadgeText}>{meal.kcal}</Text>
        <Text style={styles.kcalBadgeUnit}>kcal</Text>
      </View>
    </Animated.View>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────────────
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
  return <Animated.View style={[styles.dot, { transform: [{ translateY: anim }] }]} />;
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WeeklyPlans() {
  const { token } = useAuth();

  const [plan,        setPlan]        = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const headerFade = useRef(new Animated.Value(0)).current;
  const heroSlide  = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadPlan();
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroSlide,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/mealplan/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No saved plan found");
      const data = await res.json();
      setPlan(data);
    } catch (e: any) {
      setError(e.message || "Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

  // Build 7-day schedule from the saved plan (shuffle meals per day for variety)
  const weekDays: DayPlan[] = (() => {
    if (!plan?.meals?.length) return [];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Rotate meals by i positions for variety
      const rotated = [...plan.meals.slice(i % plan.meals.length), ...plan.meals.slice(0, i % plan.meals.length)];
      const totalKcal = rotated.reduce((s: number, m: Meal) => s + (m.kcal || 0), 0);
      return {
        label:     d.toLocaleString("en-US", { weekday: "short" }),
        shortDate: d.toLocaleString("en-US", { month: "short" }),
        date:      d.getDate(),
        meals:     rotated,
        totalKcal,
        isToday:   i === 0,
      };
    });
  })();

  const weeklyKcal = weekDays.reduce((s, d) => s + d.totalKcal, 0);
  const avgKcal    = weekDays.length ? Math.round(weeklyKcal / weekDays.length) : 0;

  const dateRangeStr = weekDays.length
    ? `${weekDays[0].shortDate} ${weekDays[0].date} – ${weekDays[6]?.shortDate} ${weekDays[6]?.date}`
    : "";

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.loadingCard}>
          <Ionicons name="calendar-outline" size={40} color={GREEN} />
          <Text style={styles.loadingTitle}>Loading your plan…</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => <LoadingDot key={i} delay={i * 200} />)}
          </View>
        </View>
      </View>
    );
  }

  // ── Error / no plan ──
  if (error || !plan) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.errorCard}>
          <Ionicons name="calendar-outline" size={52} color="#D1D5DB" />
          <Text style={styles.errorTitle}>No plan saved yet</Text>
          <Text style={styles.errorSub}>Generate a diet plan first to see your weekly schedule</Text>
          <TouchableOpacity style={styles.genBtn} onPress={() => router.push("../Dietplans/newPlan")}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.genBtnText}>Generate Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selected = weekDays[selectedDay];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Animated.View style={[styles.headerRow, { opacity: headerFade, transform: [{ translateY: heroSlide }] }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/(tabs)/MainHomePage")}>
            <Ionicons name="arrow-back" size={20} color={DARK} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Weekly Diet Plan</Text>
            <Text style={styles.headerSub}>{dateRangeStr}</Text>
          </View>
          <TouchableOpacity
            style={styles.dayViewBtn}
            onPress={() =>
              router.push({
                pathname: "../Dietplans/Daily_diet_plannigs",
                params: {
                  meals: JSON.stringify(selected.meals),
                  totalKcal: selected.totalKcal.toString(),
                  category: plan.category || "Your Plan",
                },
              })
            }
          >
            <Ionicons name="today-outline" size={16} color={GREEN} />
            <Text style={styles.dayViewText}>Day View</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Hero summary card ── */}
        <Animated.View style={[styles.heroCard, { opacity: headerFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Weekly Total</Text>
            <Text style={styles.heroKcal}>{weeklyKcal.toLocaleString()} <Text style={styles.heroUnit}>kcal</Text></Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{plan.category || "Your Plan"}</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatVal}>{avgKcal}</Text>
              <Text style={styles.heroStatLabel}>avg/day</Text>
            </View>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatVal}>{plan.meals?.length || 0}</Text>
              <Text style={styles.heroStatLabel}>meals/day</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Doctor focus tips ── */}
        {plan.doctor_focus?.length > 0 && (
          <Animated.View style={[styles.focusCard, { opacity: headerFade }]}>
            <Text style={styles.focusTitle}>
              <Ionicons name="medkit-outline" size={14} color={GREEN} /> Doctor's Focus
            </Text>
            {plan.doctor_focus.map((tip: string, i: number) => (
              <View key={i} style={styles.focusTip}>
                <Ionicons name="checkmark-circle" size={14} color={GREEN} />
                <Text style={styles.focusTipText}>{tip}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Day tabs ── */}
        <Text style={styles.sectionTitle}>This Week</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabsRow}
        >
          {weekDays.map((day, i) => (
            <DayTab
              key={i}
              day={day}
              active={selectedDay === i}
              onPress={() => setSelectedDay(i)}
              index={i}
            />
          ))}
        </ScrollView>

        {/* ── Selected day meals ── */}
        <View style={styles.dayMealsCard}>
          <View style={styles.dayMealsHeader}>
            <View>
              <Text style={styles.dayMealsTitle}>
                {selected.isToday ? "Today" : selected.label}, {selected.shortDate} {selected.date}
              </Text>
              <Text style={styles.dayMealsSub}>{selected.totalKcal} kcal total</Text>
            </View>
            <TouchableOpacity
              style={styles.viewDayBtn}
              onPress={() =>
                router.push({
                  pathname: "../Dietplans/Daily_diet_plannigs",
                  params: {
                    meals: JSON.stringify(selected.meals),
                    totalKcal: selected.totalKcal.toString(),
                    category: plan.category || "Your Plan",
                  },
                })
              }
            >
              <Text style={styles.viewDayBtnText}>Full View</Text>
              <Ionicons name="chevron-forward" size={14} color={GREEN} />
            </TouchableOpacity>
          </View>

          {selected.meals.map((meal, i) => (
            <MealRow key={i} meal={meal} index={i} />
          ))}
        </View>

        {/* ── Regenerate ── */}
        <TouchableOpacity
          style={styles.regenBtn}
          onPress={() => router.push("../Dietplans/newPlan")}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.regenBtnText}>Regenerate Plan</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#F8FAF9" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  centerBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAF9", padding: 24 },

  loadingCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  loadingTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginTop: 14, marginBottom: 20 },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot:     { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },

  errorCard:  { alignItems: "center", backgroundColor: "#fff", borderRadius: 24, padding: 32, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: DARK, marginTop: 14, marginBottom: 6 },
  errorSub:   { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  genBtn:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: GREEN, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, marginBottom: 12 },
  genBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  backLink:   { paddingVertical: 8 },
  backLinkText: { color: GREEN, fontWeight: "600", fontSize: 14 },

  // Header
  headerRow:   { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 16, gap: 12 },
  backBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: DARK },
  headerSub:   { fontSize: 12, color: "#6B7280", marginTop: 2 },
  dayViewBtn:  { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  dayViewText: { color: GREEN, fontSize: 13, fontWeight: "700" },

  // Hero card
  heroCard:  { backgroundColor: GREEN, borderRadius: 24, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  heroLeft:  { flex: 1 },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 },
  heroKcal:  { color: "#fff", fontSize: 30, fontWeight: "800" },
  heroUnit:  { fontSize: 16, fontWeight: "400" },
  heroBadge: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  heroRight: { gap: 10 },
  heroStatBox:  { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 10, alignItems: "center", minWidth: 70 },
  heroStatVal:  { color: "#fff", fontSize: 18, fontWeight: "800" },
  heroStatLabel:{ color: "rgba(255,255,255,0.8)", fontSize: 10 },

  // Focus card
  focusCard:  { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  focusTitle: { fontSize: 13, fontWeight: "700", color: DARK, marginBottom: 10 },
  focusTip:   { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  focusTipText: { fontSize: 12, color: "#374151", flex: 1, lineHeight: 18 },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 12 },

  // Day tabs
  dayTabsRow: { paddingRight: 8, gap: 10, marginBottom: 16 },
  dayTab: {
    width: 72, borderRadius: 18, padding: 12, alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  dayTabActive:    { backgroundColor: GREEN, shadowColor: GREEN, shadowOpacity: 0.4, elevation: 6 },
  dayTabLabel:     { fontSize: 13, fontWeight: "700", color: "#374151" },
  dayTabDate:      { fontSize: 18, fontWeight: "800", color: DARK, marginVertical: 2 },
  dayTabKcal:      { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  dayTabKcalUnit:  { fontSize: 9, color: "#9CA3AF" },
  dayTabTextActive:{ color: "#fff" },
  todayDot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff", position: "absolute", top: 8 },

  // Day meals card
  dayMealsCard:   { backgroundColor: "#fff", borderRadius: 22, padding: 18, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  dayMealsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  dayMealsTitle:  { fontSize: 16, fontWeight: "800", color: DARK },
  dayMealsSub:    { fontSize: 12, color: "#6B7280", marginTop: 2 },
  viewDayBtn:     { flexDirection: "row", alignItems: "center", gap: 2 },
  viewDayBtnText: { color: GREEN, fontSize: 13, fontWeight: "700" },

  // Meal row
  mealRow:    { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  mealIconBox:{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },
  mealType:   { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  mealName:   { fontSize: 13, fontWeight: "600", color: DARK },
  kcalBadge:  { alignItems: "center", backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  kcalBadgeText: { fontSize: 14, fontWeight: "800", color: GREEN },
  kcalBadgeUnit: { fontSize: 9, color: "#6B7280" },

  // Regen button
  regenBtn:     { backgroundColor: GREEN, borderRadius: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  regenBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
