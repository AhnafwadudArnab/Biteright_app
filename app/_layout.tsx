import { Stack } from "expo-router";
import { AuthProvider } from "./AuthContext";
import { CaloriesProvider } from "./CaloriesContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CaloriesProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CaloriesProvider>
    </AuthProvider>
  );
}
