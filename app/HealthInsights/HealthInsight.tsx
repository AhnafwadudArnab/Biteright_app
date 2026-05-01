import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { useCalories } from "../CaloriesContext";
import { SERVER_URL } from "../serverhost";

const GREEN = "#3BB273";
const DARK = "#0F172A";
const { width: W } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────────────────
interface Report {
  id: string;
  date_range: string;
  avg_calories: number;
  status: string;
}

// ── Animated bar ──────────────────────────────────────────────────────────────
function AnimatedBar({
  label,
  value,
  max,
  color,
  delay,
  unit = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  delay: number;
  unit?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(value / max, 1);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      delay,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [pct]);

  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>
          {value}
          {unit}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barW, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// ── Pie chart (manual SVG-free) ───────────────────────────────────────────────
function SimplePieChart({
  data,
  colors,
  labels,
}: {
  data: number[];
  colors: string[];
  labels: string[];
}) {
  const total = data.reduce((a, b) => a + b, 0);
  const SIZE = 140;
  const R = SIZE / 2;
  const STROKE = 28;

  // Build arc segments using strokeDasharray trick on concentric circles
  const circumference = 2 * Math.PI * (R - STROKE / 2);
  let offset = 0;

  return (
    <View style={{ alignItems: "center", marginVertical: 8 }}>
      {/* Donut using layered Views */}
      <View style={{ width: SIZE, height: SIZE, position: "relative" }}>
        {data.map((val, i) => {
          const pct = val / total;
          const rotation = offset * 360;
          offset += pct;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                width: SIZE,
                height: SIZE,
                borderRadius: R,
                borderWidth: STROKE,
                borderColor: "transparent",
                // We use a simple colored arc approximation via border trick
              }}
            />
          );
        })}
        {/* Simpler: stacked colored segments as horizontal bars */}
      </View>

      {/* Legend + bar representation */}
      <View style={styles.pieBarContainer}>
        {data.map((val, i) => {
          const pct = Math.round((val / total) * 100);
          return (
            <View key={i} style={styles.pieBarRow}>
              <View style={[styles.pieDot, { backgroundColor: colors[i] }]} />
              <Text style={styles.pieLabel}>{labels[i]}</Text>
              <View style={styles.pieBarTrack}>
                <View
                  style={[
                    styles.pieBarFill,
                    { width: `${pct}%`, backgroundColor: colors[i] },
                  ]}
                />
              </View>
              <Text style={[styles.piePct, { color: colors[i] }]}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Weight trend mini chart ───────────────────────────────────────────────────
function WeightTrend({ data }: { data: { day: string; weight: number }[] }) {
  const max = Math.max(...data.map((d) => d.weight));
  const min = Math.min(...data.map((d) => d.weight));
  const range = max - min || 1;

  return (
    <View style={styles.weightChart}>
      {data.map((item, i) => {
        const barH = ((item.weight - min) / range) * 60 + 20;
        return (
          <View key={i} style={styles.weightBarCol}>
            <Text style={styles.weightVal}>{item.weight}</Text>
            <View style={[styles.weightBar, { height: barH }]} />
            <Text style={styles.weightDay}>{item.day}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HealthInsightScreen() {
  const { token } = useAuth();
  const { goal, consumed } = useCalories();

  const [view, setView] = useState<"dashboard" | "generate" | "history">("dashboard");
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportToggles, setReportToggles] = useState({
    calories: true,
    macros: true,
    weight: true,
    meals: false,
    water: true,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [savingReport, setSavingReport] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // Load reports from DB
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/reports`, { headers: authHeaders() });
      if (res.ok) setReports(await res.json());
    } catch {} finally { setLoadingReports(false); }
  }, [authHeaders]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Macro data (from context or defaults)
  const macroData   = [48, 28, 24];
  const macroColors = [GREEN, "#3B82F6", "#F97316"];
  const macroLabels = ["Carbs", "Protein", "Fat"];

  const weightHistory = [
    { day: "Mon", weight: 72.5 },
    { day: "Tue", weight: 72.2 },
    { day: "Wed", weight: 71.9 },
    { day: "Thu", weight: 71.6 },
    { day: "Fri", weight: 71.4 },
  ];

  const avgCalories = reports.length
    ? Math.round(reports.reduce((s, r) => s + r.avg_calories, 0) / reports.length)
    : consumed || 0;

  // ── Generate report (save to DB) ──
  const handleGenerate = async () => {
    setSavingReport(true);
    try {
      const now = new Date();
      const end = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const startD = new Date(now);
      startD.setDate(startD.getDate() - 6);
      const start = startD.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const avgCal = consumed > 0 ? consumed : 1900;
      const status = consumed <= goal ? "On Track" : "Above Target";

      const res = await fetch(`${SERVER_URL}/api/reports`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ date_range: `${start} - ${end}`, avg_calories: avgCal, status }),
      });
      if (res.ok) {
        await fetchReports();
        setView("dashboard");
      }
    } catch {} finally { setSavingReport(false); }
  };

  // ── Delete report ──
  const confirmDelete = (id: string) => setDeleteTarget(id);
  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${SERVER_URL}/api/reports/${deleteTarget}`, { method: "DELETE", headers: authHeaders() });
      setReports((prev) => prev.filter((r) => r.id !== deleteTarget));
      setDeleteTarget(null);
    } catch {}
  };

  // ── GENERATE VIEW ──
  if (view === "generate") {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setView("dashboard")}>
              <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Generate Report</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.card}>
            {(Object.keys(reportToggles) as (keyof typeof reportToggles)[]).map((key) => (
              <View key={key} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} intake trends
                </Text>
                <Switch
                  value={reportToggles[key]}
                  onValueChange={(v) =>
                    setReportToggles((prev) => ({ ...prev, [key]: v }))
                  }
                  trackColor={{ true: GREEN }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerate} disabled={savingReport}>
            {savingReport ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Generate Report</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── HISTORY VIEW ──
  if (view === "history") {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setView("dashboard")}>
              <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report History</Text>
            <View style={{ width: 40 }} />
          </View>

          {reports.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="document-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No reports yet</Text>
            </View>
          )}

          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportDate}>{report.date_range}</Text>
                <Text style={styles.reportCal}>{report.avg_calories} kcal/day avg</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        report.status === "On Track" ? "#ECFDF5" : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          report.status === "On Track" ? GREEN : "#D97706",
                      },
                    ]}
                  >
                    {report.status}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => confirmDelete(report.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Delete confirm modal */}
        <Modal visible={!!deleteTarget} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="warning" size={36} color="#EF4444" />
              <Text style={styles.modalTitle}>Delete Report?</Text>
              <Text style={styles.modalText}>This action cannot be undone.</Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={() => setDeleteTarget(null)}
                >
                  <Text style={styles.modalBtnGhostText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "#EF4444" }]}
                  onPress={doDelete}
                >
                  <Text style={[styles.modalBtnGhostText, { color: "#fff" }]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── DASHBOARD VIEW ──
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/(tabs)/MainHomePage")}
          >
            <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Insights</Text>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => setView("history")}
          >
            <Ionicons name="calendar-outline" size={20} color={GREEN} />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Average Daily Calories</Text>
          <Text style={styles.summaryValue}>{avgCalories} kcal</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="trending-down" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={styles.summaryHint}>
              {goal - avgCalories > 0
                ? `${goal - avgCalories} kcal below target`
                : `${avgCalories - goal} kcal above target`}
            </Text>
          </View>
        </View>

        {/* Calorie progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Nutrition</Text>
          <AnimatedBar label="Calories" value={consumed}  max={goal}  color={GREEN}     delay={0}   unit=" kcal" />
          <AnimatedBar label="Protein"  value={85}        max={120}   color="#3B82F6"   delay={100} unit="g" />
          <AnimatedBar label="Carbs"    value={160}       max={250}   color="#F97316"   delay={200} unit="g" />
          <AnimatedBar label="Fat"      value={45}        max={70}    color="#A855F7"   delay={300} unit="g" />
        </View>

        {/* Macro breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macro Breakdown</Text>
          <SimplePieChart
            data={macroData}
            colors={macroColors}
            labels={macroLabels}
          />
        </View>

        {/* Weight trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weight Trend (This Week)</Text>
          <WeightTrend data={weightHistory} />
        </View>

        {/* Weekly challenges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Challenges</Text>
          <AnimatedBar label="Meal logging (days)"   value={5} max={7} color={GREEN}   delay={0} />
          <AnimatedBar label="Water goal (days)"     value={4} max={7} color="#3B82F6" delay={100} />
          <AnimatedBar label="Calorie goal (days)"   value={6} max={7} color="#F97316" delay={200} />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: GREEN }]}
            onPress={() => setView("generate")}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>New Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnOutline]}
            onPress={() => setView("history")}
          >
            <Ionicons name="time-outline" size={18} color={GREEN} />
            <Text style={[styles.actionBtnText, { color: GREEN }]}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Ingredient Suggestion shortcut */}
        <TouchableOpacity
          style={styles.ingredientBtn}
          onPress={() => router.push("../HealthInsights/IngredientSuggession")}
          activeOpacity={0.85}
        >
          <Ionicons name="leaf-outline" size={20} color={GREEN} />
          <Text style={styles.ingredientBtnText}>Cook with What You Have →</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  headerRow: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 20, fontWeight: "700", color: DARK,
  },
  historyBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center",
  },

  // Summary card
  summaryCard: {
    backgroundColor: GREEN, borderRadius: 24, padding: 22, marginBottom: 14,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
  },
  summaryLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 4 },
  summaryValue: { color: "#fff", fontSize: 34, fontWeight: "800", marginBottom: 8 },
  summaryRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryHint:  { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  // Card
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: DARK, marginBottom: 14 },

  // Animated bars
  barRow:      { marginBottom: 14 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  barLabel:    { fontSize: 13, color: "#4B5563" },
  barValue:    { fontSize: 13, fontWeight: "700" },
  barTrack:    { height: 10, backgroundColor: "#F3F4F6", borderRadius: 5, overflow: "hidden" },
  barFill:     { height: "100%", borderRadius: 5 },

  // Pie chart (bar-based)
  pieBarContainer: { width: "100%", marginTop: 8 },
  pieBarRow: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 10, gap: 8,
  },
  pieDot:     { width: 12, height: 12, borderRadius: 6 },
  pieLabel:   { width: 56, fontSize: 13, color: "#374151", fontWeight: "600" },
  pieBarTrack: { flex: 1, height: 10, backgroundColor: "#F3F4F6", borderRadius: 5, overflow: "hidden" },
  pieBarFill:  { height: "100%", borderRadius: 5 },
  piePct:     { width: 36, fontSize: 13, fontWeight: "700", textAlign: "right" },

  // Weight chart
  weightChart: {
    flexDirection: "row", justifyContent: "space-around",
    alignItems: "flex-end", height: 110, marginTop: 8,
  },
  weightBarCol: { alignItems: "center", gap: 4 },
  weightVal:    { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  weightBar:    { width: 28, backgroundColor: "#3B82F6", borderRadius: 6 },
  weightDay:    { fontSize: 11, color: "#9CA3AF" },

  // Generate view
  toggleRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  toggleLabel: { fontSize: 14, color: "#374151" },

  // Primary button
  primaryBtn: {
    backgroundColor: GREEN, borderRadius: 16,
    paddingVertical: 16, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 8,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // History view
  reportCard: {
    backgroundColor: "#fff", borderRadius: 18, padding: 16,
    marginBottom: 12, flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  reportDate: { fontSize: 14, fontWeight: "700", color: DARK, marginBottom: 4 },
  reportCal:  { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText:  { fontSize: 12, fontWeight: "700" },
  deleteBtn:   { padding: 8 },

  emptyBox:  { alignItems: "center", paddingVertical: 48 },
  emptyText: { color: "#9CA3AF", fontSize: 15, marginTop: 12 },

  // Action row
  actionRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
  },
  actionBtnOutline: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1.5, borderColor: GREEN,
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  ingredientBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16,
    marginTop: 4, borderWidth: 1.5, borderColor: GREEN + "40",
  },
  ingredientBtnText: { fontSize: 14, color: GREEN, fontWeight: "700", flex: 1 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    width: "100%", maxWidth: 360,
    backgroundColor: "#fff", borderRadius: 24,
    padding: 24, alignItems: "center",
  },
  modalTitle:   { fontSize: 18, fontWeight: "800", color: DARK, marginTop: 10, marginBottom: 6 },
  modalText:    { fontSize: 13, color: "#6B7280", marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalBtn:     { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center" },
  modalBtnGhost: { borderWidth: 1.5, borderColor: "#D1D5DB", backgroundColor: "#fff" },
  modalBtnGhostText: { fontWeight: "700", color: "#374151" },
});
