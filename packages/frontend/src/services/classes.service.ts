import { apiClient } from "@/lib/api-client";

export interface Class {
    id: string;
    name: string;
    description?: string;
    trainerId: string;
    trainer?: {
        id: string;
        name: string;
        specialization: string;
    };
    startTime: string;
    endTime: string;
    capacity: number;
    enrolled: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ClassesResponse {
    data: Class[];
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

export const classesService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        trainerId?: string;
    }) {
        const response = await apiClient.get<ApiResponse<ClassesResponse>>("/classes", {
            params,
        });
        return response.data.data ?? response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
        return response.data.data ?? response.data;
    },
};
