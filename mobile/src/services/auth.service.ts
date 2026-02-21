import { apiClient } from "@/lib/api/api-client";
import { API_URL } from "@/constants/env";
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

function isValidAuthResponse(payload: unknown): payload is AuthResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    accessToken?: unknown;
    user?: {
      id?: unknown;
      email?: unknown;
      firstName?: unknown;
      lastName?: unknown;
      role?: unknown;
    };
  };

  if (typeof candidate.accessToken !== "string" || !candidate.accessToken) {
    return false;
  }

  if (!candidate.user || typeof candidate.user !== "object") {
    return false;
  }

  return (
    typeof candidate.user.id === "string" &&
    typeof candidate.user.email === "string" &&
    typeof candidate.user.firstName === "string" &&
    typeof candidate.user.lastName === "string" &&
    typeof candidate.user.role === "string"
  );
}

function ensureAuthResponse(payload: unknown): AuthResponse {
  if (isValidAuthResponse(payload)) {
    return payload;
  }

  throw new Error(
    `Unexpected login response from ${API_URL}. Verify EXPO_PUBLIC_API_URL points to the Nest API.`,
  );
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | ApiResponseEnvelope<AuthResponse>>(
      "/auth/login",
      payload,
    );

    return ensureAuthResponse(unwrapApiData(response.data));
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse | ApiResponseEnvelope<AuthResponse>>(
      "/auth/register",
      payload,
    );

    return ensureAuthResponse(unwrapApiData(response.data));
  },
};
