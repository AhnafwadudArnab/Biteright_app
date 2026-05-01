import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { SERVER_URL } from "../serverhost";

const { width: W } = Dimensions.get("window");
const GREEN = "#3BB273";
const DARK = "#0F172A";
const CARD_BG = "#fff";

/* ── Default profile ── */
const defaultProfile = {
  name: "",
  gender: "",
  age: 0,
  avatar: "https://i.pravatar.cc/150?img=12",
  heightCm: 0,
  startWeightKg: 0,
  currentWeightKg: 0,
  targetWeightKg: 0,
  goal: "Maintain Weight",
  diet: [] as string[],
  activity: [] as string[],
  bmi: 0,
  bmr: 0,
  progress: 0,
};

export default function UserProfile() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(defaultProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ── Animations ── */
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;
  const card4 = useRef(new Animated.Value(0)).current;
  const editHeight = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance — each card fades + slides in sequentially
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(card1, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
      Animated.timing(card2, { toValue: 1, duration: 400, delay: 350, useNativeDriver: true }),
      Animated.timing(card3, { toValue: 1, duration: 400, delay: 500, useNativeDriver: true }),
      Animated.timing(card4, { toValue: 1, duration: 400, delay: 650, useNativeDriver: true }),
    ]).start();

    // Avatar pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
        Animated.timing(avatarPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Animate progress bar when profile loads
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: profile.progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [profile.progress]);

  // Animate edit panel open/close
  useEffect(() => {
    Animated.spring(editHeight, {
      toValue: editMode ? 1 : 0,
      tension: 60,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [editMode]);

  /* ── Fetch ── */
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Always pre-fill from AuthContext so something shows even if backend is down
      setProfile((p) => ({
        ...p,
        name: user?.name ?? "",
      }));

      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId) return; // still shows AuthContext name from pre-fill above

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${SERVER_URL}/api/profile?user_id=${userId}`, { headers });
      if (!res.ok) return; // backend down — still show AuthContext data

      const data = await res.json();
      setProfile((p) => ({
        ...p,
        name: data.name ?? user?.name ?? "",
        gender: data.gender ?? "",
        age: data.age ?? 0,
        heightCm: data.height_cm ?? 0,
        startWeightKg: data.start_weight_kg ?? 0,
        currentWeightKg: data.current_weight_kg ?? 0,
        targetWeightKg: data.target_weight_kg ?? 0,
        goal: data.goal ?? "Maintain Weight",
        diet: Array.isArray(data.diet) ? data.diet : [],
        activity: Array.isArray(data.activity) ? data.activity : [],
      }));
    } catch (e) {
      console.log("Profile fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Save ── */
  const saveProfile = async () => {
    Animated.sequence([
      Animated.timing(saveScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(saveScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    try {
      setSaving(true);
      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId) return;
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      await fetch(`${SERVER_URL}/api/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          user_id: userId,
          age: profile.age,
          height_cm: profile.heightCm,
          start_weight_kg: profile.startWeightKg,
          current_weight_kg: profile.currentWeightKg,
          target_weight_kg: profile.targetWeightKg,
          goal: profile.goal,
          diet: profile.diet,
          activity: profile.activity,
        }),
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived metrics ── */
  useEffect(() => {
    if (!profile.heightCm || !profile.currentWeightKg) return;
    const h = profile.heightCm / 100;
    const bmi = +(profile.currentWeightKg / (h * h)).toFixed(1);
    const bmr = Math.round(10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 5);
    let progress = 0;
    if (profile.goal === "Weight Loss") {
      const total = profile.startWeightKg - profile.targetWeightKg;
      const done = profile.startWeightKg - profile.currentWeightKg;
      progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    } else if (profile.goal === "Weight Gain") {
      const total = profile.targetWeightKg - profile.startWeightKg;
      const done = profile.currentWeightKg - profile.startWeightKg;
      progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    } else {
      const diff = Math.abs(profile.currentWeightKg - profile.startWeightKg);
      progress = diff <= 1 ? 100 : Math.max(0, 100 - diff * 10);
    }
    setProfile((p) => ({ ...p, bmi, bmr, progress }));
  }, [profile.currentWeightKg, profile.targetWeightKg, profile.heightCm, profile.age, profile.goal]);

  const updateNum = (key: string, v: number) => setProfile((p) => ({ ...p, [key]: v }));
  const toggleArr = (key: "diet" | "activity", val: string) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
    }));

  const bmiCategory = () => {
    if (profile.bmi < 18.5) return { label: "Underweight", color: "#3B82F6" };
    if (profile.bmi < 25) return { label: "Normal", color: GREEN };
    if (profile.bmi < 30) return { label: "Overweight", color: "#F59E0B" };
    return { label: "Obese", color: "#EF4444" };
  };

  const progressBarW = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const cardSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
          <View style={styles.loaderIcon}>
            <Ionicons name="person" size={36} color={GREEN} />
          </View>
        </Animated.View>
        <Text style={styles.loaderText}>Loading profile…</Text>
      </View>
    );
  }

  const bmi = bmiCategory();

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero Header ── */}
        <Animated.View style={[styles.heroCard, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={DARK} />
          </TouchableOpacity>

          {/* Avatar */}
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: Animated.multiply(avatarScale, avatarPulse) }] }]}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </Animated.View>

          <Text style={styles.heroName}>{profile.name || user?.name || "User"}</Text>
          <Text style={styles.heroSub}>
            {profile.gender ? `${profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} • ` : ""}
            {profile.age ? `${profile.age} yrs` : (user?.email ?? "Set up your profile")}
          </Text>

          {/* Edit / Save button */}
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              style={[styles.editBtn, editMode && styles.editBtnActive]}
              onPress={async () => {
                if (editMode) await saveProfile();
                setEditMode((e) => !e);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name={editMode ? (saving ? "hourglass" : "checkmark") : "pencil"} size={16} color={editMode ? "#fff" : GREEN} />
              <Text style={[styles.editBtnText, editMode && { color: "#fff" }]}>
                {editMode ? (saving ? "Saving…" : "Save Profile") : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── Edit Panel (animated height) ── */}
        <Animated.View style={{
          maxHeight: editHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
          opacity: editHeight,
          overflow: "hidden",
        }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Measurements</Text>
            <View style={styles.editGrid}>
              <EditInput label="Age" value={profile.age} onChange={(v) => updateNum("age", v)} />
              <EditInput label="Height (cm)" value={profile.heightCm} onChange={(v) => updateNum("heightCm", v)} />
              <EditInput label="Current Weight (kg)" value={profile.currentWeightKg} onChange={(v) => updateNum("currentWeightKg", v)} />
              <EditInput label="Target Weight (kg)" value={profile.targetWeightKg} onChange={(v) => updateNum("targetWeightKg", v)} />
            </View>
          </View>
        </Animated.View>

        {/* ── Progress Card ── */}
        <Animated.View style={[styles.card, cardSlide(card1)]}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Goal Progress</Text>
            <View style={[styles.goalBadge, { backgroundColor: GREEN + "18" }]}>
              <Text style={[styles.goalBadgeText, { color: GREEN }]}>{profile.goal}</Text>
            </View>
          </View>
          <Text style={styles.progressPct}>{profile.progress}%</Text>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: progressBarW }]} />
          </View>
          <Text style={styles.progressHint}>
            {profile.goal === "Maintain Weight"
              ? "Staying within ±1 kg of start weight"
              : `${profile.currentWeightKg} kg → ${profile.targetWeightKg} kg`}
          </Text>
        </Animated.View>

        {/* ── Stats Row ── */}
        <Animated.View style={[styles.statsRow, cardSlide(card2)]}>
          <StatTile label="BMI" value={profile.bmi.toFixed(1)} sub={bmi.label} color={bmi.color} icon="body" />
          <StatTile label="BMR" value={`${profile.bmr}`} sub="kcal/day" color="#8B5CF6" icon="flame" />
          <StatTile label="Height" value={`${profile.heightCm}`} sub="cm" color="#3B82F6" icon="resize" />
        </Animated.View>

        {/* ── Goal ── */}
        <Animated.View style={[styles.card, cardSlide(card3)]}>
          <Text style={styles.cardTitle}>My Goal</Text>
          <View style={styles.chipRow}>
            {["Weight Loss", "Weight Gain", "Maintain Weight"].map((g) => (
              <Chip key={g} label={g} active={profile.goal === g} color={GREEN}
                onPress={() => setProfile((p) => ({ ...p, goal: g }))} />
            ))}
          </View>
        </Animated.View>

        {/* ── Diet & Activity ── */}
        <Animated.View style={[styles.card, cardSlide(card4)]}>
          <Text style={styles.cardTitle}>Diet Preferences</Text>
          <View style={styles.chipRow}>
            {["Vegetarian", "Non-Vegetarian", "Vegan", "Other"].map((d) => (
              <Chip key={d} label={d} active={profile.diet.includes(d)} color="#F59E0B"
                onPress={() => toggleArr("diet", d)} />
            ))}
          </View>

          <Text style={[styles.cardTitle, { marginTop: 16 }]}>Activity Level</Text>
          <View style={styles.chipRow}>
            {["Sedentary", "Light Exercise", "Moderate Exercise", "Active"].map((a) => (
              <Chip key={a} label={a} active={profile.activity.includes(a)} color="#8B5CF6"
                onPress={() => toggleArr("activity", a)} />
            ))}
          </View>
        </Animated.View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace("/(tabs)/landingPage");
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ── Sub-components ── */

function StatTile({ label, value, sub, color, icon }: any) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 70, friction: 6, delay: 300, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[styles.statTile, { transform: [{ scale }] }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </Animated.View>
  );
}

function Chip({ label, active, color, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={press}
        style={[styles.chip, active && { backgroundColor: color + "22", borderColor: color }]}
        activeOpacity={0.8}
      >
        {active && <Ionicons name="checkmark-circle" size={14} color={color} style={{ marginRight: 4 }} />}
        <Text style={[styles.chipText, active && { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function EditInput({ label, value, onChange }: any) {
  return (
    <View style={styles.editInputWrap}>
      <Text style={styles.editInputLabel}>{label}</Text>
      <TextInput
        value={String(value || "")}
        keyboardType="numeric"
        onChangeText={(v) => onChange(Number(v) || 0)}
        style={styles.editInput}
        placeholderTextColor="#C4C4C4"
      />
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  blob1: {
    position: "absolute", top: -50, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "#D1FAE5", opacity: 0.5,
  },
  blob2: {
    position: "absolute", top: 300, left: -70,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#EDE9FE", opacity: 0.4,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 56 },

  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAF9" },
  loaderIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  loaderText: { color: "#6B7280", fontSize: 15 },

  // Hero
  heroCard: {
    backgroundColor: CARD_BG, borderRadius: 28, padding: 24,
    alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
  },
  backBtn: {
    position: "absolute", top: 16, left: 16,
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: GREEN,
    marginBottom: 12, position: "relative",
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GREEN, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  heroName: { fontSize: 22, fontWeight: "800", color: DARK, marginBottom: 4 },
  heroSub: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: GREEN, backgroundColor: "#ECFDF5",
  },
  editBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  editBtnText: { fontSize: 14, fontWeight: "700", color: GREEN },

  // Card
  card: {
    backgroundColor: CARD_BG, borderRadius: 20, padding: 20, marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: DARK, marginBottom: 12 },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  goalBadgeText: { fontSize: 12, fontWeight: "700" },

  // Progress
  progressPct: { fontSize: 36, fontWeight: "900", color: GREEN, marginBottom: 10 },
  progressBg: {
    height: 10, backgroundColor: "#E5E7EB", borderRadius: 5,
    overflow: "hidden", marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: GREEN, borderRadius: 5 },
  progressHint: { fontSize: 12, color: "#9CA3AF" },

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statTile: {
    flex: 1, backgroundColor: CARD_BG, borderRadius: 18, padding: 14,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  statSub: { fontSize: 10, color: "#9CA3AF" },

  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: "#F1F5F9", borderRadius: 20,
    borderWidth: 1.5, borderColor: "transparent",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },

  // Edit inputs
  editGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  editInputWrap: { width: "47%" },
  editInputLabel: { fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: "600" },
  editInput: {
    backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 15, color: DARK,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#EF4444", borderRadius: 16,
    paddingVertical: 16, marginTop: 8,
    shadowColor: "#EF4444", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
