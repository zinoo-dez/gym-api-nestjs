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

export interface CreateClassRequest {
    name: string;
    description?: string;
    trainerId: string;
    schedule: string;
    duration: number;
    capacity: number;
    classType: string;
    recurrenceRule?: string;
    occurrences?: number;
}

export interface UpdateClassRequest {
    name?: string;
    description?: string;
    trainerId?: string;
    schedule?: string;
    duration?: number;
    capacity?: number;
    classType?: string;
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

    async create(data: CreateClassRequest) {
        const response = await apiClient.post<ApiResponse<ClassSchedule>>(`/classes`, data);
        return response.data.data ?? response.data;
    },

    async update(id: string, data: UpdateClassRequest) {
        const response = await apiClient.patch<ApiResponse<ClassSchedule>>(`/classes/${id}`, data);
        return response.data.data ?? response.data;
    },

    async deactivate(id: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/classes/${id}`);
        return response.data.data ?? response.data;
    },

    async bookClass(classScheduleId: string, memberId: string) {
        const response = await apiClient.post<ApiResponse<any>>(
            `/classes/${classScheduleId}/book`,
            { memberId },
        );
        return response.data.data ?? response.data;
    },

    async cancelBooking(bookingId: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(
            `/classes/bookings/${bookingId}`,
        );
        return response.data.data ?? response.data;
    },
};
