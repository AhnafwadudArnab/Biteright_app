import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { SERVER_URL } from "./serverhost";

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
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userJson = await SecureStore.getItemAsync(USER_KEY);

        if (token && userJson && !isTokenExpired(token)) {
          const user: AuthUser = JSON.parse(userJson);
          setState({ user, token, isLoading: false });
        } else {
          // Token absent or expired — clear any stale data
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(USER_KEY);
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
    const response = await fetch(SERVER_URL + "/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Login failed");
    }

    const { token, user } = data as { token: string; user: AuthUser };

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    setState({ user, token, isLoading: false });
  }

  // ── logout ─────────────────────────────────────────────────────────────────

  async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
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
