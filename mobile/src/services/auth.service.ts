import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";
import type { AuthResponse } from "@/types/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "MEMBER" | "TRAINER" | "ADMIN" | "STAFF";
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | ApiResponseEnvelope<AuthResponse>>(
      "/auth/login",
      payload,
    );

    return unwrapApiData(response.data);
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | ApiResponseEnvelope<AuthResponse>>(
      "/auth/register",
      payload,
    );

    return unwrapApiData(response.data);
  },
};
