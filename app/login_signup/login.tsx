import { router } from "expo-router";
import { Eye, EyeOff, Leaf, Lock, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../AuthContext";
import { SERVER_URL } from "../serverhost";

const GREEN = "#3BB273";
const DARK  = "#111827";

// ── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep]           = useState<"email" | "otp" | "done">("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const reset = () => { setStep("email"); setEmail(""); setOtp(""); setNewPass(""); setConfirm(""); setError(null); };

  const handleClose = () => { reset(); onClose(); };

  // Step 1 — send OTP
  const sendOtp = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send code"); return; }
      // Dev mode: auto-fill OTP if returned
      if (data.otp) setOtp(data.otp);
      setStep("otp");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  // Step 2 — verify OTP + reset password
  const doReset = async () => {
    if (!otp.trim())    { setError("Please enter the 6-digit code"); return; }
    if (!newPass)       { setError("Please enter a new password"); return; }
    if (newPass.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim(), newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Reset failed"); return; }
      setStep("done");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.sheet}>
          {/* Handle */}
          <View style={mStyles.handle} />

          {step === "done" ? (
            <View style={mStyles.doneBox}>
              <View style={mStyles.doneIcon}>
                <Text style={{ fontSize: 32 }}>✅</Text>
              </View>
              <Text style={mStyles.doneTitle}>Password Reset!</Text>
              <Text style={mStyles.doneSub}>You can now log in with your new password.</Text>
              <TouchableOpacity style={mStyles.btn} onPress={handleClose}>
                <Text style={mStyles.btnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={mStyles.title}>
                {step === "email" ? "Forgot Password?" : "Enter Reset Code"}
              </Text>
              <Text style={mStyles.sub}>
                {step === "email"
                  ? "Enter your email and we'll send a 6-digit reset code."
                  : `We sent a code to ${email}. Enter it below.`}
              </Text>

              {step === "email" && (
                <View style={mStyles.inputWrap}>
                  <Mail size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                  <TextInput
                    style={mStyles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#C4C4C4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}

              {step === "otp" && (
                <>
                  <View style={mStyles.inputWrap}>
                    <TextInput
                      style={[mStyles.input, { letterSpacing: 8, fontSize: 20, textAlign: "center" }]}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="000000"
                      placeholderTextColor="#C4C4C4"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <View style={mStyles.inputWrap}>
                    <Lock size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                    <TextInput
                      style={mStyles.input}
                      value={newPass}
                      onChangeText={setNewPass}
                      placeholder="New password"
                      placeholderTextColor="#C4C4C4"
                      secureTextEntry
                    />
                  </View>
                  <View style={mStyles.inputWrap}>
                    <Lock size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
                    <TextInput
                      style={mStyles.input}
                      value={confirmPass}
                      onChangeText={setConfirm}
                      placeholder="Confirm new password"
                      placeholderTextColor="#C4C4C4"
                      secureTextEntry
                    />
                  </View>
                </>
              )}

              {error ? <Text style={mStyles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[mStyles.btn, loading && { opacity: 0.7 }]}
                onPress={step === "email" ? sendOtp : doReset}
                disabled={loading}
              >
                <Text style={mStyles.btnText}>
                  {loading ? "Please wait…" : step === "email" ? "Send Reset Code" : "Reset Password"}
                </Text>
              </TouchableOpacity>

              {step === "otp" && (
                <TouchableOpacity onPress={() => { setStep("email"); setError(null); }} style={{ marginTop: 12, alignItems: "center" }}>
                  <Text style={{ color: GREEN, fontSize: 13 }}>← Back / Resend code</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleClose} style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ── Main Login Screen ─────────────────────────────────────────────────────────
export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot]     = useState(false);

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale,  { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim,   { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    setLoading(true); setError(null);
    try {
      await login(email, password);
      router.replace("/(tabs)/MainHomePage");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], flex: 1 }}>
        <Animated.View style={[styles.logoRow, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoIcon}><Leaf size={22} color="#fff" /></View>
          <Text style={styles.logoText}>BiteRight</Text>
        </Animated.View>

        <Text style={styles.heading}>Welcome back 👋</Text>
        <Text style={styles.subHeading}>Log in to continue your healthy journey</Text>

        <View style={styles.card}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#C4C4C4" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#C4C4C4" secureTextEntry={!showPassword} style={[styles.input, { flex: 1 }]} />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                {showPassword ? <Eye size={18} color="#9CA3AF" /> : <EyeOff size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot password — now functional */}
          <TouchableOpacity style={styles.forgotBtn} onPress={() => setShowForgot(true)}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
              <Text style={styles.loginBtnText}>{loading ? "Logging in…" : "Login"}</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login_signup/signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#F8FAF9", paddingHorizontal: 24, paddingTop: 60 },
  blobTopRight:   { position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "#D1FAE5", opacity: 0.6 },
  blobBottomLeft: { position: "absolute", bottom: -80, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: "#BBF7D0", opacity: 0.4 },
  logoRow:        { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  logoIcon:       { backgroundColor: GREEN, padding: 10, borderRadius: 14, marginRight: 10 },
  logoText:       { fontSize: 22, fontWeight: "700", color: DARK, letterSpacing: 0.5 },
  heading:        { fontSize: 28, fontWeight: "800", color: DARK, marginBottom: 6 },
  subHeading:     { fontSize: 14, color: "#6B7280", marginBottom: 28 },
  card:           { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4 },
  inputGroup:     { marginBottom: 16 },
  label:          { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  inputWrapper:   { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 14 },
  inputIcon:      { marginRight: 10 },
  input:          { flex: 1, paddingVertical: 14, fontSize: 15, color: DARK },
  eyeBtn:         { padding: 4 },
  forgotBtn:      { alignSelf: "flex-end", marginBottom: 20 },
  forgotText:     { color: GREEN, fontSize: 13, fontWeight: "600" },
  errorBox:       { backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText:      { color: "#DC2626", fontSize: 13, textAlign: "center" },
  loginBtn:       { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: "center", shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  loginBtnText:   { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  dividerRow:     { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  dividerText:    { marginHorizontal: 12, color: "#9CA3AF", fontSize: 13 },
  signupRow:      { flexDirection: "row", justifyContent: "center" },
  signupText:     { color: "#6B7280", fontSize: 14 },
  signupLink:     { color: GREEN, fontSize: 14, fontWeight: "700" },
});

// ── Forgot Password Modal Styles ──────────────────────────────────────────────
const mStyles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:     { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },
  handle:    { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  title:     { fontSize: 22, fontWeight: "800", color: DARK, marginBottom: 8 },
  sub:       { fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 20 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
  input:     { flex: 1, paddingVertical: 14, fontSize: 15, color: DARK },
  error:     { color: "#DC2626", fontSize: 13, marginBottom: 12, textAlign: "center" },
  btn:       { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnText:   { color: "#fff", fontSize: 16, fontWeight: "700" },
  doneBox:   { alignItems: "center", paddingVertical: 16 },
  doneIcon:  { width: 72, height: 72, borderRadius: 36, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  doneTitle: { fontSize: 22, fontWeight: "800", color: DARK, marginBottom: 8 },
  doneSub:   { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 },
});
