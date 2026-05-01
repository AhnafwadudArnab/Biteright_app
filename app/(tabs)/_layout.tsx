import { Tabs } from "expo-router";
import { CaloriesProvider } from "../CaloriesContext";

export default function TabLayout() {
  return (
    <CaloriesProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="landingPage" options={{ title: "Landing" }} />
        <Tabs.Screen name="MainHomePage" options={{ title: "Home" }} />
      </Tabs>
    </CaloriesProvider>
  );
}
