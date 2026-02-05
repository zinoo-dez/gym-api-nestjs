import { create } from "zustand";
import { authService, type AuthResponse } from "@/services/auth.service";

interface AuthState {
  user: AuthResponse["user"] | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => void;
  setUser: (user: AuthResponse["user"]) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (data: AuthResponse) => {
    authService.storeAuth(data);
    set({
      user: data.user,
      token: data.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user: AuthResponse["user"]) => {
    const token = authService.getStoredToken();
    authService.storeAuth({
      accessToken: token || "",
      user,
    });
    set({ user });
  },

  clearAuth: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initAuth: () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
