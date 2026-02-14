import { apiClient } from "@/lib/api-client";

export type StaffRole =
  | "MANAGER"
  | "RECEPTIONIST"
  | "MAINTENANCE"
  | "CLEANING"
  | "SECURITY";

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  staffRole: StaffRole;
  employeeId: string;
  hireDate: string;
  department?: string;
  position: string;
  emergencyContact?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffResponse {
  data: StaffMember[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  staffRole: StaffRole;
  employeeId: string;
  hireDate: string;
  department?: string;
  position: string;
  emergencyContact?: string;
  address?: string;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  staffRole?: StaffRole;
  employeeId?: string;
  hireDate?: string;
  department?: string;
  position?: string;
  emergencyContact?: string;
  address?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const staffService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
    staffRole?: StaffRole;
    department?: string;
    isActive?: boolean;
  }) {
    const response = await apiClient.get<ApiResponse<StaffResponse>>("/staff", {
      params,
    });
    return response.data.data ?? response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<StaffMember>>(`/staff/${id}`);
    return response.data.data ?? response.data;
  },

  async create(data: CreateStaffRequest) {
    const response = await apiClient.post<ApiResponse<StaffMember>>("/staff", data);
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateStaffRequest) {
    const response = await apiClient.patch<ApiResponse<StaffMember>>(
      `/staff/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async deactivate(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/staff/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
