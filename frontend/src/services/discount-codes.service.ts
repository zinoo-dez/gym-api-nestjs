import { apiClient } from "@/lib/api-client";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  amount: number;
  isActive: boolean;
  maxRedemptions?: number | null;
  usedCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscountCodeRequest {
  code: string;
  description?: string;
  type: DiscountType;
  amount: number;
  isActive?: boolean;
  maxRedemptions?: number;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateDiscountCodeRequest extends Partial<CreateDiscountCodeRequest> {}

interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const discountCodesService = {
  async getAll(params?: { page?: number; limit?: number; code?: string; isActive?: boolean }) {
    const response = await apiClient.get<ApiResponse<Paginated<DiscountCode>>>(
      "/discount-codes",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async create(data: CreateDiscountCodeRequest) {
    const response = await apiClient.post<ApiResponse<DiscountCode>>(
      "/discount-codes",
      data,
    );
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateDiscountCodeRequest) {
    const response = await apiClient.patch<ApiResponse<DiscountCode>>(
      `/discount-codes/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/discount-codes/${id}`,
    );
    return response.data.data ?? response.data;
  },

  async getUsage() {
    const response = await apiClient.get<ApiResponse<Array<{
      id: string;
      code: string;
      usedCount: number;
      totalDiscount: number;
    }>>>("/discount-codes/usage");
    return response.data.data ?? response.data;
  },
};
