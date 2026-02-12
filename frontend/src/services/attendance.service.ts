import { apiClient } from "@/lib/api-client";

export type AttendanceType = "GYM_VISIT" | "CLASS_ATTENDANCE";

export interface AttendanceRecord {
  id: string;
  memberId: string;
  classScheduleId?: string;
  checkInTime: string;
  checkOutTime?: string;
  type: AttendanceType;
  createdAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  classSchedule?: {
    id: string;
    classId: string;
    className: string;
    startTime: string;
    endTime: string;
  };
}

export interface AttendanceResponse {
  data: AttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CheckInRequest {
  memberId: string;
  type: AttendanceType;
  classScheduleId?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const attendanceService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    memberId?: string;
    startDate?: string;
    endDate?: string;
    type?: AttendanceType;
  }) {
    const response = await apiClient.get<ApiResponse<AttendanceResponse>>(
      "/attendance",
      { params },
    );

    return response.data.data ?? response.data;
  },

  async checkIn(data: CheckInRequest) {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
      "/attendance/check-in",
      data,
    );
    return response.data.data ?? response.data;
  },

  async checkOut(attendanceId: string) {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>(
      `/attendance/${attendanceId}/check-out`,
    );
    return response.data.data ?? response.data;
  },
};
