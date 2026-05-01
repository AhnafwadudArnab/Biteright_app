import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import MealEditModal from "../Meal_trackers/Meal_edit_model";
import { SERVER_URL } from "../serverhost";

const DAILY_GOAL = 2000;
const GREEN = "#3BB273";

export type Meal = {
  id: string;
  type: string;
  name: string;
  time: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

// BMI JSON path (adjust if needed)
const BMI_JSON = require("../Dietplans/JSON files/DoctorSugg_bmi_mealplans.json");

// Helper: get default meals for a user (mock: male, 22-22.9)
function getDefaultMeals(gender = "male", bmiRange = "22-22.9") {
  const plan = BMI_JSON?.bmiMealPlans?.[gender]?.[bmiRange]?.meals || [];
  return plan.map((m: any, idx: number) => ({
    id: `${gender}-${bmiRange}-${idx}`,
    type: m.type,
    name: m.name,
    time: "",
    kcal: m.kcal,
    protein: 0,
    carbs: 0,
    fat: 0,
  }));
}

// ─── Animated Meal Card ───────────────────────────────────────────────────────

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, []);

  const mealTypeColors: Record<string, string> = {
    Breakfast: "#FFF3E0",
    Lunch: "#E8F5E9",
    Snack: "#F3E5F5",
    Dinner: "#E3F2FD",
  };
  const mealTypeTextColors: Record<string, string> = {
    Breakfast: "#E65100",
    Lunch: "#2E7D32",
    Snack: "#6A1B9A",
    Dinner: "#1565C0",
  };

  const bgColor = mealTypeColors[meal.type] ?? "#F0F4F0";
  const textColor = mealTypeTextColors[meal.type] ?? GREEN;

  return (
    <Animated.View
      style={[
        styles.mealCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Left accent bar */}
      <View style={[styles.mealAccentBar, { backgroundColor: textColor }]} />

      <View style={styles.mealCardInner}>
        {/* Top row */}
        <View style={styles.mealHeader}>
          <View style={[styles.mealTypeBadge, { backgroundColor: bgColor }]}>
            <Text style={[styles.mealTypeBadgeText, { color: textColor }]}>
              {meal.type}
            </Text>
          </View>
          <View style={styles.mealActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onEdit(meal)}
            >
              <Ionicons name="create-outline" size={17} color={GREEN} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { marginLeft: 8 }]}
              onPress={() => onDelete(meal)}
            >
              <Ionicons name="trash-outline" size={17} color="#E57373" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meal name */}
        <Text style={styles.mealName}>{meal.name}</Text>

        {/* Time */}
        {!!meal.time && (
          <View style={styles.mealTimeRow}>
            <Ionicons name="time-outline" size={13} color="#9CA3AF" />
            <Text style={styles.mealTime}> {meal.time}</Text>
          </View>
        )}

        {/* Nutrition chips */}
        <View style={styles.nutritionRow}>
          <View style={[styles.nutritionChip, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.nutritionChipText, { color: GREEN }]}>
              🔥 {meal.kcal} kcal
            </Text>
          </View>
          <View style={styles.nutritionChip}>
            <Text style={styles.nutritionChipText}>P {meal.protein}g</Text>
          </View>
          <View style={styles.nutritionChip}>
            <Text style={styles.nutritionChipText}>C {meal.carbs}g</Text>
          </View>
          <View style={styles.nutritionChip}>
            <Text style={styles.nutritionChipText}>F {meal.fat}g</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.emptyIconCircle}>
        <Ionicons name="restaurant-outline" size={40} color={GREEN} />
      </View>
      <Text style={styles.emptyTitle}>No meals yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to log your first meal today
      </Text>
    </Animated.View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GenMeals() {
  const { user, token } = useAuth();
  const { setConsumed } = useCalories();
  const userId = user?.id;
  const API_BASE = `${SERVER_URL}/api`;

  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = React.useState<Meal | null>(null);
  const [showMealModal, setShowMealModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  // ── Mount animations ──────────────────────────────────────────────────────

  // Header: slide down + fade
  const headerSlide = useRef(new Animated.Value(-60)).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  // Calories card: spring scale
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  // Progress bar width (0–1)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Add button pulse
  const addBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Header slides in
    Animated.parallel([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Card springs in
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
        delay: 200,
      } as any),
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Add button pulse loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(addBtnScale, {
          toValue: 1.12,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(addBtnScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ── Business logic ────────────────────────────────────────────────────────

  const fetchMeals = async () => {
    if (!userId) {
      const defaultMeals = getDefaultMeals("male", "22-22.9");
      setMeals(defaultMeals);
      setConsumed(defaultMeals.reduce((s, m) => s + (m.kcal || 0), 0));
      setLoading(false);
      setInitialized(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meals/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      let data: Meal[] = [];
      if (res.ok) {
        data = await res.json();
      }
      if (!data || data.length === 0) {
        data = getDefaultMeals("male", "22-22.9");
      }
      setMeals(data);
      // Update consumed calories in context
      const total = data.reduce((s: number, m: Meal) => s + (m.kcal || 0), 0);
      setConsumed(total);
    } catch {
      setMeals(getDefaultMeals("male", "22-22.9"));
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    if (!initialized) fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // Animate progress bar whenever totalKcal changes
  const totalKcal = meals.reduce((s, m) => s + (m.kcal || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat || 0), 0);
  const progressPercent = Math.min(totalKcal / DAILY_GOAL, 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 800,
      delay: 400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [progressPercent]);

  const handleSaveMeal = async (meal: Meal) => {
    if (!userId) {
      Alert.alert("Not logged in", "Please log in to save meals.");
      return;
    }
    setLoading(true);
    try {
      if (
        editingMeal &&
        editingMeal.id &&
        !editingMeal.id.startsWith("male-")
      ) {
        await fetch(`${API_BASE}/meals/${editingMeal.id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      }
      const res = await fetch(`${API_BASE}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          meal_type: meal.type,
          eaten_at: new Date().toISOString(),
          items: [
            {
              food_id: meal.id || Math.random().toString(),
              quantity: 1,
              calories: meal.kcal,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to save meal");
      fetchMeals();
    } catch {
      Alert.alert("Error", "Could not save meal.");
    } finally {
      setShowMealModal(false);
      setEditingMeal(null);
      setLoading(false);
    }
  };

  const handleDelete = async (meal: Meal) => {
    setLoading(true);
    try {
      if (meal.id.startsWith("male-")) {
        setMeals((prev) => prev.filter((m) => m.id !== meal.id));
      } else {
        const res = await fetch(`${API_BASE}/meals/${meal.id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Failed to delete meal");
        fetchMeals();
      }
    } catch {
      Alert.alert("Error", "Could not delete meal.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealModal(true);
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    setShowMealModal(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
            style={styles.backBtn}
            onPress={() => router.push("/(tabs)/MainHomePage")}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Daily Meal Log</Text>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Spacer to balance back button */}
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* ── Calories Card ── */}
        <Animated.View
          style={[
            styles.caloriesCard,
            {
              opacity: cardFade,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Inner glow circle */}
          <View style={styles.cardGlowCircle} />

          <Text style={styles.caloriesLabel}>Calories Consumed</Text>
          <View style={styles.caloriesRow}>
            <Text
              style={[
                styles.caloriesValue,
                { color: totalKcal > DAILY_GOAL ? "#FFE082" : "#FFFFFF" },
              ]}
            >
              {totalKcal}
            </Text>
            <Text style={styles.caloriesGoal}> / {DAILY_GOAL} kcal</Text>
          </View>

          {/* Animated progress bar */}
          <View style={styles.progressBg}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          {/* Macro row */}
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalProtein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalCarbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{totalFat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Section header ── */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            {meals.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{meals.length}</Text>
              </View>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: addBtnScale }] }}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddMeal}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Loading ── */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={GREEN}
            style={{ marginTop: 32 }}
          />
        )}

        {/* ── Empty state ── */}
        {!loading && meals.length === 0 && <EmptyState />}

        {/* ── Meal cards ── */}
        {!loading &&
          meals.map((meal, index) => (
            <MealCard
              key={meal.id}
              meal={meal}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Modal ── */}
      {showMealModal && (
        <MealEditModal
          meal={
            editingMeal || {
              id: "",
              type: "",
              name: "",
              time: "",
              kcal: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            }
          }
          onSave={handleSaveMeal}
          onCancel={() => {
            setShowMealModal(false);
            setEditingMeal(null);
          }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },

  // Background blobs
  blobTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(59,178,115,0.10)",
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: 80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(59,178,115,0.07)",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    letterSpacing: 0.2,
  },
  headerDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // ── Calories card ──
  caloriesCard: {
    backgroundColor: GREEN,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGlowCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  caloriesLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  caloriesValue: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 46,
  },
  caloriesGoal: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
    marginLeft: 2,
  },
  progressBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  macroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  // ── Section row ──
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  countBadge: {
    backgroundColor: GREEN,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  addBtn: {
    backgroundColor: GREEN,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },

  // ── Meal card ──
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  mealAccentBar: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  mealCardInner: {
    flex: 1,
    padding: 14,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  mealTypeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mealTypeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  mealActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
  },
  mealName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  mealTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  nutritionChip: {
    backgroundColor: "#F4F6F8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nutritionChipText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ── Empty state ──
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(59,178,115,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
