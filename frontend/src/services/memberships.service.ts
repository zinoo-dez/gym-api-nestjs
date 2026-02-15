import { apiClient } from "@/lib/api-client";

export interface MembershipPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  unlimitedClasses: boolean;
  personalTrainingHours: number;
  accessToEquipment: boolean;
  accessToLocker: boolean;
  nutritionConsultation: boolean;
  planFeatures?: MembershipPlanFeature[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export type FeatureLevel = "BASIC" | "STANDARD" | "PREMIUM";

export interface MembershipPlanFeature {
  featureId: string;
  name: string;
  description?: string;
  level: FeatureLevel;
}

export interface CreateMembershipPlanRequest {
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  unlimitedClasses?: boolean;
  personalTrainingHours?: number;
  accessToEquipment?: boolean;
  accessToLocker?: boolean;
  nutritionConsultation?: boolean;
  features?: { featureId: string; level: FeatureLevel }[];
}

export interface UpdateMembershipPlanRequest {
  name?: string;
  description?: string;
  durationDays?: number;
  price?: number;
  unlimitedClasses?: boolean;
  personalTrainingHours?: number;
  accessToEquipment?: boolean;
  accessToLocker?: boolean;
  nutritionConsultation?: boolean;
  features?: { featureId: string; level: FeatureLevel }[];
}

export interface SubscribeMembershipRequest {
  planId: string;
  startDate?: string;
  discountCode?: string;
}

export interface SwitchMembershipPlanRequest {
  newPlanId: string;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  plan?: MembershipPlan;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountCode?: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING" | "FROZEN";
  createdAt: string;
  updatedAt: string;
}

interface MembershipPlanApi {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  unlimitedClasses: boolean;
  personalTrainingHours: number;
  accessToEquipment: boolean;
  accessToLocker: boolean;
  nutritionConsultation: boolean;
  planFeatures?: MembershipPlanFeature[];
  createdAt: string;
  updatedAt: string;
}

interface MembershipPlansResponseApi {
  data: MembershipPlanApi[];
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

export const membershipsService = {
  async getAllPlans(params?: { page?: number; limit?: number; name?: string }) {
    const response = await apiClient.get<
      ApiResponse<MembershipPlansResponseApi>
    >("/membership-plans", { params });
    const payload = response.data.data ?? response.data;
    return {
      ...payload,
      data: Array.isArray(payload.data) ? payload.data.map(normalizePlan) : [],
    };
  },

  async getPlanById(id: string) {
    const response = await apiClient.get<ApiResponse<MembershipPlanApi>>(
      `/membership-plans/${id}`,
    );
    const payload = response.data.data ?? response.data;
    return normalizePlan(payload);
  },

  async createPlan(data: CreateMembershipPlanRequest) {
    const response = await apiClient.post<ApiResponse<MembershipPlanApi>>(
      "/membership-plans",
      data,
    );
    const payload = response.data.data ?? response.data;
    return normalizePlan(payload);
  },

  async updatePlan(id: string, data: UpdateMembershipPlanRequest) {
    const response = await apiClient.patch<ApiResponse<MembershipPlanApi>>(
      `/membership-plans/${id}`,
      data,
    );
    const payload = response.data.data ?? response.data;
    return normalizePlan(payload);
  },

  async deletePlan(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/membership-plans/${id}`,
    );
    return response.data.data ?? response.data;
  },

  async subscribe(data: SubscribeMembershipRequest) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      "/memberships/subscribe",
      data,
    );
    return response.data.data ?? response.data;
  },

  async freezeMembership(id: string) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/${id}/freeze`,
    );
    return response.data.data ?? response.data;
  },

  async unfreezeMembership(id: string) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/${id}/unfreeze`,
    );
    return response.data.data ?? response.data;
  },

  async cancelMembership(id: string) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/${id}/cancel`,
    );
    return response.data.data ?? response.data;
  },

  async pauseMembership(id: string) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/${id}/freeze`,
    );
    return response.data.data ?? response.data;
  },

  async resumeMembership(id: string) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/${id}/unfreeze`,
    );
    return response.data.data ?? response.data;
  },

  async switchMyPlan(data: SwitchMembershipPlanRequest) {
    const response = await apiClient.post<ApiResponse<Membership>>(
      `/memberships/me/switch-plan`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await apiClient.get(`/memberships/${id}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },

  async previewDiscount(planId: string, code: string) {
    const response = await apiClient.get(
      "/memberships/discount-preview",
      {
        params: { planId, code },
      },
    );
    return response.data.data ?? response.data;
  },

  async getMembershipById(id: string) {
    const response = await apiClient.get<ApiResponse<Membership>>(
      `/memberships/${id}`,
    );
    return response.data.data ?? response.data;
  },
};

function normalizePlan(plan: MembershipPlanApi): MembershipPlan {
  return {
    ...plan,
    features: buildPlanFeatures(plan),
  };
}

function buildPlanFeatures(plan: MembershipPlanApi): string[] {
  if (Array.isArray(plan.planFeatures) && plan.planFeatures.length > 0) {
    return plan.planFeatures.map((feature) =>
      feature.level ? `${feature.name} (${feature.level})` : feature.name,
    );
  }

  const features: string[] = [];

  if (plan.accessToEquipment) {
    features.push("Full equipment access");
  }

  features.push(
    plan.unlimitedClasses ? "Unlimited group classes" : "Limited group classes",
  );

  if (plan.personalTrainingHours > 0) {
    features.push(`${plan.personalTrainingHours} personal training hours`);
  } else {
    features.push("Personal training available");
  }

  if (plan.accessToLocker) {
    features.push("Locker access");
  }

  if (plan.nutritionConsultation) {
    features.push("Nutrition consultation");
  }

  return features;
}
