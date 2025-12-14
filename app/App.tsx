import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import MainHomePage from "./(tabs)/MainHomePage";
import GenerateDietPlan from "./Dietplans/gen_dietplans";
import DietPlannerItem from "./Dietplans/Diet_Planner_Item";
import WeeklyPlans from "./Dietplans/weeklyPlans";
import WaterIntake from "./WaterFiles/waterintake";
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainHomePage" component={MainHomePage} />
        <Stack.Screen name="DietPlan" component={GenerateDietPlan} />
        <Stack.Screen name="DP_your_Charts" component={DietPlannerItem} />
        <Stack.Screen name="Weekly_chart" component={WeeklyPlans} />
        <Stack.Screen name="Water_intake" component={WaterIntake} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
