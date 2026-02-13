import { apiClient } from "@/lib/api-client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "MEMBER" | "TRAINER" | "ADMIN";
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<any>("/auth/login", data);
    // Backend wraps response in a data object
    return response.data.data || response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<any>("/auth/register", data);
    // Backend wraps response in a data object
    return response.data.data || response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await apiClient.post<any>("/auth/change-password", data);
    return response.data.data ?? response.data;
  },

  async forgotPassword(data: { email: string }) {
    const response = await apiClient.post<any>("/auth/forgot-password", data);
    return response.data.data ?? response.data;
  },

  getStoredToken(): string | null {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      return null;
    }
    return token;
  },

  getStoredUser(): AuthResponse["user"] | null {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined" || user === "null") {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  storeAuth(data: AuthResponse): void {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  },
};
