import { apiClient } from "@/lib/api-client";

export interface Feature {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  defaultName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  name: string;
  description?: string;
  isSystem?: boolean;
  defaultName?: string;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const featuresService = {
  async getAll(params?: { page?: number; limit?: number; name?: string }) {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Feature>>
    >("/features", { params });
    const payload = response.data.data ?? response.data;
    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data : [],
    };
  },

  async create(data: CreateFeatureRequest) {
    const response = await apiClient.post<ApiResponse<Feature>>(
      "/features",
      data,
    );
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateFeatureRequest) {
    const response = await apiClient.patch<ApiResponse<Feature>>(
      `/features/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async restoreDefaultName(id: string) {
    const response = await apiClient.patch<ApiResponse<Feature>>(
      `/features/${id}/restore-default`,
    );
    return response.data.data ?? response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/features/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
