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

export interface CreateMemberRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
}

export interface UpdateMemberRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
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

    async getMe() {
        const response = await apiClient.get<ApiResponse<Member>>(`/members/me`);
        return response.data.data ?? response.data;
    },

    async getMyBookings() {
        const response = await apiClient.get<ApiResponse<any[]>>(`/members/me/bookings`);
        return response.data.data ?? response.data;
    },

    async getMyWorkoutPlans() {
        const response = await apiClient.get<ApiResponse<any[]>>(`/members/me/workout-plans`);
        return response.data.data ?? response.data;
    },

    async create(data: CreateMemberRequest) {
        const response = await apiClient.post<ApiResponse<Member>>(`/members`, data);
        return response.data.data ?? response.data;
    },

    async update(id: string, data: UpdateMemberRequest) {
        const response = await apiClient.patch<ApiResponse<Member>>(`/members/${id}`, data);
        return response.data.data ?? response.data;
    },

    async deactivate(id: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/members/${id}`);
        return response.data.data ?? response.data;
    },
};
