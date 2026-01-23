import { NavigationContainer } from "@react-navigation/native";
import MainHomePage from "./(tabs)/MainHomePage.js";
import DietPlannerItem from "./Dietplans/Daily_diet_plannigs.js";
import GenerateDietPlan from "./Dietplans/newPlan.js";
import WeeklyPlans from "./Dietplans/weeklyPlans.js";
import WaterIntake from "./WaterFiles/waterintake.js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
