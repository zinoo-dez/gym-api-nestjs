import { apiClient } from "@/lib/api-client";

export interface MembershipPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationDays: number;
    features: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MembershipPlansResponse {
    data: MembershipPlan[];
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

export const membershipsService = {
    async getAllPlans(params?: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    }) {
        const response = await apiClient.get<ApiResponse<MembershipPlansResponse>>(
            "/membership-plans",
            { params },
        );
        return response.data.data ?? response.data;
    },

    async getPlanById(id: string) {
        const response = await apiClient.get<ApiResponse<MembershipPlan>>(
            `/membership-plans/${id}`,
        );
        return response.data.data ?? response.data;
    },
};
