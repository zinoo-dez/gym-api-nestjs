import api from "./api";
import { User } from "@/stores/auth.store";

export interface AuthResponse {
  accessToken: string;
  user: User;
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
};
