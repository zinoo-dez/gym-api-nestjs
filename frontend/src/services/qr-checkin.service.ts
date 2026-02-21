import { apiClient } from "@/lib/api-client";

export interface QrCodeResponse {
  qrCodeToken: string;
  qrCodeDataUrl: string;
  generatedAt: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    membershipStatus: string;
  };
}

export interface QrCheckInRequest {
  qrCodeToken: string;
}

export interface AttendanceResponse {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  type: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const qrCheckinService = {
  async getMyQrCode() {
    const response = await apiClient.get<ApiResponse<QrCodeResponse>>(
      "/members/me/qr-code",
    );
    return response.data.data ?? response.data;
  },

  async regenerateMyQrCode() {
    const response = await apiClient.post<ApiResponse<QrCodeResponse>>(
      "/members/me/qr-code/regenerate",
    );
    return response.data.data ?? response.data;
  },

  async qrCheckIn(qrCodeToken: string) {
    const response = await apiClient.post<ApiResponse<AttendanceResponse>>(
      "/attendance/qr-checkin",
      { qrCodeToken },
    );
    return response.data.data ?? response.data;
  },
};
