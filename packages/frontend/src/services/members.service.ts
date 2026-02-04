import { apiClient } from "@/lib/api-client";

export interface Member {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MembersResponse {
    data: Member[];
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

export const membersService = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        name?: string;
        email?: string;
        status?: string;
        planId?: string;
    }) {
        const response = await apiClient.get<ApiResponse<MembersResponse>>(
            "/members",
            { params },
        );
        return response.data.data ?? response.data;
    },

    async getById(id: string) {
        const response = await apiClient.get<ApiResponse<Member>>(`/members/${id}`);
        return response.data.data ?? response.data;
    },
};
