import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../AuthContext";
import { fetchWithTimeout } from "../lib/fetchWithTimeout";
import { SERVER_URL } from "../serverhost";

const GREEN = "#3BB273";
const DARK = "#111827";

export default function SignupScreen() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout(
        SERVER_URL + "/users/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, gender }),
        },
        15_000  // 15s for registration (slightly longer — creates profile too)
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message?.toLowerCase().includes("email already")
          ? "Email already exists"
          : data.message || "Registration failed");
      } else {
        await login(email, password);
        router.replace("/(tabs)/MainHomePage");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAF9" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Back */}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <View style={styles.backCircle}>
              <ArrowLeft size={20} color={DARK} />
            </View>
          </Pressable>

          <Text style={styles.heading}>Create Account ✨</Text>
          <Text style={styles.subheading}>Start your healthy journey today</Text>

          <View style={styles.card}>
            {/* Name */}
            <InputField
              label="Full Name"
              icon={<User size={18} color="#9CA3AF" />}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
            />

            {/* Email */}
            <InputField
              label="Email"
              icon={<Mail size={18} color="#9CA3AF" />}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
            />

            {/* Password */}
            <InputField
              label="Password"
              icon={<Lock size={18} color="#9CA3AF" />}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                  {showPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              }
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              icon={<Lock size={18} color="#9CA3AF" />}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirm}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                  {showConfirm ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
                </TouchableOpacity>
              }
            />

            {/* Gender */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {(["male", "female"] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {loading ? "Creating account…" : "Create Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/login_signup/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ── Reusable input field ── */
function InputField({
  label, icon, rightIcon, value, onChangeText, placeholder,
  secureTextEntry, keyboardType,
}: {
  label: string;
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>{icon}</View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#C4C4C4"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={[styles.input, rightIcon ? { paddingRight: 44 } : null]}
        />
        {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 40 },
  blobTop: {
    position: "absolute", top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "#D1FAE5", opacity: 0.5,
  },
  blobBottom: {
    position: "absolute", bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "#BBF7D0", opacity: 0.35,
  },
  backBtn: { marginBottom: 24 },
  backCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  heading: { fontSize: 28, fontWeight: "800", color: DARK, marginBottom: 6 },
  subheading: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  card: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F9FAFB", borderWidth: 1.5,
    borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: DARK },
  rightIcon: { position: "absolute", right: 14 },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E5E7EB",
    alignItems: "center", backgroundColor: "#F9FAFB",
  },
  genderBtnActive: { borderColor: GREEN, backgroundColor: "#ECFDF5" },
  genderText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  genderTextActive: { color: GREEN },
  errorBox: {
    backgroundColor: "#FEE2E2", borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorText: { color: "#DC2626", fontSize: 13, textAlign: "center" },
  submitBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  loginText: { color: "#6B7280", fontSize: 14 },
  loginLink: { color: GREEN, fontSize: 14, fontWeight: "700" },
});
