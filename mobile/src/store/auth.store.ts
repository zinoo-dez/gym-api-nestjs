import { create } from "zustand";

import {
  clearAuthSession,
  getAccessToken,
  getStoredUser,
  setAuthSession,
} from "@/lib/storage/auth-storage";
import type { AuthResponse, AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
  bootstrap: () => Promise<void>;
  setAuth: (payload: AuthResponse) => Promise<void>;
  setLoggedOut: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  initialized: false,
  isAuthenticated: false,

  bootstrap: async () => {
    const [token, user] = await Promise.all([getAccessToken(), getStoredUser()]);

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        initialized: true,
      });
      return;
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      initialized: true,
    });
  },

  setAuth: async ({ accessToken, user }) => {
    await setAuthSession(accessToken, user);
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      initialized: true,
    });
  },

  setLoggedOut: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      initialized: true,
    });
  },

  logout: async () => {
    await clearAuthSession();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      initialized: true,
    });
  },
}));
