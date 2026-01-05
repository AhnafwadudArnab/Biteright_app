import { router } from "expo-router";
import { ArrowLeft, Lock, Mail, User } from "lucide-react-native";
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

  const handleSubmit = () => {
    // signup logic here
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
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupBtn} onPress={() => router.push("/login_signup/login")}>
          <Text style={styles.signupText}>SignUp</Text>
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
});
