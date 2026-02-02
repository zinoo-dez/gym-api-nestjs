import { apiClient } from "@/lib/api-client";

export interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    specializations: string[];
    certifications: string[];
    isActive: boolean;
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
};
