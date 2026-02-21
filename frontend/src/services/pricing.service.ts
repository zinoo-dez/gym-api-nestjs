import { apiClient } from "@/lib/api-client";

export type PricingCategory = "MEMBERSHIP" | "CLASS" | "MERCHANDISE";

export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  category: PricingCategory;
  price: number;
  currency: string;
  duration?: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PricingResponse {
  data: PricingItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreatePricingRequest {
  name: string;
  description?: string;
  category: PricingCategory;
  price: number;
  currency?: string;
  duration?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePricingRequest extends Partial<CreatePricingRequest> {}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const pricingService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: PricingCategory;
    isActive?: boolean;
  }) {
    const response = await apiClient.get<ApiResponse<PricingResponse>>("/pricing", {
      params,
    });
    return response.data.data ?? response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<PricingItem>>(`/pricing/${id}`);
    return response.data.data ?? response.data;
  },

  async create(data: CreatePricingRequest) {
    const response = await apiClient.post<ApiResponse<PricingItem>>("/pricing", data);
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdatePricingRequest) {
    const response = await apiClient.patch<ApiResponse<PricingItem>>(
      `/pricing/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/pricing/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
