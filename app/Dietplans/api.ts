import { Platform } from 'react-native';

function getApiBaseUrl() {
  // For Android emulator use 10.0.2.2, for iOS simulator use localhost, for web use localhost
  if (Platform.OS === 'android') return 'http://192.168.68.104:3000';
  return 'http://localhost:3000';
}

export async function fetchMealPlan(gender: string, bmi: number) {
  // Always send gender as lowercase
  const url = `${getApiBaseUrl()}/users/mealplan?gender=${gender.toLowerCase()}&bmi=${bmi}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch meal plan');
  return res.json();
}
