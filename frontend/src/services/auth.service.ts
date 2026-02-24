import api from "./api";
import { User } from "@/store/auth.store";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const authService = {
  login: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<any>("/auth/login", data);
    return response.data.data;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<any>("/auth/register", data);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post<any>("/auth/forgot-password", { email });
    return response.data.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post<any>("/auth/reset-password", { token, newPassword });
    return response.data.data;
  },
};
