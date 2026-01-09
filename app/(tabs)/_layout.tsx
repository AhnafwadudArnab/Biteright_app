import { Tabs } from "expo-router";
import React from "react";
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
        <Tabs.Screen name="ProfilePage" options={{ title: "Profile" }} />
      </Tabs>
    </CaloriesProvider>
  );
}
