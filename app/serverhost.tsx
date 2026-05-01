import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Automatically resolves the backend URL:
 *
 * 1. app.json extra.serverUrl  (production override)
 * 2. EXPO_PUBLIC_SERVER_URL    (.env explicit override)
 * 3. Auto-detect from Expo dev server host (works on physical device + emulator)
 * 4. localhost fallback        (web / iOS simulator)
 */
function resolveServerUrl(): string {
  // 1. Explicit production URL from app.json extra
  const fromExtra = Constants.expoConfig?.extra?.serverUrl as string | undefined;
  if (fromExtra) return fromExtra;

  // 2. Explicit .env override (only if non-empty)
  const fromEnv = process.env.EXPO_PUBLIC_SERVER_URL;
  if (fromEnv && fromEnv.trim() !== "") return fromEnv.trim();

  // 3. Auto-detect: grab the host Expo dev server is running on,
  //    then use port 3000 for our backend.
  //    Works on physical Android/iOS devices connected to the same WiFi.
  try {
    // SDK 46+ uses expoConfig.hostUri
    const hostUri = Constants.expoConfig?.hostUri;          // e.g. "192.168.68.103:8081"
    if (hostUri) {
      const host = hostUri.split(":")[0];                   // strip the Metro port
      return `http://${host}:3000`;
    }

    // Older SDK fallback via manifest2
    const manifest2Host = (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (manifest2Host) {
      const host = manifest2Host.split(":")[0];
      return `http://${host}:3000`;
    }

    // Legacy manifest fallback
    const legacyHost = (Constants as any).manifest?.debuggerHost;
    if (legacyHost) {
      const host = legacyHost.split(":")[0];
      return `http://${host}:3000`;
    }
  } catch {}

  // 4. Final fallback
  if (Platform.OS === "android") {
    // Android emulator loopback
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
}

export const SERVER_URL = resolveServerUrl();
