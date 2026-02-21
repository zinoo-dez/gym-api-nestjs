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

export interface ClassBooking {
    id: string;
    memberId: string;
    classScheduleId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClassWaitlistEntry {
    id: string;
    memberId: string;
    classScheduleId: string;
    position: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClassFavorite {
    id: string;
    memberId: string;
    classId: string;
    className: string;
    classType: string;
    createdAt: string;
}

export interface ClassPackage {
    id: string;
    name: string;
    description?: string;
    passType: string;
    creditsIncluded: number;
    price: number;
    validityDays?: number;
    monthlyUnlimited: boolean;
    isActive: boolean;
}

export interface CreateClassPackageRequest {
    name: string;
    description?: string;
    passType: string;
    classId?: string;
    creditsIncluded: number;
    price: number;
    validityDays?: number;
    monthlyUnlimited?: boolean;
}

export interface MemberCredits {
    memberId: string;
    totalRemainingCredits: number;
    hasUnlimitedPass: boolean;
    activePasses: Array<{
        passId: string;
        packageName: string;
        expiresAt: string;
        remainingCredits: number;
        monthlyUnlimited: boolean;
    }>;
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
        const response = await apiClient.get<ApiResponse<ClassSchedule>>(`/classes/schedules/${id}`);
        return response.data.data ?? response.data;
    },

    async create(data: CreateClassRequest) {
        const response = await apiClient.post<ApiResponse<ClassSchedule>>(`/classes`, data);
        return response.data.data ?? response.data;
    },

    async update(id: string, data: UpdateClassRequest) {
        const response = await apiClient.patch<ApiResponse<ClassSchedule>>(`/classes/schedules/${id}`, data);
        return response.data.data ?? response.data;
    },

    async deactivate(id: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/classes/schedules/${id}`);
        return response.data.data ?? response.data;
    },

    async bookClass(classScheduleId: string, memberId: string) {
        const response = await apiClient.post<ApiResponse<any>>(
            `/classes/schedules/${classScheduleId}/book`,
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

    async getMemberBookings(memberId: string) {
        const response = await apiClient.get<ApiResponse<any[]>>(`/classes/members/${memberId}/bookings`);
        return response.data.data ?? response.data;
    },

    async joinWaitlist(classScheduleId: string, memberId: string) {
        const response = await apiClient.post<ApiResponse<ClassWaitlistEntry>>(
            `/classes/schedules/${classScheduleId}/waitlist`,
            { memberId },
        );
        return response.data.data ?? response.data;
    },

    async leaveWaitlist(waitlistId: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/classes/waitlist/${waitlistId}`);
        return response.data.data ?? response.data;
    },

    async getMemberWaitlist(memberId: string) {
        const response = await apiClient.get<ApiResponse<any[]>>(`/classes/members/${memberId}/waitlist`);
        return response.data.data ?? response.data;
    },

    async favoriteClass(classId: string, memberId: string) {
        const response = await apiClient.post<ApiResponse<ClassFavorite>>(`/classes/favorites/${classId}`, { memberId });
        return response.data.data ?? response.data;
    },

    async unfavoriteClass(classId: string, memberId: string) {
        const response = await apiClient.delete<ApiResponse<{ message: string }>>(
            `/classes/favorites/${classId}/member/${memberId}`,
        );
        return response.data.data ?? response.data;
    },

    async getMemberFavorites(memberId: string) {
        const response = await apiClient.get<ApiResponse<ClassFavorite[]>>(`/classes/members/${memberId}/favorites`);
        return response.data.data ?? response.data;
    },

    async getClassPackages() {
        const response = await apiClient.get<ApiResponse<ClassPackage[]>>(`/classes/packages`);
        return response.data.data ?? response.data;
    },

    async purchaseClassPackage(classPackageId: string, memberId: string) {
        const response = await apiClient.post<ApiResponse<any>>(`/classes/packages/${classPackageId}/purchase`, { memberId });
        return response.data.data ?? response.data;
    },

    async getMemberCredits(memberId: string) {
        const response = await apiClient.get<ApiResponse<MemberCredits>>(`/classes/members/${memberId}/credits`);
        return response.data.data ?? response.data;
    },

    async rateInstructor(classScheduleId: string, memberId: string, rating: number, review?: string) {
        const response = await apiClient.post<ApiResponse<any>>(`/classes/schedules/${classScheduleId}/rate`, {
            memberId,
            rating,
            review,
        });
        return response.data.data ?? response.data;
    },

    async getInstructorProfile(trainerId: string) {
        const response = await apiClient.get<ApiResponse<any>>(`/classes/instructors/${trainerId}/profile`);
        return response.data.data ?? response.data;
    },

    async getAllBookings(classScheduleId?: string) {
        const response = await apiClient.get<ApiResponse<any[]>>(`/classes/bookings`, {
            params: { classScheduleId },
        });
        return response.data.data ?? response.data;
    },

    async getAllWaitlist(classScheduleId?: string) {
        const response = await apiClient.get<ApiResponse<any[]>>(`/classes/waitlist`, {
            params: { classScheduleId },
        });
        return response.data.data ?? response.data;
    },

    async promoteWaitlist(classScheduleId: string) {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            `/classes/schedules/${classScheduleId}/waitlist/promote`,
        );
        return response.data.data ?? response.data;
    },

    async createClassPackage(data: CreateClassPackageRequest) {
        const response = await apiClient.post<ApiResponse<ClassPackage>>(`/classes/packages`, data);
        return response.data.data ?? response.data;
    },
};
