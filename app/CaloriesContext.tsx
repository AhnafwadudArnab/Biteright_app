import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useState } from "react";
import { Platform } from "react-native";

interface CaloriesContextValue {
  goal: number;
  consumed: number;
  setGoal: (g: number, userId?: string) => void;
  setConsumed: (c: number) => void;
  loadUserGoal: (userId: string) => Promise<void>;
}

const CaloriesContext = createContext<CaloriesContextValue>({
  goal: 2000,
  consumed: 0,
  setGoal: () => {},
  setConsumed: () => {},
  loadUserGoal: async () => {},
});

// Platform-safe storage
const store = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
};

export const CaloriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [goal, setGoalState] = useState(2000);
  const [consumed, setConsumed] = useState(0);

  // Load goal for a specific user (called after login)
  const loadUserGoal = async (userId: string) => {
    try {
      const saved = await store.get(`calories_goal_${userId}`);
      if (saved) setGoalState(Number(saved));
    } catch {}
  };

  // Set goal and persist per user
  const setGoal = (g: number, userId?: string) => {
    setGoalState(g);
    if (userId) {
      store.set(`calories_goal_${userId}`, String(g)).catch(() => {});
    }
  };

  return (
    <CaloriesContext.Provider value={{ goal, consumed, setGoal, setConsumed, loadUserGoal }}>
      {children}
    </CaloriesContext.Provider>
  );
};

export const useCalories = () => useContext(CaloriesContext);

export default CaloriesContext;
