import api, { getAllPages } from "./api";
import type { ApiEnvelope, ApiPaginatedResponse } from "./api.types";

import {
    FeatureLevel,
    FeatureLibraryRecord,
    FeatureFormValues,
    MemberRecord,
    MembershipDetailRecord,
    MembershipPlanFeature,
    MembershipPlanFormValues,
    MembershipPlanRecord,
    MembershipRawStatus,
    MembershipRecord,
    MembershipPaymentStatus,
    PaymentRecord,
    getMembershipDisplayStatus,
    getPlanTypeFromDuration,
    getDurationFromPlanType,
} from "@/features/memberships";

interface MembershipPlanFeatureApi {
    featureId: string;
    name: string;
    description?: string;
    level: FeatureLevel;
}

interface MembershipPlanApi {
    id: string;
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    unlimitedClasses: boolean;
    personalTrainingHours: number;
    accessToEquipment: boolean;
    accessToLocker: boolean;
    nutritionConsultation: boolean;
    planFeatures?: MembershipPlanFeatureApi[];
    createdAt: string;
    updatedAt: string;
}

interface FeatureApi {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    defaultName?: string;
    createdAt: string;
    updatedAt: string;
}

interface MemberSubscriptionPlanApi {
    id: string;
    name: string;
    price: number;
    durationDays: number;
}

interface MemberSubscriptionApi {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    membershipPlan?: MemberSubscriptionPlanApi;
}

interface MemberApi {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    subscriptions?: MemberSubscriptionApi[];
}

interface PaymentApi {
    id: string;
    memberId: string;
    subscriptionId?: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    paidAt?: string;
}

interface MembershipDetailApi {
    id: string;
    memberId: string;
    planId: string;
    plan?: {
        name?: string;
    };
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    discountCode?: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface MembershipPlanFeaturePayload {
    featureId: string;
    level: FeatureLevel;
}

interface MembershipPlanUpsertPayload {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    unlimitedClasses: boolean;
    personalTrainingHours: number;
    accessToEquipment: boolean;
    accessToLocker: boolean;
    nutritionConsultation: boolean;
    features: MembershipPlanFeaturePayload[];
}

interface AssignMembershipPayload {
    memberId: string;
    planId: string;
    startDate: string;
}

const normalizeMembershipRawStatus = (value: string): MembershipRawStatus => {
    const normalized = value.toUpperCase();

    if (normalized === "ACTIVE") {
        return "ACTIVE";
    }

    if (normalized === "EXPIRED") {
        return "EXPIRED";
    }

    if (normalized === "CANCELLED") {
        return "CANCELLED";
    }

    if (normalized === "PENDING") {
        return "PENDING";
    }

    if (normalized === "FROZEN") {
        return "FROZEN";
    }

    return "ACTIVE";
};

const normalizePaymentStatus = (value: string): MembershipPaymentStatus => {
    const normalized = value.toUpperCase();

    if (normalized === "PENDING") {
        return "PENDING";
    }

    if (normalized === "PAID") {
        return "PAID";
    }

    if (normalized === "REJECTED") {
        return "REJECTED";
    }

    return "UNKNOWN";
};

const toPlanFeature = (feature: MembershipPlanFeatureApi): MembershipPlanFeature => ({
    featureId: feature.featureId,
    name: feature.name,
    description: feature.description,
    level: feature.level,
});

const toMembershipPlanRecord = (plan: MembershipPlanApi): MembershipPlanRecord => ({
    id: plan.id,
    name: plan.name,
    description: plan.description ?? "",
    durationDays: Number(plan.durationDays ?? 0),
    planType: getPlanTypeFromDuration(Number(plan.durationDays ?? 0)),
    price: Number(plan.price ?? 0),
    maxAccess: undefined,
    unlimitedClasses: Boolean(plan.unlimitedClasses),
    personalTrainingHours: Number(plan.personalTrainingHours ?? 0),
    accessToEquipment: Boolean(plan.accessToEquipment),
    accessToLocker: Boolean(plan.accessToLocker),
    nutritionConsultation: Boolean(plan.nutritionConsultation),
    planFeatures: (plan.planFeatures ?? []).map(toPlanFeature),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    activeMembers: 0,
    totalMembers: 0,
    status: "inactive",
});

const toFeatureLibraryRecord = (feature: FeatureApi): FeatureLibraryRecord => ({
    id: feature.id,
    name: feature.name,
    description: feature.description ?? "",
    isSystem: Boolean(feature.isSystem),
    defaultName: feature.defaultName,
    createdAt: feature.createdAt,
    updatedAt: feature.updatedAt,
    assignedPlans: 0,
    status: "inactive",
});

const toMemberRecord = (member: MemberApi): MemberRecord => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    isActive: Boolean(member.isActive),
    subscriptions: (member.subscriptions ?? []).map((subscription) => ({
        id: subscription.id,
        status: normalizeMembershipRawStatus(subscription.status),
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        membershipPlan: subscription.membershipPlan
            ? {
                id: subscription.membershipPlan.id,
                name: subscription.membershipPlan.name,
                price: Number(subscription.membershipPlan.price ?? 0),
                durationDays: Number(subscription.membershipPlan.durationDays ?? 0),
            }
            : undefined,
    })),
});

const toPaymentRecord = (payment: PaymentApi): PaymentRecord => ({
    id: payment.id,
    memberId: payment.memberId,
    subscriptionId: payment.subscriptionId,
    amount: Number(payment.amount ?? 0),
    currency: payment.currency ?? "USD",
    status: normalizePaymentStatus(payment.status),
    createdAt: payment.createdAt,
    paidAt: payment.paidAt,
});

const toMembershipDetailRecord = (detail: MembershipDetailApi): MembershipDetailRecord => {
    const rawStatus = normalizeMembershipRawStatus(detail.status);

    return {
        id: detail.id,
        memberId: detail.memberId,
        planId: detail.planId,
        planName: detail.plan?.name ?? "Membership Plan",
        startDate: detail.startDate,
        endDate: detail.endDate,
        statusRaw: rawStatus,
        status: getMembershipDisplayStatus(rawStatus, detail.endDate),
        originalPrice: Number(detail.originalPrice ?? 0),
        finalPrice: Number(detail.finalPrice ?? 0),
        discountAmount: Number(detail.discountAmount ?? 0),
        discountCode: detail.discountCode,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
    };
};

const toMembershipPlanPayload = (
    values: MembershipPlanFormValues,
): MembershipPlanUpsertPayload => ({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    durationDays: getDurationFromPlanType(values.planType, values.durationDays),
    price: values.price,
    unlimitedClasses: values.unlimitedClasses,
    personalTrainingHours: values.personalTrainingHours,
    accessToEquipment: values.accessToEquipment,
    accessToLocker: values.accessToLocker,
    nutritionConsultation: values.nutritionConsultation,
    features: values.selectedFeatures.map((feature) => ({
        featureId: feature.featureId,
        level: feature.level,
    })),
});

export const membershipService = {
    async listMembershipPlans(name?: string): Promise<MembershipPlanRecord[]> {
        const plans = await getAllPages<MembershipPlanApi>("/membership-plans", {
            name,
        });

        return plans.map(toMembershipPlanRecord);
    },

    async createMembershipPlan(values: MembershipPlanFormValues): Promise<MembershipPlanRecord> {
        const response = await api.post<ApiEnvelope<MembershipPlanApi>>(
            "/membership-plans",
            toMembershipPlanPayload(values),
        );

        return toMembershipPlanRecord(response.data.data);
    },

    async updateMembershipPlan(
        planId: string,
        values: MembershipPlanFormValues,
    ): Promise<MembershipPlanRecord> {
        const response = await api.patch<ApiEnvelope<MembershipPlanApi>>(
            `/membership-plans/${planId}`,
            toMembershipPlanPayload(values),
        );

        return toMembershipPlanRecord(response.data.data);
    },

    async deleteMembershipPlan(planId: string): Promise<void> {
        await api.delete(`/membership-plans/${planId}`);
    },

    async listFeatures(name?: string): Promise<FeatureLibraryRecord[]> {
        const features = await getAllPages<FeatureApi>("/features", {
            name,
        });

        return features.map(toFeatureLibraryRecord);
    },

    async createFeature(values: FeatureFormValues): Promise<FeatureLibraryRecord> {
        const response = await api.post<ApiEnvelope<FeatureApi>>("/features", {
            name: values.name.trim(),
            description: values.description.trim() || undefined,
        });

        return toFeatureLibraryRecord(response.data.data);
    },

    async updateFeature(featureId: string, values: FeatureFormValues): Promise<FeatureLibraryRecord> {
        const response = await api.patch<ApiEnvelope<FeatureApi>>(`/features/${featureId}`, {
            name: values.name.trim(),
            description: values.description.trim() || undefined,
        });

        return toFeatureLibraryRecord(response.data.data);
    },

    async deleteFeature(featureId: string): Promise<void> {
        await api.delete(`/features/${featureId}`);
    },

    async listMembers(): Promise<MemberRecord[]> {
        const members = await getAllPages<MemberApi>("/members");

        return members.map(toMemberRecord);
    },

    async listPayments(): Promise<PaymentRecord[]> {
        const payments = await getAllPages<PaymentApi>("/payments");

        return payments.map(toPaymentRecord);
    },

    async getMembershipById(membershipId: string): Promise<MembershipDetailRecord> {
        const response = await api.get<ApiEnvelope<MembershipDetailApi>>(`/memberships/${membershipId}`);
        return toMembershipDetailRecord(response.data.data);
    },

    async assignMembership(payload: AssignMembershipPayload): Promise<MembershipDetailRecord> {
        const response = await api.post<ApiEnvelope<MembershipDetailApi>>("/memberships", payload);
        return toMembershipDetailRecord(response.data.data);
    },

    async upgradeMembership(memberId: string, newPlanId: string): Promise<MembershipDetailRecord> {
        const response = await api.post<ApiEnvelope<MembershipDetailApi>>(
            `/memberships/${memberId}/upgrade`,
            {
                newPlanId,
            },
        );

        return toMembershipDetailRecord(response.data.data);
    },

    async freezeMembership(membershipId: string): Promise<MembershipDetailRecord> {
        const response = await api.post<ApiEnvelope<MembershipDetailApi>>(
            `/memberships/${membershipId}/freeze`,
        );

        return toMembershipDetailRecord(response.data.data);
    },

    async unfreezeMembership(membershipId: string): Promise<MembershipDetailRecord> {
        const response = await api.post<ApiEnvelope<MembershipDetailApi>>(
            `/memberships/${membershipId}/unfreeze`,
        );

        return toMembershipDetailRecord(response.data.data);
    },

    async markMembershipExpired(membershipId: string): Promise<MembershipDetailRecord> {
        const response = await api.post<ApiEnvelope<MembershipDetailApi>>(
            `/memberships/${membershipId}/cancel`,
        );

        return toMembershipDetailRecord(response.data.data);
    },

    mapDetailToMembershipRecord(
        detail: MembershipDetailRecord,
        sourceMembership: MembershipRecord,
    ): MembershipRecord {
        return {
            ...sourceMembership,
            id: detail.id,
            planId: detail.planId,
            planName: detail.planName,
            startDate: detail.startDate,
            endDate: detail.endDate,
            statusRaw: detail.statusRaw,
            status: detail.status,
        };
    },
};
