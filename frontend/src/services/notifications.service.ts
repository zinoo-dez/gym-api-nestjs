import { apiClient } from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const notificationsService = {
  async getAdmin() {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
      "/notifications/admin",
    );
    return response.data.data ?? response.data;
  },

  async getMe() {
    const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
      "/notifications/me",
    );
    return response.data.data ?? response.data;
  },

  async markRead(id: string) {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/notifications/${id}/read`,
    );
    return response.data.data ?? response.data;
  },

  async markAllAdminRead() {
    const response = await apiClient.patch<ApiResponse<any>>(
      "/notifications/admin/read-all",
    );
    return response.data.data ?? response.data;
  },

  async markAllMeRead() {
    const response = await apiClient.patch<ApiResponse<any>>(
      "/notifications/me/read-all",
    );
    return response.data.data ?? response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/notifications/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
