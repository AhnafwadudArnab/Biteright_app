import { Platform } from 'react-native';
import { NetworkInfo } from 'react-native-network-info';

let cachedIp: string | null = null;

// Home and University IP/Port
const HOME_IP = '192.168.68.104';
const HOME_PORT = 3000;
const UNIVERSITY_IP = '10.15.52.69'; // Change to your university IP
const UNIVERSITY_PORT = 3000; // Change to your university port

// Toggle this value to switch between home/university
const USE_UNIVERSITY = false; // Set true for university, false for home

function getSelectedIpPort() {
  if (USE_UNIVERSITY) {
    return { ip: UNIVERSITY_IP, port: UNIVERSITY_PORT };
  } else {
    return { ip: HOME_IP, port: HOME_PORT };
  }
}

async function getApiBaseUrl() {
  const { ip, port } = getSelectedIpPort();
  // Android emulator
  if (Platform.OS === 'android') return `http://${ip}:${port}`;
  // iOS simulator
  if (Platform.OS === 'ios') return `http://localhost:${port}`;
  // Real device: use local IP
  if (cachedIp) return `http://${cachedIp}:${port}`;
  try {
    const ipAddr = await NetworkInfo.getIPV4Address();
    cachedIp = ipAddr;
    if (ipAddr && ipAddr !== '127.0.0.1') return `http://${ipAddr}:${port}`;
  } catch {}
  // Fallback
  return `http://localhost:${port}`;
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