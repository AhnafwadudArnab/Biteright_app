import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

import { NavigationContainer } from "@react-navigation/native";
import MainHomePage from "./(tabs)/MainHomePage";
import DietPlannerItem from "./Dietplans/Daily_diet_plannigs";
import GenerateDietPlan from "./Dietplans/newPlan";
import WeeklyPlans from "./Dietplans/weeklyPlans";
import WaterIntake from "./WaterFiles/waterintake";

export default function HomeScreen() {
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
