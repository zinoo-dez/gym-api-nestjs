import api from "./api";
import type { ApiEnvelope } from "./api.types";
import { User } from "@/store/auth.store";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface ForgotPasswordResponse {
    message: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", data);
        return response.data.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiEnvelope<AuthResponse>>("/auth/register", data);
        return response.data.data;
    },

    forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
        const response = await api.post<ApiEnvelope<ForgotPasswordResponse>>("/auth/forgot-password", { email });
        return response.data.data;
    },

    resetPassword: async (token: string, newPassword: string): Promise<ForgotPasswordResponse> => {
        const response = await api.post<ApiEnvelope<ForgotPasswordResponse>>("/auth/reset-password", { token, newPassword });
        return response.data.data;
    },
};
