import { apiClient } from "@/lib/api-client";

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bio?: string;
  certifications: string[];
  experience: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainersResponse {
  data: Trainer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const trainersService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    specialization?: string;
    isAvailable?: boolean;
  }) {
    const response = await apiClient.get<TrainersResponse>("/trainers", {
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<Trainer>(`/trainers/${id}`);
    return response.data;
  },
};
