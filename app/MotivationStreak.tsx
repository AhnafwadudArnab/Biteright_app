import {
    ArrowLeft,
    Award,
    Flame,
    RotateCcw,
    Star,
    Target,
    Trophy,
    Zap,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
//import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const LinearGradient =
  Platform.OS === "web"
    ? require("react-native-web-linear-gradient").default
    : require("react-native-linear-gradient").default;


interface MotivationScreenProps {
  onBack: () => void;
}

type Badge = {
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  bg: string;
  fg: string;
  unlocked: boolean;
};

const badges: Badge[] = [
  { name: "7-Day Streak", icon: Flame, bg: "#FFEDD5", fg: "#F97316", unlocked: true },
  { name: "Water Champion", icon: Trophy, bg: "#DBEAFE", fg: "#3B82F6", unlocked: true },
  { name: "Macro Master", icon: Target, bg: "#F3E8FF", fg: "#A855F7", unlocked: true },
  { name: "30-Day Hero", icon: Award, bg: "#FEF3C7", fg: "#F59E0B", unlocked: false },
  { name: "Early Bird", icon: Star, bg: "#FCE7F3", fg: "#EC4899", unlocked: true },
  { name: "Consistency King", icon: Zap, bg: "#DCFCE7", fg: "#22C55E", unlocked: false },
];

function ProgressRow({
  label,
  valueText,
  progress, // 0..1
}: {
  label: string;
  valueText: string;
  progress: number;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{valueText}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped * 100}%` }]} />
      </View>
    </View>
  );
}

export function MotivationStreak({ onBack }: MotivationScreenProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(12);
  const [totalPoints] = useState(1450);

  const unlockedCount = useMemo(
    () => badges.filter((b) => b.unlocked).length,
    []
  );

  const resetStreak = () => {
    setCurrentStreak(0);
    setShowResetConfirm(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <ArrowLeft size={24} color="#374151" />
          </Pressable>

          <Text style={styles.title}>Motivation & Rewards</Text>
          <Text style={styles.subtitle}>Keep up the great work!</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Streak Counter */}
          <LinearGradient
            colors={["#FB923C", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakWatermark}>
              <Flame size={120} color="rgba(255,255,255,0.14)" />
            </View>

            <View style={{ zIndex: 2 }}>
              <View style={styles.streakRow}>
                <Flame size={24} color="#fff" />
                <Text style={styles.streakLabel}>Current Streak</Text>
              </View>

              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakDays}>days in a row!</Text>

              <Pressable
                onPress={() => setShowResetConfirm(true)}
                style={({ pressed }) => [
                  styles.resetBtn,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.resetBtnText}>Reset Streak</Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Points */}
          <LinearGradient
            colors={["#3BB273", "#2D8F5C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pointsCard}
          >
            <View style={styles.pointsRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.pointsLabelRow}>
                  <Star size={20} color="#fff" />
                  <Text style={styles.pointsLabel}>Total Points</Text>
                </View>
                <Text style={styles.pointsNumber}>{totalPoints}</Text>
                <Text style={styles.pointsHint}>Keep logging to earn more!</Text>
              </View>

              <View style={styles.pointsIconWrap}>
                <Trophy size={32} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          {/* Weekly Challenge */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Challenge</Text>

            <ProgressRow label="Log meals 7 days" valueText="5/7" progress={5 / 7} />
            <ProgressRow label="Drink 8 glasses daily" valueText="4/7" progress={4 / 7} />
            <ProgressRow label="Stay under calorie goal" valueText="6/7" progress={6 / 7} />
          </View>

          {/* Badges */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Achievements</Text>

            <View style={styles.badgeGrid}>
              {badges.map((badge, idx) => {
                const Icon = badge.icon;
                const isLocked = !badge.unlocked;

                return (
                  <View
                    key={`${badge.name}-${idx}`}
                    style={[
                      styles.badgeTile,
                      { backgroundColor: isLocked ? "#F3F4F6" : badge.bg },
                    ]}
                  >
                    {/* "Blur overlay" approximation for locked badges */}
                    {isLocked && <View style={styles.badgeLockedOverlay} />}

                    <Icon size={32} color={isLocked ? "#9CA3AF" : badge.fg} />
                    <Text
                      style={[
                        styles.badgeName,
                        { color: isLocked ? "#9CA3AF" : badge.fg },
                      ]}
                      numberOfLines={2}
                    >
                      {badge.name}
                    </Text>

                    {badge.unlocked && (
                      <View style={styles.badgeCheck}>
                        <Award size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <Text style={styles.badgeFooter}>
              {unlockedCount}/{badges.length} badges unlocked
            </Text>
          </View>

          {/* Milestones */}
          <View style={styles.milestoneCard}>
            <Text style={styles.cardTitle}>Next Milestone</Text>

            <View style={styles.milestoneRow}>
              <View style={styles.milestoneIcon}>
                <Trophy size={24} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.milestoneTitle}>30-Day Streak</Text>
                <Text style={styles.milestoneSub}>18 days to go</Text>
              </View>

              <Text style={styles.milestoneEmoji}>🏆</Text>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Reset Confirmation Modal */}
        <Modal
          visible={showResetConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowResetConfirm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalTop}>
                <View style={styles.modalIconWrap}>
                  <RotateCcw size={32} color="#F97316" />
                </View>

                <Text style={styles.modalTitle}>Reset Streak?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to reset your {currentStreak}-day streak? This action cannot be undone.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowResetConfirm(false)}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    styles.modalBtnGhost,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.modalBtnGhostText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={resetStreak}
                  style={({ pressed }) => [
                    styles.modalBtn,
                    styles.modalBtnPrimary,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <Text style={styles.modalBtnPrimaryText}>Reset</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backBtn: { marginBottom: 12, alignSelf: "flex-start" },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#4B5563" },

  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

  streakCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    marginBottom: 16,
    minHeight: 170,
  },
  streakWatermark: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1,
  },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  streakNumber: { fontSize: 48, fontWeight: "800", color: "#fff", marginTop: 6 },
  streakDays: { fontSize: 16, color: "rgba(255,255,255,0.9)", marginTop: 2 },

  resetBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    ...Platform.select({
      android: { elevation: 0 },
      ios: {},
    }),
  },
  resetBtnText: { fontSize: 13, color: "#fff", fontWeight: "600" },

  pointsCard: {
    borderRadius: 18,
    padding: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  pointsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  pointsLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  pointsLabel: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  pointsNumber: { fontSize: 36, fontWeight: "800", color: "#fff" },
  pointsHint: { marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.75)" },
  pointsIconWrap: {
    padding: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 14 },

  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, color: "#4B5563" },
  progressValue: { fontSize: 13, color: "#3BB273", fontWeight: "700" },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "#F3F4F6", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#3BB273" },

  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  badgeTile: {
    width: "31.5%",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 98,
    overflow: "hidden",
  },
  badgeName: {
    marginTop: 8,
    fontSize: 11,
    textAlign: "center",
    fontWeight: "700",
  },
  badgeLockedOverlay: {
    position: "absolute",
    inset: 0 as any,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  badgeCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#3BB273",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFooter: { marginTop: 14, textAlign: "center", fontSize: 13, color: "#6B7280" },

  milestoneCard: {
    backgroundColor: "#E8F7EF",
    borderRadius: 18,
    padding: 18,
  },
  milestoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#3BB273",
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  milestoneSub: { marginTop: 2, fontSize: 12, color: "#4B5563" },
  milestoneEmoji: { fontSize: 22 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },
  modalTop: { alignItems: "center", paddingHorizontal: 10, paddingTop: 4, paddingBottom: 12 },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 8 },
  modalText: { textAlign: "center", fontSize: 13, color: "#4B5563", lineHeight: 18 },

  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnGhost: { borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#FFFFFF" },
  modalBtnGhostText: { color: "#374151", fontWeight: "700" },
  modalBtnPrimary: { backgroundColor: "#F97316" },
  modalBtnPrimaryText: { color: "#FFFFFF", fontWeight: "800" },
});