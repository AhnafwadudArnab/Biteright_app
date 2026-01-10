import { Platform } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';

let cachedIp: string | null = null;
const BACKEND_PORT = 3000;

async function getApiBaseUrl() {
  // Android emulator
  if (Platform.OS === 'android') return `http://192.168.68.104:${BACKEND_PORT}`;
  // iOS simulator
  if (Platform.OS === 'ios') return `http://localhost:${BACKEND_PORT}`;
  // Real device: use local IP
  if (cachedIp) return `http://${cachedIp}:${BACKEND_PORT}`;
  try {
    const ip = await NetworkInfo.getIPV4Address();
    cachedIp = ip;
    if (ip && ip !== '127.0.0.1') return `http://${ip}:${BACKEND_PORT}`;
  } catch {}
  // Fallback
  return `http://localhost:${BACKEND_PORT}`;
}

export async function fetchMealPlan(gender: string, bmi: number) {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}/users/mealplan?gender=${encodeURIComponent(gender.toLowerCase())}&bmi=${encodeURIComponent(bmi)}`;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `API error: ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.message) msg += ` - ${err.message}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
export const LOCAL_IPV4_ADDRESS = '192.168.68.104';