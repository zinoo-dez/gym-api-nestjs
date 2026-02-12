import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const usersService = {
  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateUserRequest) {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${id}`, data);
    return response.data.data ?? response.data;
  },
};
