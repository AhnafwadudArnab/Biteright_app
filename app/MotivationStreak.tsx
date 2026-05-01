import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "./AuthContext";
import { cachedFetch, invalidateCache } from "./lib/apiCache";
import { SERVER_URL } from "./serverhost";

const GREEN = "#3BB273";

type Badge = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  fg: string;
  requiredStreak: number;
};

const BADGES: Badge[] = [
  { name: "7-Day Streak",     icon: "flame",   bg: "#FFEDD5", fg: "#F97316", requiredStreak: 7  },
  { name: "Water Champion",   icon: "trophy",  bg: "#DBEAFE", fg: "#3B82F6", requiredStreak: 3  },
  { name: "Macro Master",     icon: "fitness", bg: "#F3E8FF", fg: "#A855F7", requiredStreak: 5  },
  { name: "30-Day Hero",      icon: "medal",   bg: "#FEF3C7", fg: "#F59E0B", requiredStreak: 30 },
  { name: "Early Bird",       icon: "sunny",   bg: "#FCE7F3", fg: "#EC4899", requiredStreak: 2  },
  { name: "Consistency King", icon: "flash",   bg: "#DCFCE7", fg: "#22C55E", requiredStreak: 14 },
];

function ProgressRow({ label, current, total }: { label: string; current: number; total: number }) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{current}/{total}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

export default function MotivationStreak() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [mealsLoggedWeek, setMealsLoggedWeek] = useState(0);
  const [waterGoalDays, setWaterGoalDays] = useState(0);
  const [calorieGoalDays, setCalorieGoalDays] = useState(0);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const fetchStreak = useCallback(async () => {
    try {
      // Cache streak for 20s — it changes rarely
      const data = await cachedFetch(
        `streak_${token}`,
        async () => {
          const res = await fetch(`${SERVER_URL}/api/streak`, { headers: authHeaders() });
          if (!res.ok) throw new Error("streak fetch failed");
          return res.json();
        },
        20_000
      );
      setCurrentStreak(data.current_streak ?? 0);
      setTotalPoints(data.total_points ?? 0);
      setMealsLoggedWeek(data.meals_logged_week ?? 0);
      setWaterGoalDays(data.water_goal_days_week ?? 0);
      setCalorieGoalDays(data.calorie_goal_days_week ?? 0);
    } catch {} finally { setLoading(false); }
  }, [authHeaders, token]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/streak/reset`, { method: "POST", headers: authHeaders() });
      if (res.ok) {
        setCurrentStreak(0);
        setShowResetModal(false);
        invalidateCache(`streak_${token}`); // bust cache
      }
    } catch {} finally { setSaving(false); }
  };

  const unlockedCount = BADGES.filter((b) => currentStreak >= b.requiredStreak).length;

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/(tabs)/MainHomePage")} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>Motivation & Rewards</Text>
            <Text style={styles.headerSub}>Keep up the great work!</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakWatermark}>
            <Ionicons name="flame" size={120} color="rgba(255,255,255,0.12)" />
          </View>
          <View style={styles.streakTopRow}>
            <Ionicons name="flame" size={22} color="#fff" />
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakDays}>days in a row!</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => setShowResetModal(true)} activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>Reset Streak</Text>
          </TouchableOpacity>
        </View>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={{ flex: 1 }}>
            <View style={styles.pointsLabelRow}>
              <Ionicons name="star" size={18} color="#fff" />
              <Text style={styles.pointsLabel}>Total Points</Text>
            </View>
            <Text style={styles.pointsNumber}>{totalPoints}</Text>
            <Text style={styles.pointsHint}>Keep logging to earn more!</Text>
          </View>
          <View style={styles.pointsIconWrap}>
            <Ionicons name="trophy" size={32} color="#fff" />
          </View>
        </View>

        {/* Weekly Challenge */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Challenge</Text>
          <ProgressRow label="Log meals 7 days"        current={mealsLoggedWeek}  total={7} />
          <ProgressRow label="Drink 8 glasses daily"   current={waterGoalDays}    total={7} />
          <ProgressRow label="Stay under calorie goal" current={calorieGoalDays}  total={7} />
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const unlocked = currentStreak >= badge.requiredStreak;
              return (
                <View key={badge.name} style={[styles.badgeTile, { backgroundColor: unlocked ? badge.bg : "#F3F4F6" }]}>
                  {!unlocked && <View style={styles.badgeLockedOverlay} />}
                  <Ionicons name={badge.icon} size={32} color={unlocked ? badge.fg : "#9CA3AF"} />
                  <Text style={[styles.badgeName, { color: unlocked ? badge.fg : "#9CA3AF" }]} numberOfLines={2}>
                    {badge.name}
                  </Text>
                  {unlocked && (
                    <View style={styles.badgeCheck}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.badgeFooter}>{unlockedCount}/{BADGES.length} badges unlocked</Text>
        </View>

        {/* Next Milestone */}
        <View style={styles.milestoneCard}>
          <Text style={styles.cardTitle}>Next Milestone</Text>
          <View style={styles.milestoneRow}>
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.milestoneTitle}>30-Day Streak</Text>
              <Text style={styles.milestoneSub}>{Math.max(0, 30 - currentStreak)} days to go</Text>
            </View>
            <Text style={{ fontSize: 24 }}>🏆</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Reset Modal */}
      <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={() => setShowResetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="refresh-circle" size={40} color="#F97316" />
            </View>
            <Text style={styles.modalTitle}>Reset Streak?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to reset your {currentStreak}-day streak? This cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setShowResetModal(false)}>
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleReset} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalBtnPrimaryText}>Reset</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E" },
  headerSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  streakCard: { backgroundColor: "#F97316", borderRadius: 24, padding: 22, marginBottom: 14, overflow: "hidden", shadowColor: "#F97316", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  streakWatermark: { position: "absolute", top: -10, right: -10 },
  streakTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  streakLabel: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  streakNumber: { fontSize: 52, fontWeight: "800", color: "#fff", lineHeight: 58 },
  streakDays: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginBottom: 16 },
  resetBtn: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.22)" },
  resetBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  pointsCard: { backgroundColor: GREEN, borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 14, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  pointsLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  pointsLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  pointsNumber: { fontSize: 38, fontWeight: "800", color: "#fff" },
  pointsHint: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  pointsIconWrap: { padding: 16, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginBottom: 14 },
  progressRow: { marginBottom: 14 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 13, color: "#4B5563" },
  progressValue: { fontSize: 13, color: GREEN, fontWeight: "700" },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: "#F3F4F6", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: GREEN },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  badgeTile: { width: "31%", borderRadius: 18, paddingVertical: 14, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", minHeight: 96, overflow: "hidden" },
  badgeName: { marginTop: 8, fontSize: 11, textAlign: "center", fontWeight: "700" },
  badgeLockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.55)" },
  badgeCheck: { position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  badgeFooter: { marginTop: 14, textAlign: "center", fontSize: 13, color: "#6B7280" },
  milestoneCard: { backgroundColor: "#E8F7EF", borderRadius: 20, padding: 18, marginBottom: 14 },
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  milestoneIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  milestoneTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  milestoneSub: { fontSize: 12, color: "#4B5563", marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center" },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFEDD5", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 8 },
  modalText: { textAlign: "center", fontSize: 13, color: "#4B5563", lineHeight: 20, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center" },
  modalBtnGhost: { borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#fff" },
  modalBtnGhostText: { color: "#374151", fontWeight: "700" },
  modalBtnPrimary: { backgroundColor: "#F97316" },
  modalBtnPrimaryText: { color: "#fff", fontWeight: "800" },
});
