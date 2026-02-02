import { apiClient } from "@/lib/api-client";

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlansResponse {
  data: MembershipPlan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const membershipsService = {
  async getAllPlans(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const response = await apiClient.get<MembershipPlansResponse>(
      "/membership-plans",
      { params },
    );
    return response.data;
  },

  async getPlanById(id: string) {
    const response = await apiClient.get<MembershipPlan>(
      `/membership-plans/${id}`,
    );
    return response.data;
  },
};
