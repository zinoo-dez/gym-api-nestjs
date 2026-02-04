import { apiClient } from "@/lib/api-client";

export interface WorkoutPlan {
    id: string;
    memberId: string;
    trainerId: string;
    name: string;
    description?: string;
    goal: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    exercises?: any[];
}

export interface WorkoutPlansResponse {
    data: WorkoutPlan[];
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

export const workoutPlansService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        goal?: string;
        memberId?: string;
        trainerId?: string;
    }) {
        const response = await apiClient.get<ApiResponse<WorkoutPlansResponse>>(
            "/workout-plans",
            { params },
        );
        return response.data.data ?? response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<ApiResponse<WorkoutPlan>>(`/workout-plans/${id}`);
        return response.data.data ?? response.data;
    },

    async getByMember(memberId: string) {
        const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>(
            `/workout-plans/member/${memberId}`,
        );
        return response.data.data ?? response.data;
    },
};
