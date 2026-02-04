import { apiClient } from "@/lib/api-client";

export interface ClassSchedule {
    id: string;
    name: string;
    description?: string;
    trainerId: string;
    trainerName?: string;
    schedule: string;
    duration: number;
    capacity: number;
    classType: string;
    isActive: boolean;
    availableSlots?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClassesResponse {
    data: ClassSchedule[];
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
        classType?: string;
    }) {
        const response = await apiClient.get<ApiResponse<ClassesResponse>>("/classes", {
            params,
        });
        return response.data.data ?? response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<ApiResponse<ClassSchedule>>(`/classes/${id}`);
        return response.data.data ?? response.data;
    },
};
