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
    features: string[];
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
    async getAllPlans(params?: {
        page?: number;
        limit?: number;
        name?: string;
    }) {
        const response = await apiClient.get<ApiResponse<MembershipPlansResponseApi>>(
            "/membership-plans",
            { params },
        );
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
};

function normalizePlan(plan: MembershipPlanApi): MembershipPlan {
    return {
        ...plan,
        features: buildPlanFeatures(plan),
    };
}

function buildPlanFeatures(plan: MembershipPlanApi): string[] {
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
