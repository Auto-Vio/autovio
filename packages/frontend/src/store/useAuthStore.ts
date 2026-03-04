import { create } from "zustand";
import type { User, AuthResponse, APITokenMeta, CreateTokenRequest, CreateTokenResponse } from "@autovio/shared";

const AUTH_TOKEN_KEY = "autovio_auth_token";
const REFRESH_TOKEN_KEY = "autovio_refresh_token";
const USER_KEY = "autovio_user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  tokens: APITokenMeta[];
  tokensLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  loadFromStorage: () => void;
  clearError: () => void;

  fetchTokens: () => Promise<void>;
  createToken: (request: CreateTokenRequest) => Promise<CreateTokenResponse>;
  deleteToken: (id: string) => Promise<void>;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

function getStoredAuth(): { accessToken: string | null; refreshToken: string | null; user: User | null } {
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  const user = userJson ? JSON.parse(userJson) : null;
  return { accessToken, refreshToken, user };
}

function storeAuth(accessToken: string, refreshToken: string, user: User): void {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: [],
  tokensLoading: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      storeAuth(response.accessToken, response.refreshToken, response.user);
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      
      storeAuth(response.accessToken, response.refreshToken, response.user);
      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      tokens: [],
    });
  },

  refreshAuth: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return false;

    try {
      const response = await apiRequest<{ accessToken: string; refreshToken: string }>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }
      );
      
      const { user } = get();
      if (user) {
        storeAuth(response.accessToken, response.refreshToken, user);
      }
      
      set({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  loadFromStorage: () => {
    const { accessToken, refreshToken, user } = getStoredAuth();
    if (accessToken && user) {
      set({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
      });
    }
  },

  clearError: () => set({ error: null }),

  fetchTokens: async () => {
    const { accessToken } = get();
    if (!accessToken) return;

    set({ tokensLoading: true });
    try {
      const tokens = await apiRequest<APITokenMeta[]>("/tokens", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ tokens, tokensLoading: false });
    } catch {
      set({ tokensLoading: false });
    }
  },

  createToken: async (request) => {
    const { accessToken } = get();
    if (!accessToken) throw new Error("Not authenticated");

    const response = await apiRequest<CreateTokenResponse>("/tokens", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(request),
    });
    
    set((state) => ({ tokens: [response.meta, ...state.tokens] }));
    return response;
  },

  deleteToken: async (id) => {
    const { accessToken } = get();
    if (!accessToken) throw new Error("Not authenticated");

    await fetch(`/api/tokens/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    set((state) => ({ tokens: state.tokens.filter((t) => t.id !== id) }));
  },
}));

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
