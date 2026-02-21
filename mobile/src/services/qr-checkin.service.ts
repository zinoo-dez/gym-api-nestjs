import { apiClient } from "@/lib/api/api-client";
import { unwrapApiData, type ApiResponseEnvelope } from "@/types/api";

export interface QrCodeResponse {
  qrCodeToken: string;
  qrCodeDataUrl?: string;
  generatedAt: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    membershipStatus: string;
  };
}

export interface AttendanceResponse {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  type: string;
}

export const qrCheckinService = {
  async getMyQrCode(): Promise<QrCodeResponse> {
    const response = await apiClient.get<
      QrCodeResponse | ApiResponseEnvelope<QrCodeResponse>
    >("/members/me/qr-code");

    return unwrapApiData(response.data);
  },

  async regenerateMyQrCode(): Promise<QrCodeResponse> {
    const response = await apiClient.post<
      QrCodeResponse | ApiResponseEnvelope<QrCodeResponse>
    >("/members/me/qr-code/regenerate");

    return unwrapApiData(response.data);
  },

  async qrCheckIn(qrCodeToken: string): Promise<AttendanceResponse> {
    const response = await apiClient.post<
      AttendanceResponse | ApiResponseEnvelope<AttendanceResponse>
    >("/attendance/qr-checkin", {
      qrCodeToken,
    });

    return unwrapApiData(response.data);
  },
};
