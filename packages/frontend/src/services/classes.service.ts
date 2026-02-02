import { apiClient } from "@/lib/api-client";

export interface Class {
  id: string;
  name: string;
  description?: string;
  trainerId: string;
  trainer?: {
    id: string;
    name: string;
    specialization: string;
  };
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassesResponse {
  data: Class[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const classesService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    trainerId?: string;
  }) {
    const response = await apiClient.get<ClassesResponse>("/classes", {
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },
};
