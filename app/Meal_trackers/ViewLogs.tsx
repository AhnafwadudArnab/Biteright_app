import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../AuthContext";
import { SERVER_URL } from "../serverhost";

const GREEN = "#38B36A";
const DARK  = "#0F172A";

type MealItem = { id: string; calories: number; quantity: number; foods?: { name: string } };

type Meal = {
  id: string;
  meal_type: string;
  eaten_at: string;
  meal_items: MealItem[];
};

type Profile = {
  height_cm: number;
  current_weight_kg: number;
  age: number;
  gender: string;
  goal: string;
  target_weight_kg: number;
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Snack", "Dinner"];

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditMealModal({
  meal,
  onSave,
  onClose,
}: {
  meal: Meal;
  onSave: (mealType: string, calories: number) => void;
  onClose: () => void;
}) {
  const [mealType, setMealType] = useState(meal.meal_type);
  const [calories, setCalories] = useState(
    String(meal.meal_items.reduce((s, i) => s + (i.calories || 0), 0))
  );

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Edit Meal</Text>

          {/* Meal type selector */}
          <Text style={styles.modalLabel}>Meal Type</Text>
          <View style={styles.typeRow}>
            {MEAL_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, mealType === t && styles.typeBtnActive]}
                onPress={() => setMealType(t)}
              >
                <Text style={[styles.typeBtnText, mealType === t && styles.typeBtnTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Calories */}
          <Text style={styles.modalLabel}>Total Calories (kcal)</Text>
          <TextInput
            style={styles.modalInput}
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            placeholder="e.g. 450"
            placeholderTextColor="#C4C4C4"
          />

          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={() => onSave(mealType, Number(calories) || 0)}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Animated meal card ────────────────────────────────────────────────────────
function MealCard({
  meal,
  index,
  onEdit,
  onDelete,
}: {
  meal: Meal;
  index: number;
  onEdit: (m: Meal) => void;
  onDelete: (m: Meal) => void;
}) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 400, delay: index * 90, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay: index * 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const totalKcal = meal.meal_items.reduce((s, i) => s + (i.calories || 0), 0);
  const time = meal.eaten_at
    ? new Date(meal.eaten_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const ICONS: Record<string, string> = {
    Breakfast: "sunny-outline",
    Lunch:     "restaurant-outline",
    Snack:     "nutrition-outline",
    Dinner:    "moon-outline",
  };

  const TYPE_COLORS: Record<string, string> = {
    Breakfast: "#E65100",
    Lunch:     "#2E7D32",
    Snack:     "#6A1B9A",
    Dinner:    "#1565C0",
  };
  const accentColor = TYPE_COLORS[meal.meal_type] ?? GREEN;

  return (
    <Animated.View style={[styles.mealCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={[styles.mealAccent, { backgroundColor: accentColor }]} />
      <View style={styles.mealCardInner}>
        {/* Top row */}
        <View style={styles.mealCardTopRow}>
          <View style={styles.mealCardLeft}>
            <View style={[styles.mealIconBox, { backgroundColor: accentColor + "18" }]}>
              <Ionicons name={(ICONS[meal.meal_type] || "restaurant-outline") as any} size={18} color={accentColor} />
            </View>
            <View>
              <Text style={[styles.mealType, { color: accentColor }]}>{meal.meal_type}</Text>
              {time ? (
                <View style={styles.timePill}>
                  <Ionicons name="time-outline" size={11} color="#9CA3AF" />
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Edit / Delete buttons */}
          <View style={styles.mealActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(meal)} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={17} color={GREEN} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 8 }]} onPress={() => onDelete(meal)} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items */}
        <View style={{ marginTop: 8 }}>
          {meal.meal_items.length === 0 ? (
            <Text style={styles.mealItemName}>No items logged</Text>
          ) : (
            meal.meal_items.map((item, i) => (
              <Text key={i} style={styles.mealItemName} numberOfLines={1}>
                • {item.foods?.name || "Food item"}{item.quantity ? ` ×${item.quantity}` : ""}
              </Text>
            ))
          )}
        </View>

        {/* Calories */}
        <View style={styles.kcalRow}>
          <Ionicons name="flame" size={13} color={GREEN} />
          <Text style={styles.kcalText}>{totalKcal} kcal</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, color, delay,
}: {
  icon: string; label: string; value: string; sub: string; color: string; delay: number;
}) {
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, tension: 70, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { opacity: fade, transform: [{ scale }] }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </Animated.View>
  );
}

// ── Animated progress bar ─────────────────────────────────────────────────────
function ProgressBar({ pct, color = GREEN }: { pct: number; color?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct]);
  const w = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={styles.progressBg}>
      <Animated.View style={[styles.progressFill, { width: w, backgroundColor: color }]} />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ViewLogs() {
  const { user, token } = useAuth();

  const [meals,   setMeals]   = useState<Meal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const headerFade  = useRef(new Animated.Value(0)).current;
  const heroSlide   = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadAll();
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(heroSlide,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mealsRes, profileRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/meals/${user?.id}`, { headers: authHeaders() }),
        fetch(`${SERVER_URL}/api/profile?user_id=${user?.id}`, { headers: authHeaders() }),
      ]);
      if (mealsRes.ok)   setMeals(await mealsRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
    } catch {}
    finally { setLoading(false); }
  };

  // ── Edit ──
  const handleEdit = async (mealType: string, calories: number) => {
    if (!editingMeal) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/meals/${editingMeal.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          user_id: user?.id,
          meal_type: mealType,
          eaten_at: editingMeal.eaten_at,
          items: editingMeal.meal_items.map((item) => ({
            food_id: item.id,
            quantity: item.quantity || 1,
            calories,
          })),
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingMeal(null);
      loadAll();
    } catch {
      Alert.alert("Error", "Could not update meal.");
    }
  };

  // ── Delete ──
  const handleDelete = (meal: Meal) => {
    Alert.alert(
      "Delete Meal",
      `Remove this ${meal.meal_type}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${SERVER_URL}/api/meals/${meal.id}`, {
                method: "DELETE",
                headers: authHeaders(),
              });
              if (!res.ok) throw new Error("Delete failed");
              setMeals((prev) => prev.filter((m) => m.id !== meal.id));
            } catch {
              Alert.alert("Error", "Could not delete meal.");
            }
          },
        },
      ]
    );
  };

  // ── Derived stats from profile ──
  const bmi = profile?.height_cm && profile?.current_weight_kg
    ? +(profile.current_weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const bmr = profile
    ? Math.round(
        10 * (profile.current_weight_kg || 0) +
        6.25 * (profile.height_cm || 0) -
        5 * (profile.age || 25) +
        (profile.gender?.toLowerCase() === "female" ? -161 : 5)
      )
    : null;

  const bmiCategory = () => {
    if (!bmi) return { label: "—", color: "#9CA3AF" };
    if (bmi < 18.5) return { label: "Underweight", color: "#3B82F6" };
    if (bmi < 25)   return { label: "Normal",      color: GREEN };
    if (bmi < 30)   return { label: "Overweight",  color: "#F59E0B" };
    return              { label: "Obese",          color: "#EF4444" };
  };

  // ── Today's calorie stats ──
  const todayKcal = meals.reduce(
    (s, m) => s + m.meal_items.reduce((ss, i) => ss + (i.calories || 0), 0), 0
  );
  const calorieGoal = bmr || 2000;
  const caloriePct  = Math.min(todayKcal / calorieGoal, 1);

  // ── Weight progress ──
  const weightProgress = (() => {
    if (!profile?.current_weight_kg || !profile?.target_weight_kg || !profile?.current_weight_kg) return 0;
    const start  = profile.current_weight_kg; // approximation
    const target = profile.target_weight_kg;
    if (target === start) return 1;
    return Math.min(1, Math.max(0, 1 - Math.abs(start - target) / Math.max(start, target)));
  })();

  const bmiInfo = bmiCategory();

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <Animated.View style={[styles.headerRow, { opacity: headerFade, transform: [{ translateY: heroSlide }] }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/(tabs)/MainHomePage")}>
          <Ionicons name="arrow-back" size={20} color={DARK} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Meal Log</Text>
          <Text style={styles.headerSub}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadAll}>
          <Ionicons name="refresh-outline" size={20} color={GREEN} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Hero calorie card ── */}
      <Animated.View style={[styles.heroCard, { opacity: headerFade, transform: [{ translateY: heroSlide }] }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Calories Today</Text>
            <Text style={styles.heroKcal}>
              {todayKcal}
              <Text style={styles.heroGoal}> / {calorieGoal} kcal</Text>
            </Text>
            <Text style={styles.heroSub2}>
              {todayKcal >= calorieGoal
                ? "🎯 Goal reached!"
                : `${calorieGoal - todayKcal} kcal remaining`}
            </Text>
          </View>
          <View style={styles.pctCircle}>
            <Text style={styles.pctText}>{Math.round(caloriePct * 100)}%</Text>
          </View>
        </View>
        <ProgressBar pct={caloriePct} color="#fff" />
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>{meals.length} meals logged</Text>
          <Text style={styles.heroMetaText}>
            {profile?.goal || "Maintain Weight"}
          </Text>
        </View>
      </Animated.View>

      {/* ── User stats ── */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsRow}>
        <StatCard icon="body-outline"   label="BMI"    value={bmi?.toString() ?? "—"}  sub={bmiInfo.label}   color={bmiInfo.color} delay={100} />
        <StatCard icon="flame-outline"  label="BMR"    value={bmr?.toString() ?? "—"}  sub="kcal/day"        color="#F97316"       delay={200} />
        <StatCard icon="barbell-outline" label="Weight" value={profile?.current_weight_kg ? `${profile.current_weight_kg}kg` : "—"} sub={`Target: ${profile?.target_weight_kg ?? "—"}kg`} color="#8B5CF6" delay={300} />
      </View>

      {/* ── Goal progress ── */}
      {profile && (
        <View style={styles.goalCard}>
          <View style={styles.goalCardTop}>
            <Text style={styles.goalCardTitle}>Goal Progress</Text>
            <View style={[styles.goalBadge, { backgroundColor: GREEN + "20" }]}>
              <Text style={[styles.goalBadgeText, { color: GREEN }]}>{profile.goal || "Maintain"}</Text>
            </View>
          </View>
          <ProgressBar pct={weightProgress} color={GREEN} />
          <Text style={styles.goalHint}>
            {profile.current_weight_kg}kg → {profile.target_weight_kg}kg
          </Text>
        </View>
      )}

      {/* ── Today's meals ── */}
      <View style={styles.mealsTitleRow}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {meals.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{meals.length}</Text>
          </View>
        )}
      </View>

      {loading && (
        <ActivityIndicator size="large" color={GREEN} style={{ marginVertical: 32 }} />
      )}

      {!loading && meals.length === 0 && (
        <View style={styles.emptyBox}>
          <Ionicons name="restaurant-outline" size={52} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No meals logged today</Text>
          <Text style={styles.emptySub}>Start tracking your meals to see them here</Text>
          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => router.push("../Meal_trackers/Gen_meals")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.logBtnText}>Log a Meal</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && meals.map((meal, i) => (
        <MealCard key={meal.id} meal={meal} index={i} onEdit={setEditingMeal} onDelete={handleDelete} />
      ))}

      {/* ── Edit Modal ── */}
      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onSave={handleEdit}
          onClose={() => setEditingMeal(null)}
        />
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#F8FAF9" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  headerRow:  { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 16, gap: 12 },
  backBtn:    { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  headerTitle:{ fontSize: 20, fontWeight: "800", color: DARK },
  headerSub:  { fontSize: 12, color: "#6B7280", marginTop: 2 },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" },

  // Hero card
  heroCard:  { backgroundColor: GREEN, borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  heroTop:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 4 },
  heroKcal:  { color: "#fff", fontSize: 32, fontWeight: "800" },
  heroGoal:  { fontSize: 15, fontWeight: "400", color: "rgba(255,255,255,0.7)" },
  heroSub2:  { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
  pctCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  pctText:   { color: "#fff", fontSize: 14, fontWeight: "700" },
  progressBg:   { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  progressFill: { height: "100%", borderRadius: 4 },
  heroMeta:     { flexDirection: "row", justifyContent: "space-between" },
  heroMetaText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },

  // Section title
  sectionTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 12 },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: "800" },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  statSub:   { fontSize: 9, color: "#9CA3AF", textAlign: "center" },

  // Goal card
  goalCard:    { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  goalCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  goalCardTitle: { fontSize: 15, fontWeight: "700", color: DARK },
  goalBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  goalBadgeText: { fontSize: 12, fontWeight: "700" },
  goalHint:    { fontSize: 12, color: "#9CA3AF", marginTop: 8 },

  // Meals title row
  mealsTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  countBadge:    { marginLeft: 8, backgroundColor: GREEN, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeText:{ color: "#fff", fontSize: 12, fontWeight: "700" },

  // Meal card
  mealCard:     { backgroundColor: "#fff", borderRadius: 18, marginBottom: 12, flexDirection: "row", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  mealAccent:   { width: 4 },
  mealCardInner:{ flex: 1, padding: 14 },
  mealCardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  mealCardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  mealIconBox:  { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  mealType:     { fontSize: 13, fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  timePill:     { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  timeText:     { fontSize: 11, color: "#9CA3AF" },
  mealActions:  { flexDirection: "row", alignItems: "center" },
  actionBtn:    { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F4F6F8", alignItems: "center", justifyContent: "center" },
  mealItemName: { fontSize: 13, color: DARK, fontWeight: "500", marginBottom: 2 },
  kcalRow:      { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  kcalText:     { fontSize: 13, fontWeight: "700", color: GREEN },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalBox:     { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: DARK, marginBottom: 20, textAlign: "center" },
  modalLabel:   { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  typeRow:      { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  typeBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  typeBtnActive:{ backgroundColor: GREEN + "18", borderColor: GREEN },
  typeBtnText:  { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  typeBtnTextActive: { color: GREEN },
  modalInput:   { borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, fontSize: 15, color: DARK, backgroundColor: "#F9FAFB", marginBottom: 24 },
  modalBtns:    { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB", alignItems: "center" },
  modalCancelText: { fontSize: 15, fontWeight: "700", color: "#6B7280" },
  modalSaveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: GREEN, alignItems: "center" },
  modalSaveText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Empty state
  emptyBox:   { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginTop: 14, marginBottom: 6 },
  emptySub:   { fontSize: 13, color: "#9CA3AF", textAlign: "center", marginBottom: 20 },
  logBtn:     { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: GREEN, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  logBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
