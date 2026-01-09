import React, { createContext, useContext, useState } from "react";

const CaloriesContext = createContext<any>(null);

export const CaloriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [goal, setGoal] = useState(2000);
  const [consumed, setConsumed] = useState(0);

  return (
    <CaloriesContext.Provider value={{ goal, setGoal, consumed, setConsumed }}>
      {children}
    </CaloriesContext.Provider>
  );
};

export const useCalories = () => useContext(CaloriesContext);
