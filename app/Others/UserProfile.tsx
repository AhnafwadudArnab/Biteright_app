import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../AuthContext";
import { cachedFetch, invalidateCache } from "../lib/apiCache";
import { SERVER_URL } from "../serverhost";

const GREEN = "#3BB273";
const DARK = "#0F172A";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileState {
  name: string;
  gender: string;
  age: number;
  avatar: string;
  heightCm: number;
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goal: string;
  diet: string[];
  activity: string[];
  bmi: number;
  bmr: number;
  progress: number;
}

interface MealPlanState {
  category: string;
  daily_calories: number;
  bmi: number;
  doctor_focus: string[];
}

interface BmiInfo {
  label: string;
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

const defaultProfile: ProfileState = {
  name: "",
  gender: "",
  age: 0,
  avatar: "https://i.pravatar.cc/150?img=12",
  heightCm: 0,
  startWeightKg: 0,
  currentWeightKg: 0,
  targetWeightKg: 0,
  goal: "Maintain Weight",
  diet: [],
  activity: [],
  bmi: 0,
  bmr: 0,
  progress: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function UserProfile() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [mealPlan, setMealPlan] = useState<MealPlanState | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* ── Animations ── */
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const card3 = useRef(new Animated.Value(0)).current;
  const card4 = useRef(new Animated.Value(0)).current;
  const card5 = useRef(new Animated.Value(0)).current;
  const card6 = useRef(new Animated.Value(0)).current;
  const editHeight = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Avatar pulse loop — starts immediately
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
        Animated.timing(avatarPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const runEntranceAnimations = () => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(card1, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
      Animated.timing(card2, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
      Animated.timing(card3, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
      Animated.timing(card4, { toValue: 1, duration: 400, delay: 400, useNativeDriver: true }),
      Animated.timing(card5, { toValue: 1, duration: 400, delay: 500, useNativeDriver: true }),
      Animated.timing(card6, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
    ]).start();
  };

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

  /* ── Avatar upload ── */
  const handleAvatarPress = async () => {
    if (Platform.OS === "web") {
      // Web: use hidden file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (e: any) => {
        const file: File = e.target.files[0];
        if (!file) return;
        const ext = file.name.split(".").pop() ?? "jpg";
        await uploadAvatar(file, ext, () => URL.createObjectURL(file));
      };
      input.click();
      return;
    }

    // Native: use ImagePicker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop() ?? "jpg";
    const getBlob = async () => fetch(asset.uri).then((r) => r.blob());
    await uploadAvatar(await getBlob(), ext);
  };

  const uploadAvatar = async (fileOrBlob: File | Blob, ext: string, getLocalUrl?: () => string) => {
    setUploadingAvatar(true);
    // Show local preview immediately
    if (getLocalUrl) setProfile((p) => ({ ...p, avatar: getLocalUrl() }));
    try {
      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId || !token) throw new Error("Not logged in");

      // 1. Get signed upload URL from backend
      const urlRes = await fetch(`${SERVER_URL}/users/avatar/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileExt: ext }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadUrl, publicUrl } = await urlRes.json();

      // 2. Upload directly to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": `image/${ext}` },
        body: fileOrBlob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // 3. Save public URL to DB
      await fetch(`${SERVER_URL}/users/avatar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      // 4. Update state with real public URL + bust cache
      setProfile((p) => ({ ...p, avatar: publicUrl }));
      invalidateCache(`profile_${userId}`);
      Alert.alert("✅ Success", "Profile photo updated!");
    } catch (e: any) {
      // Revert preview on failure
      setProfile((p) => ({ ...p, avatar: defaultProfile.avatar }));
      Alert.alert("Error", e?.message ?? "Could not upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ── Fetch ── */
  useEffect(() => {
    // Wait for AuthContext to finish restoring session before fetching
    if (authLoading) return;
    fetchAll();
  }, [user?.id, authLoading]);

  const fetchAll = async () => {
    try {
      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId) {
        setLoading(false);
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Fetch profile (cached 60s)
      const data = await cachedFetch(
        `profile_${userId}`,
        async () => {
          const res = await fetch(`${SERVER_URL}/api/profile?user_id=${userId}`, { headers });
          if (!res.ok) throw new Error("profile fetch failed");
          return res.json();
        },
        60_000
      );

      setProfile((p) => ({
        ...p,
        name: data.name ?? user?.name ?? "",
        gender: data.gender ?? "",
        age: data.age ?? 0,
        avatar: data.avatar ?? p.avatar,
        heightCm: data.height_cm ?? 0,
        startWeightKg: data.start_weight_kg ?? 0,
        currentWeightKg: data.current_weight_kg ?? 0,
        targetWeightKg: data.target_weight_kg ?? 0,
        goal: data.goal ?? "Maintain Weight",
        diet: Array.isArray(data.diet) ? data.diet : [],
        activity: Array.isArray(data.activity) ? data.activity : [],
      }));

      // Fetch latest meal plan (cached 120s)
      try {
        const plan = await cachedFetch(
          `mealplan_latest_${userId}`,
          async () => {
            const res = await fetch(`${SERVER_URL}/api/mealplan/latest`, { headers });
            if (!res.ok) throw new Error("no plan");
            return res.json();
          },
          120_000
        );
        setMealPlan({
          category: plan.category ?? "",
          daily_calories: plan.daily_calories ?? 0,
          bmi: plan.bmi ?? 0,
          doctor_focus: Array.isArray(plan.doctor_focus) ? plan.doctor_focus : [],
        });
      } catch {
        // meal plan is optional — ignore errors
      }
    } catch {
      setProfile((p) => ({ ...p, name: p.name || user?.name || "" }));
    } finally {
      setLoading(false);
    }
  };

  // Run entrance animations whenever loading becomes false
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(avatarScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(card1, { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
        Animated.timing(card2, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
        Animated.timing(card3, { toValue: 1, duration: 400, delay: 300, useNativeDriver: true }),
        Animated.timing(card4, { toValue: 1, duration: 400, delay: 400, useNativeDriver: true }),
        Animated.timing(card5, { toValue: 1, duration: 400, delay: 500, useNativeDriver: true }),
        Animated.timing(card6, { toValue: 1, duration: 400, delay: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  /* ── Save — invalidate cache after save ── */
  const saveProfile = async () => {
    Animated.sequence([
      Animated.timing(saveScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(saveScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    try {
      setSaving(true);
      const userId = user?.id ?? (await AsyncStorage.getItem("userId"));
      if (!userId) return;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${SERVER_URL}/api/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          user_id: userId,
          name: profile.name,
          gender: profile.gender,
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
      if (!res.ok) throw new Error("Save failed");
      // Bust cache so next visit re-fetches fresh data
      invalidateCache(`profile_${userId}`);
      Alert.alert("Profile saved!");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived metrics ── */
  useEffect(() => {
    if (!profile.heightCm || !profile.currentWeightKg) return;
    const h = profile.heightCm / 100;
    const bmi = +(profile.currentWeightKg / (h * h)).toFixed(1);
    // Mifflin-St Jeor: male +5, female -161
    const genderOffset = profile.gender === "male" ? 5 : -161;
    const bmr = Math.round(
      10 * profile.currentWeightKg +
      6.25 * profile.heightCm -
      5 * profile.age +
      genderOffset
    );
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
  }, [profile.currentWeightKg, profile.targetWeightKg, profile.heightCm, profile.age, profile.goal, profile.gender]);

  const updateNum = (key: keyof ProfileState, v: number) =>
    setProfile((p) => ({ ...p, [key]: v }));
  const updateStr = (key: keyof ProfileState, v: string) =>
    setProfile((p) => ({ ...p, [key]: v }));
  const toggleArr = (key: "diet" | "activity", val: string) =>
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
    }));

  const bmiCategory = (): BmiInfo => {
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

        {/* ── 1. Hero Card ── */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color={DARK} />
          </TouchableOpacity>

          {/* Avatar — tappable for upload */}
          <TouchableOpacity
            onPress={handleAvatarPress}
            activeOpacity={0.85}
            disabled={uploadingAvatar}
            accessibilityLabel="Change profile photo"
            accessibilityRole="button"
          >
            <Animated.View
              style={[
                styles.avatarRing,
                { transform: [{ scale: Animated.multiply(avatarScale, avatarPulse) }] },
              ]}
            >
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              <View style={styles.avatarBadge}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={12} color="#fff" />
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.heroName}>{profile.name || user?.name || "User"}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? ""}</Text>

          {/* Gender • Age badge */}
          {(profile.gender || profile.age > 0) && (
            <View style={styles.heroBadgeRow}>
              {profile.gender ? (
                <View style={styles.heroBadge}>
                  <Ionicons
                    name={profile.gender === "male" ? "male" : "female"}
                    size={12}
                    color={GREEN}
                  />
                  <Text style={styles.heroBadgeText}>
                    {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                  </Text>
                </View>
              ) : null}
              {profile.age > 0 && (
                <View style={styles.heroBadge}>
                  <Ionicons name="calendar-outline" size={12} color="#8B5CF6" />
                  <Text style={[styles.heroBadgeText, { color: "#8B5CF6" }]}>
                    {profile.age} yrs
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Edit / Save toggle button */}
          <Animated.View style={{ transform: [{ scale: saveScale }] }}>
            <TouchableOpacity
              style={[styles.editBtn, editMode && styles.editBtnActive]}
              onPress={async () => {
                if (editMode) {
                  await saveProfile();
                }
                setEditMode((e) => !e);
              }}
              activeOpacity={0.85}
              accessibilityLabel={editMode ? "Save profile" : "Edit profile"}
              accessibilityRole="button"
            >
              <Ionicons
                name={editMode ? (saving ? "hourglass" : "checkmark") : "pencil"}
                size={16}
                color={editMode ? "#fff" : GREEN}
              />
              <Text style={[styles.editBtnText, editMode && { color: "#fff" }]}>
                {editMode ? (saving ? "Saving…" : "Save Profile") : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── 2. Edit Panel (animated slide-down) ── */}
        <Animated.View
          style={{
            maxHeight: editHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 620] }),
            opacity: editHeight,
            overflow: "hidden",
          }}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Edit Profile</Text>

            {/* Name */}
            <View style={styles.editInputWrapFull}>
              <Text style={styles.editInputLabel}>Name</Text>
              <TextInput
                value={profile.name}
                onChangeText={(v) => updateStr("name", v)}
                style={styles.editInput}
                placeholder="Your name"
                placeholderTextColor="#C4C4C4"
                accessibilityLabel="Name input"
              />
            </View>

            {/* Gender toggle */}
            <Text style={[styles.editInputLabel, { marginBottom: 8 }]}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  profile.gender === "male" && styles.genderBtnActive,
                ]}
                onPress={() => updateStr("gender", "male")}
                accessibilityLabel="Select male"
                accessibilityRole="button"
              >
                <Ionicons
                  name="male"
                  size={16}
                  color={profile.gender === "male" ? "#fff" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.genderBtnText,
                    profile.gender === "male" && { color: "#fff" },
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderBtn,
                  profile.gender === "female" && styles.genderBtnFemaleActive,
                ]}
                onPress={() => updateStr("gender", "female")}
                accessibilityLabel="Select female"
                accessibilityRole="button"
              >
                <Ionicons
                  name="female"
                  size={16}
                  color={profile.gender === "female" ? "#fff" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.genderBtnText,
                    profile.gender === "female" && { color: "#fff" },
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>

            {/* Numeric fields grid */}
            <View style={styles.editGrid}>
              <EditInput
                label="Age"
                value={profile.age}
                onChange={(v: number) => updateNum("age", v)}
              />
              <EditInput
                label="Height (cm)"
                value={profile.heightCm}
                onChange={(v: number) => updateNum("heightCm", v)}
              />
              <EditInput
                label="Current Weight (kg)"
                value={profile.currentWeightKg}
                onChange={(v: number) => updateNum("currentWeightKg", v)}
              />
              <EditInput
                label="Start Weight (kg)"
                value={profile.startWeightKg}
                onChange={(v: number) => updateNum("startWeightKg", v)}
              />
              <EditInput
                label="Target Weight (kg)"
                value={profile.targetWeightKg}
                onChange={(v: number) => updateNum("targetWeightKg", v)}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── 3. Stats Row ── */}
        <Animated.View style={[styles.statsRow, cardSlide(card1)]}>
          <StatTile
            label="BMI"
            value={profile.bmi > 0 ? profile.bmi.toFixed(1) : "—"}
            sub={profile.bmi > 0 ? bmi.label : "No data"}
            color={bmi.color}
            icon="body"
          />
          <StatTile
            label="BMR"
            value={profile.bmr > 0 ? `${profile.bmr}` : "—"}
            sub="kcal/day"
            color="#8B5CF6"
            icon="flame"
          />
          <StatTile
            label="Weight"
            value={profile.currentWeightKg > 0 ? `${profile.currentWeightKg}` : "—"}
            sub={profile.targetWeightKg > 0 ? `Target: ${profile.targetWeightKg}kg` : "kg"}
            color="#3B82F6"
            icon="barbell"
          />
        </Animated.View>

        {/* ── 4. Goal Progress Card ── */}
        <Animated.View style={[styles.card, cardSlide(card2)]}>
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
              : profile.currentWeightKg > 0 && profile.targetWeightKg > 0
              ? `${profile.currentWeightKg} kg → ${profile.targetWeightKg} kg`
              : "Set your weights to track progress"}
          </Text>
        </Animated.View>

        {/* ── 5. Latest Meal Plan Card ── */}
        {mealPlan && (
          <Animated.View style={[styles.card, cardSlide(card3)]}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Latest Meal Plan</Text>
              <View style={[styles.goalBadge, { backgroundColor: "#FEF3C7" }]}>
                <Text style={[styles.goalBadgeText, { color: "#D97706" }]}>
                  {mealPlan.category}
                </Text>
              </View>
            </View>

            {/* Daily calories */}
            <View style={styles.mealPlanCalRow}>
              <View style={[styles.statIconBox, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="flame" size={18} color="#D97706" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.mealPlanCalValue}>{mealPlan.daily_calories} kcal</Text>
                <Text style={styles.mealPlanCalLabel}>Daily target calories</Text>
              </View>
            </View>

            {/* Doctor focus tips */}
            {mealPlan.doctor_focus.length > 0 && (
              <View style={styles.doctorFocusWrap}>
                <Text style={styles.doctorFocusTitle}>Doctor Focus</Text>
                {mealPlan.doctor_focus.slice(0, 3).map((tip, i) => (
                  <View key={i} style={styles.doctorFocusRow}>
                    <Ionicons name="checkmark-circle" size={16} color={GREEN} />
                    <Text style={styles.doctorFocusTip}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* View Plan button */}
            <TouchableOpacity
              style={styles.viewPlanBtn}
              onPress={() => router.push("../Dietplans/Daily_diet_plannigs")}
              activeOpacity={0.85}
              accessibilityLabel="View meal plan"
              accessibilityRole="button"
            >
              <Ionicons name="restaurant-outline" size={16} color="#fff" />
              <Text style={styles.viewPlanBtnText}>View Plan</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── 6. My Goal Card ── */}
        <Animated.View style={[styles.card, cardSlide(card4)]}>
          <Text style={styles.cardTitle}>My Goal</Text>
          <View style={styles.chipRow}>
            {["Weight Loss", "Weight Gain", "Maintain Weight"].map((g) => (
              <Chip
                key={g}
                label={g}
                active={profile.goal === g}
                color={GREEN}
                onPress={() => setProfile((p) => ({ ...p, goal: g }))}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── 7. Diet & Activity Card ── */}
        <Animated.View style={[styles.card, cardSlide(card5)]}>
          <Text style={styles.cardTitle}>Diet Preferences</Text>
          <View style={styles.chipRow}>
            {["Vegetarian", "Non-Vegetarian", "Vegan", "Other"].map((d) => (
              <Chip
                key={d}
                label={d}
                active={profile.diet.includes(d)}
                color="#F59E0B"
                onPress={() => toggleArr("diet", d)}
              />
            ))}
          </View>

          <Text style={[styles.cardTitle, { marginTop: 18 }]}>Activity Level</Text>
          <View style={styles.chipRow}>
            {["Sedentary", "Light Exercise", "Moderate Exercise", "Active"].map((a) => (
              <Chip
                key={a}
                label={a}
                active={profile.activity.includes(a)}
                color="#8B5CF6"
                onPress={() => toggleArr("activity", a)}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── 8. Logout Button ── */}
        <Animated.View style={cardSlide(card6)}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
              router.replace("/(tabs)/landingPage");
            }}
            activeOpacity={0.85}
            accessibilityLabel="Log out"
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}

function StatTile({ label, value, sub, color, icon }: StatTileProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 70,
      friction: 6,
      delay: 300,
      useNativeDriver: true,
    }).start();
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

interface ChipProps {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}

function Chip({ label, active, color, onPress }: ChipProps) {
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
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        {active && (
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={color}
            style={{ marginRight: 4 }}
          />
        )}
        <Text style={[styles.chipText, active && { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface EditInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function EditInput({ label, value, onChange }: EditInputProps) {
  return (
    <View style={styles.editInputWrap}>
      <Text style={styles.editInputLabel}>{label}</Text>
      <TextInput
        value={value > 0 ? String(value) : ""}
        keyboardType="numeric"
        onChangeText={(v) => onChange(Number(v) || 0)}
        style={styles.editInput}
        placeholder="0"
        placeholderTextColor="#C4C4C4"
        accessibilityLabel={label}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  root: { flex: 1, backgroundColor: "#F8FAF9" },
  blob1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#D1FAE5",
    opacity: 0.5,
  },
  blob2: {
    position: "absolute",
    top: 300,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EDE9FE",
    opacity: 0.4,
  },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },

  // Loader
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },
  loaderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loaderText: { color: "#6B7280", fontSize: 15 },

  // Hero card
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: GREEN,
    marginBottom: 12,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 94, height: 94, borderRadius: 47 },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK,
    marginBottom: 2,
    textAlign: "center",
  },
  heroEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
    textAlign: "center",
  },
  heroBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GREEN,
    backgroundColor: "#ECFDF5",
  },
  editBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
  editBtnText: { fontSize: 14, fontWeight: "700", color: GREEN },

  // Generic card
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
    marginBottom: 12,
  },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  goalBadgeText: { fontSize: 12, fontWeight: "700" },

  // Edit panel
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  genderBtnActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  genderBtnFemaleActive: {
    backgroundColor: "#EC4899",
    borderColor: "#EC4899",
  },
  genderBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  editGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  editInputWrap: { width: "47%" },
  editInputWrapFull: { width: "100%", marginBottom: 16 },
  editInputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "600",
  },
  editInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: DARK,
  },

  // Stats row
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statTile: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  statSub: { fontSize: 10, color: "#9CA3AF", textAlign: "center" },

  // Progress
  progressPct: {
    fontSize: 40,
    fontWeight: "900",
    color: GREEN,
    marginBottom: 10,
  },
  progressBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: GREEN, borderRadius: 5 },
  progressHint: { fontSize: 12, color: "#9CA3AF" },

  // Meal plan card
  mealPlanCalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
  },
  mealPlanCalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#D97706",
  },
  mealPlanCalLabel: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 2,
  },
  doctorFocusWrap: { marginBottom: 14 },
  doctorFocusTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
    marginBottom: 8,
  },
  doctorFocusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  doctorFocusTip: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  viewPlanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  viewPlanBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
