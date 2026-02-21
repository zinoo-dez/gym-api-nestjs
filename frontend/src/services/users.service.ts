import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  role: string;
  profile?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface ChangeUserRoleRequest {
  role: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const usersService = {
  async getAll() {
    const response = await apiClient.get<ApiResponse<UserProfile[]>>(`/users`);
    return response.data.data ?? response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateUserRequest) {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(`/users/${id}`, data);
    return response.data.data ?? response.data;
  },

  async changeRole(id: string, data: ChangeUserRoleRequest) {
    const response = await apiClient.patch<ApiResponse<UserProfile>>(
      `/users/${id}/role`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/users/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
