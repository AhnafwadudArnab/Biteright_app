import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Platform } from "react-native";
import { fetchWithTimeout } from "./lib/fetchWithTimeout";
import { SERVER_URL } from "./serverhost";

// ── Platform-safe storage (SecureStore on native, localStorage on web) ─────────

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── SecureStore keys ───────────────────────────────────────────────────────────

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ── JWT expiry helper ──────────────────────────────────────────────────────────

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  // On mount: restore session from SecureStore if token is still valid
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        const userJson = await storage.getItem(USER_KEY);

        if (token && userJson && !isTokenExpired(token)) {
          const user: AuthUser = JSON.parse(userJson);
          setState({ user, token, isLoading: false });
        } else {
          await storage.removeItem(TOKEN_KEY);
          await storage.removeItem(USER_KEY);
          setState({ user: null, token: null, isLoading: false });
        }
      } catch {
        setState({ user: null, token: null, isLoading: false });
      }
    }

    restoreSession();
  }, []);

  // ── login ──────────────────────────────────────────────────────────────────

  async function login(email: string, password: string): Promise<void> {
    const response = await fetchWithTimeout(
      SERVER_URL + "/users/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      10_000
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Login failed");
    }

    const { token, user } = data as { token: string; user: AuthUser };

    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(USER_KEY, JSON.stringify(user));

    setState({ user, token, isLoading: false });
  }

  // ── logout ─────────────────────────────────────────────────────────────────

  async function logout(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    setState({ user: null, token: null, isLoading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
