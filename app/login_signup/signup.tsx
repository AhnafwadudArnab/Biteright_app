// import app from "@/Backend_Server/src/app";
import { router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignupScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [gender, setGender] = useState<string>("male"); // Default to 'male'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword || !gender) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    const payload = {
      name,
      email,
      password,
      gender, // Always 'male' or 'female'
    };
    console.log('Signup payload:', payload);
    try {
      const response = await fetch("http://10.15.52.69:3000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registration failed");
      } else {
        // Registration successful, redirect to login
        router.replace("/login_signup/login");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Back Button */}
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={24} color="#374151" />
      </Pressable>

      {/* Heading */}
      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>
        Sign up to start your healthy journey
      </Text>

      {/* Form */}
      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              style={styles.input}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your_email@example.com"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, { flexDirection: "row", alignItems: "center" }]}> 
            <Lock size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              style={[styles.input, { paddingLeft: 40, flex: 1 }]}
            />
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={{ position: "absolute", right: 16 }}>
              {showPassword ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrapper, { flexDirection: "row", alignItems: "center" }]}> 
            <Lock size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, { paddingLeft: 40, flex: 1 }]}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)} style={{ position: "absolute", right: 16 }}>
              {showConfirmPassword ? <Eye size={20} color="#9CA3AF" /> : <EyeOff size={20} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity
              style={[styles.radioBtn, gender === 'male' && styles.radioBtnSelected]}
              onPress={() => setGender('male')}
            >
              <View style={[styles.radioCircle, gender === 'male' && styles.radioCircleSelected]} />
              <Text style={styles.radioLabel}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioBtn, gender === 'female' && styles.radioBtnSelected]}
              onPress={() => setGender('female')}
            >
              <View style={[styles.radioCircle, gender === 'female' && styles.radioCircleSelected]} />
              <Text style={styles.radioLabel}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signupBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            {loading ? "Signing Up..." : "SignUp"}
          </Text>
        </TouchableOpacity>

        {/* Login Redirect */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/login_signup/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 32,
  },

  backBtn: {
    marginTop: 16,
    marginBottom: 24,
    alignSelf: "flex-start",
  },

  heading: {
    fontSize: 30,
    color: "#111827",
    marginBottom: 8,
  },

  subheading: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },

  form: {
    flex: 1,
    padding: 18,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },

  inputWrapper: {
    justifyContent: "center",
  },

  icon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },

  input: {
    paddingLeft: 48,
    paddingRight: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    fontSize: 16,
  },

  signupBtn: {
    backgroundColor: "#3BB273",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },

  signupText: {
    color: "white",
    fontSize: 16,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  loginText: {
    color: "#6B7280",
  },

  loginLink: {
    color: "#3BB273",
  },

  // Radio button styles
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioBtnSelected: {},
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3BB273",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "white",
  },
  radioCircleSelected: {
    backgroundColor: "#3BB273",
    borderColor: "#3BB273",
  },
  radioLabel: {
    fontSize: 16,
    color: "#374151",
    marginRight: 8,
  },
});
