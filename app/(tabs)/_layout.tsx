import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen name="landingPage" options={{ title: "Landing" }} />
      <Tabs.Screen name="MainHomePage" options={{ title: "Home" }} />
    </Tabs>
  );
}
