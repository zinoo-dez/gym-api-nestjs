import { apiClient } from "@/lib/api-client";

export interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address?: string;
    avatarUrl?: string;
    specializations: string[];
    certifications: string[];
    isActive: boolean;
    experience?: number;
    hourlyRate?: number;
    createdAt: string;
    updatedAt: string;
    classes?: Array<{
        id: string;
        name: string;
        schedule: string;
        duration: number;
        capacity: number;
        classType: string;
    }>;
}

export interface TrainersResponse {
    data: Trainer[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CreateTrainerRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address?: string;
    avatarUrl?: string;
    specializations: string[];
    certifications?: string[];
    experience?: number;
    hourlyRate?: number;
}

export interface UpdateTrainerRequest {
    firstName?: string;
    lastName?: string;
    address?: string;
    avatarUrl?: string;
    specializations?: string[];
    certifications?: string[];
    experience?: number;
    hourlyRate?: number;
}

interface ApiResponse<T> {
    data: T;
    statusCode: number;
    timestamp: string;
    path: string;
}

export const trainersService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        specialization?: string;
        isAvailable?: boolean;
    }) {
        const response = await apiClient.get<ApiResponse<TrainersResponse>>("/trainers", {
            params,
        });
        return response.data.data ?? response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<ApiResponse<Trainer>>(`/trainers/${id}`);
        return response.data.data ?? response.data;
    },

    async create(data: CreateTrainerRequest) {
        const response = await apiClient.post<ApiResponse<Trainer>>(`/trainers`, data);
        return response.data.data ?? response.data;
    },

    async update(id: string, data: UpdateTrainerRequest) {
        const response = await apiClient.patch<ApiResponse<Trainer>>(`/trainers/${id}`, data);
        return response.data.data ?? response.data;
    },

    async deactivate(id: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/trainers/${id}`);
        return response.data.data ?? response.data;
    },
};
