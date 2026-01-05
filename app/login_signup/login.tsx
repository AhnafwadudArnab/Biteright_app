import { Leaf, Lock, Mail } from "lucide-react-native";
import React from "react";
import { router } from "expo-router";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  handleSubmit: () => void;
};


const Login = ({ handleSubmit }: Props) =>{
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Leaf size={24} color="#ffffff" />
        </View>
        <Text style={styles.logoText}>BiteRight</Text>
      </View>

      {/* Heading */}
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subHeading}>
        Log in to continue your healthy journey
      </Text>

      {/* Form */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#9CA3AF" style={styles.icon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotButton}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Sign up */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don&apos;t have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/login_signup/signup")}>
  <Text style={styles.signupLink}>Sign Up</Text>
</TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 32,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    marginBottom: 48,
  },

  logoIcon: {
    backgroundColor: "#3BB273",
    padding: 8,
    borderRadius: 999,
  },

  logoText: {
    fontSize: 24,
    color: "#111827",
    fontWeight: "500",
  },

  heading: {
    fontSize: 30,
    color: "#111827",
    marginBottom: 8,
    fontWeight: "600",
  },

  subHeading: {
    color: "#4B5563",
    marginBottom: 32,
  },

  form: {
    flex: 1,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },

  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },

  icon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },

  forgotText: {
    color: "#3BB273",
    fontSize: 14,
  },

  loginButton: {
    backgroundColor: "#3BB273",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },

  signupText: {
    color: "#4B5563",
  },

  signupLink: {
    color: "#3BB273",
    fontWeight: "500",
  },
});
