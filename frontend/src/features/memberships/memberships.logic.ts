import {
    compareAsc,
    differenceInCalendarDays,
    endOfDay,
    format,
    isAfter,
    isBefore,
    isValid,
    parseISO,
    startOfDay,
    subDays,
} from "date-fns";

import { formatCurrency } from "@/lib/currency";

import {
    FEATURE_LEVELS,
    FEATURE_LIBRARY_STATUS_LABELS,
    MEMBERSHIP_DISPLAY_STATUSES,
    MEMBERSHIP_PLAN_TYPE_DURATIONS,
    MEMBERSHIP_PLAN_TYPES,
    MembershipDisplayStatus,
    MembershipPlanType,
    MembershipQuickFilter,
    MembershipRawStatus,
} from "./memberships.constants";
import {
    FeatureFilterState,
    FeatureFormErrors,
    FeatureFormValues,
    FeatureLibraryRecord,
    MemberRecord,
    MembershipDetailRecord,
    MembershipFilterState,
    MembershipHistoryEntry,
    MembershipOverviewMetrics,
    MembershipPlanFeatureSelection,
    MembershipPlanFilterState,
    MembershipPlanFormErrors,
    MembershipPlanFormValues,
    MembershipPlanRecord,
    MembershipRecord,
    PaymentRecord,
} from "./memberships.types";

const getSafeDate = (value: string | undefined): Date | null => {
    if (!value) {
        return null;
    }

    const parsed = parseISO(value);
    if (!isValid(parsed)) {
        return null;
    }

    return parsed;
};

const toComparableDate = (value: string | undefined): Date => {
    return getSafeDate(value) ?? new Date(0);
};

const compareStrings = (a: string, b: string): number =>
    a.localeCompare(b, "en", { sensitivity: "base" });

export const formatDisplayDate = (value: string | undefined): string => {
    const parsed = getSafeDate(value);
    if (!parsed) {
        return "-";
    }

    return format(parsed, "MMM d, yyyy");
};

export { formatCurrency };

export const getPlanTypeFromDuration = (durationDays: number): MembershipPlanType => {
    if (durationDays === MEMBERSHIP_PLAN_TYPE_DURATIONS.monthly) {
        return "monthly";
    }

    if (durationDays === MEMBERSHIP_PLAN_TYPE_DURATIONS.quarterly) {
        return "quarterly";
    }

    if (durationDays === MEMBERSHIP_PLAN_TYPE_DURATIONS.yearly) {
        return "yearly";
    }

    return "custom";
};

export const getDurationFromPlanType = (
    planType: MembershipPlanType,
    customDuration: number,
): number => {
    if (planType === "custom") {
        return customDuration;
    }

    return MEMBERSHIP_PLAN_TYPE_DURATIONS[planType];
};

export const getRemainingDays = (endDate: string, now: Date = new Date()): number => {
    const parsed = getSafeDate(endDate);
    if (!parsed) {
        return 0;
    }

    return Math.max(0, differenceInCalendarDays(endOfDay(parsed), startOfDay(now)));
};

export const getMembershipDisplayStatus = (
    rawStatus: MembershipRawStatus,
    endDate: string,
    now: Date = new Date(),
): MembershipDisplayStatus => {
    if (rawStatus === "FROZEN") {
        return "frozen";
    }

    if (rawStatus === "PENDING") {
        return "pending";
    }

    if (rawStatus === "EXPIRED" || rawStatus === "CANCELLED") {
        return "expired";
    }

    const remainingDays = getRemainingDays(endDate, now);

    if (remainingDays <= 0) {
        return "expired";
    }

    if (remainingDays <= 7) {
        return "expiring_soon";
    }

    return "active";
};

interface SubscriptionPaymentSnapshot {
    status: PaymentRecord["status"];
    createdAt: string;
    amount: number;
}

const getLatestPaymentBySubscription = (
    payments: PaymentRecord[],
): Map<string, SubscriptionPaymentSnapshot> => {
    return payments.reduce<Map<string, SubscriptionPaymentSnapshot>>((map, payment) => {
        if (!payment.subscriptionId) {
            return map;
        }

        const current = map.get(payment.subscriptionId);

        if (!current || compareAsc(toComparableDate(current.createdAt), toComparableDate(payment.createdAt)) < 0) {
            map.set(payment.subscriptionId, {
                status: payment.status,
                createdAt: payment.createdAt,
                amount: payment.amount,
            });
        }

        return map;
    }, new Map());
};

export const buildMembershipRecords = (
    members: MemberRecord[],
    payments: PaymentRecord[],
    now: Date = new Date(),
): MembershipRecord[] => {
    const paymentMap = getLatestPaymentBySubscription(payments);

    return members
        .flatMap((member) => {
            return (member.subscriptions ?? []).map((subscription) => {
                const status = getMembershipDisplayStatus(subscription.status, subscription.endDate, now);
                const paymentSnapshot = paymentMap.get(subscription.id);

                return {
                    id: subscription.id,
                    memberId: member.id,
                    memberName: `${member.firstName} ${member.lastName}`.trim() || member.email,
                    memberEmail: member.email,
                    planId: subscription.membershipPlan?.id ?? "",
                    planName: subscription.membershipPlan?.name ?? "Unknown Plan",
                    startDate: subscription.startDate,
                    endDate: subscription.endDate,
                    remainingDays: getRemainingDays(subscription.endDate, now),
                    status,
                    statusRaw: subscription.status,
                    paymentStatus: paymentSnapshot?.status ?? "UNKNOWN",
                    latestPaymentAt: paymentSnapshot?.createdAt,
                    latestPaymentAmount: paymentSnapshot?.amount,
                } satisfies MembershipRecord;
            });
        })
        .sort((a, b) => compareAsc(toComparableDate(b.endDate), toComparableDate(a.endDate)));
};

export const buildMembershipPlanRecords = (
    plans: MembershipPlanRecord[],
    memberships: MembershipRecord[],
    now: Date = new Date(),
): MembershipPlanRecord[] => {
    return plans.map((plan) => {
        const relatedMemberships = memberships.filter((membership) => membership.planId === plan.id);

        const activeMembers = relatedMemberships.filter((membership) => {
            if (membership.statusRaw === "FROZEN" || membership.statusRaw === "PENDING") {
                return true;
            }

            if (membership.statusRaw !== "ACTIVE") {
                return false;
            }

            const endDate = getSafeDate(membership.endDate);
            return endDate ? !isBefore(endDate, startOfDay(now)) : false;
        }).length;

        return {
            ...plan,
            activeMembers,
            totalMembers: relatedMemberships.length,
            status: activeMembers > 0 ? "active" : "inactive",
        };
    });
};

export const buildFeatureLibraryRecords = (
    features: FeatureLibraryRecord[],
    plans: MembershipPlanRecord[],
): FeatureLibraryRecord[] => {
    const assignments = new Map<string, number>();

    plans.forEach((plan) => {
        plan.planFeatures.forEach((feature) => {
            assignments.set(feature.featureId, (assignments.get(feature.featureId) ?? 0) + 1);
        });
    });

    return features.map((feature) => {
        const assignedPlans = assignments.get(feature.id) ?? 0;

        return {
            ...feature,
            assignedPlans,
            status: assignedPlans > 0 ? "active" : "inactive",
        };
    });
};

export const calculateMembershipOverviewMetrics = (
    memberships: MembershipRecord[],
    payments: PaymentRecord[],
    revenueDays: number,
    now: Date = new Date(),
): MembershipOverviewMetrics => {
    const revenueStart = subDays(startOfDay(now), Math.max(1, revenueDays) - 1);

    const totalMembershipRevenue = payments.reduce((sum, payment) => {
        const createdAt = getSafeDate(payment.createdAt);

        if (!createdAt || payment.status !== "PAID") {
            return sum;
        }

        if (isBefore(createdAt, revenueStart) || isAfter(createdAt, endOfDay(now))) {
            return sum;
        }

        return sum + payment.amount;
    }, 0);

    return {
        totalActiveMemberships: memberships.filter((membership) => membership.status === "active").length,
        expiringSoon: memberships.filter((membership) => membership.status === "expiring_soon").length,
        expired: memberships.filter((membership) => membership.status === "expired").length,
        frozen: memberships.filter((membership) => membership.status === "frozen").length,
        totalMembershipRevenue,
    };
};

const inDateRange = (value: string, from: string, to: string): boolean => {
    const target = getSafeDate(value);
    if (!target) {
        return false;
    }

    const rangeStart = getSafeDate(from);
    const rangeEnd = getSafeDate(to);

    if (rangeStart && isBefore(target, startOfDay(rangeStart))) {
        return false;
    }

    if (rangeEnd && isAfter(target, endOfDay(rangeEnd))) {
        return false;
    }

    return true;
};

export const applyMembershipPlanFilters = (
    plans: MembershipPlanRecord[],
    filters: MembershipPlanFilterState,
): MembershipPlanRecord[] => {
    const query = filters.search.trim().toLowerCase();

    const filtered = plans.filter((plan) => {
        const matchesQuery = query.length === 0 || plan.name.toLowerCase().includes(query);
        const matchesStatus = filters.status === "all" || plan.status === filters.status;

        return matchesQuery && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
        switch (filters.sort) {
            case "name_asc":
                return compareStrings(a.name, b.name);
            case "name_desc":
                return compareStrings(b.name, a.name);
            case "price_asc":
                return a.price - b.price;
            case "price_desc":
                return b.price - a.price;
            case "popularity_asc":
                return a.activeMembers - b.activeMembers;
            case "popularity_desc":
                return b.activeMembers - a.activeMembers;
            default:
                return 0;
        }
    });
};

export const applyMembershipFilters = (
    memberships: MembershipRecord[],
    filters: MembershipFilterState,
): MembershipRecord[] => {
    const query = filters.search.trim().toLowerCase();

    const filtered = memberships.filter((membership) => {
        const matchesSearch =
            query.length === 0 ||
            membership.memberName.toLowerCase().includes(query) ||
            membership.memberEmail.toLowerCase().includes(query);

        const quickFilterMatches =
            filters.quickFilter === "all" || membership.status === filters.quickFilter;

        const matchesStatus = filters.status === "all" || membership.status === filters.status;
        const matchesPlan = filters.planId === "all" || membership.planId === filters.planId;
        const matchesExpiryRange = inDateRange(membership.endDate, filters.expiryFrom, filters.expiryTo);

        return matchesSearch && quickFilterMatches && matchesStatus && matchesPlan && matchesExpiryRange;
    });

    const sorted = [...filtered].sort((a, b) => {
        const comparison = compareAsc(toComparableDate(a.endDate), toComparableDate(b.endDate));
        if (comparison !== 0) {
            return comparison;
        }

        return compareStrings(a.memberName, b.memberName);
    });

    return filters.sort === "expiry_asc" ? sorted : sorted.reverse();
};

export const applyFeatureFilters = (
    features: FeatureLibraryRecord[],
    filters: FeatureFilterState,
): FeatureLibraryRecord[] => {
    const query = filters.search.trim().toLowerCase();

    return features
        .filter((feature) => {
            const matchesSearch =
                query.length === 0 ||
                feature.name.toLowerCase().includes(query) ||
                feature.description.toLowerCase().includes(query);

            const matchesStatus = filters.status === "all" || feature.status === filters.status;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => compareStrings(a.name, b.name));
};

export const getMembershipTimelineProgress = (
    startDate: string,
    endDate: string,
    now: Date = new Date(),
): number => {
    const start = getSafeDate(startDate);
    const end = getSafeDate(endDate);

    if (!start || !end || !isBefore(start, end)) {
        return 0;
    }

    const totalMs = end.getTime() - start.getTime();
    const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);

    return Math.round((elapsedMs / totalMs) * 100);
};

export const buildMembershipHistory = (
    memberships: MembershipRecord[],
    memberId: string,
): MembershipHistoryEntry[] => {
    return memberships
        .filter((membership) => membership.memberId === memberId)
        .map((membership) => ({
            id: membership.id,
            planName: membership.planName,
            startDate: membership.startDate,
            endDate: membership.endDate,
            status: membership.status,
        }))
        .sort((a, b) => compareAsc(toComparableDate(b.startDate), toComparableDate(a.startDate)));
};

export const getDefaultMembershipPlanFilterState = (): MembershipPlanFilterState => ({
    search: "",
    status: "all",
    sort: "popularity_desc",
});

export const getDefaultMembershipFilterState = (): MembershipFilterState => ({
    search: "",
    status: "all",
    planId: "all",
    expiryFrom: "",
    expiryTo: "",
    sort: "expiry_asc",
    quickFilter: "all",
});

export const getDefaultFeatureFilterState = (): FeatureFilterState => ({
    search: "",
    status: "all",
});

export const getDefaultMembershipPlanFormValues = (): MembershipPlanFormValues => ({
    name: "",
    description: "",
    planType: "monthly",
    durationDays: MEMBERSHIP_PLAN_TYPE_DURATIONS.monthly,
    price: 0,
    maxAccess: "",
    unlimitedClasses: false,
    personalTrainingHours: 0,
    accessToEquipment: true,
    accessToLocker: false,
    nutritionConsultation: false,
    selectedFeatures: [],
});

export const getMembershipPlanFormValuesFromPlan = (
    plan: MembershipPlanRecord,
): MembershipPlanFormValues => ({
    name: plan.name,
    description: plan.description,
    planType: getPlanTypeFromDuration(plan.durationDays),
    durationDays: plan.durationDays,
    price: plan.price,
    maxAccess: plan.maxAccess ? String(plan.maxAccess) : "",
    unlimitedClasses: plan.unlimitedClasses,
    personalTrainingHours: plan.personalTrainingHours,
    accessToEquipment: plan.accessToEquipment,
    accessToLocker: plan.accessToLocker,
    nutritionConsultation: plan.nutritionConsultation,
    selectedFeatures: plan.planFeatures.map((feature) => ({
        featureId: feature.featureId,
        level: FEATURE_LEVELS.includes(feature.level) ? feature.level : "BASIC",
    })),
});

export const getDuplicatedPlanFormValues = (
    plan: MembershipPlanRecord,
): MembershipPlanFormValues => ({
    ...getMembershipPlanFormValuesFromPlan(plan),
    name: `${plan.name} Copy`,
});

export const validateMembershipPlanForm = (
    values: MembershipPlanFormValues,
): MembershipPlanFormErrors => {
    const errors: MembershipPlanFormErrors = {};

    if (!values.name.trim()) {
        errors.name = "Plan name is required.";
    }

    if (!Number.isFinite(values.price) || values.price <= 0) {
        errors.price = "Price must be greater than 0.";
    }

    const durationDays = getDurationFromPlanType(values.planType, values.durationDays);

    if (!Number.isFinite(durationDays) || durationDays <= 0) {
        errors.durationDays = "Duration must be at least 1 day.";
    }

    return errors;
};

export const isMembershipPlanFormValid = (values: MembershipPlanFormValues): boolean => {
    const errors = validateMembershipPlanForm(values);
    return Object.keys(errors).length === 0;
};

export const togglePlanFeatureSelection = (
    selectedFeatures: MembershipPlanFeatureSelection[],
    featureId: string,
    checked: boolean,
): MembershipPlanFeatureSelection[] => {
    if (checked) {
        const exists = selectedFeatures.some((feature) => feature.featureId === featureId);
        if (exists) {
            return selectedFeatures;
        }

        return [...selectedFeatures, { featureId, level: "BASIC" }];
    }

    return selectedFeatures.filter((feature) => feature.featureId !== featureId);
};

export const updatePlanFeatureLevel = (
    selectedFeatures: MembershipPlanFeatureSelection[],
    featureId: string,
    level: MembershipPlanFeatureSelection["level"],
): MembershipPlanFeatureSelection[] => {
    return selectedFeatures.map((feature) =>
        feature.featureId === featureId
            ? {
                ...feature,
                level,
            }
            : feature,
    );
};

export const normalizeFeatureFormValues = (values: FeatureFormValues): FeatureFormValues => ({
    name: values.name.trim(),
    description: values.description.trim(),
});

export const validateFeatureForm = (values: FeatureFormValues): FeatureFormErrors => {
    const errors: FeatureFormErrors = {};

    if (!values.name.trim()) {
        errors.name = "Feature name is required.";
    }

    return errors;
};

export const isFeatureFormValid = (values: FeatureFormValues): boolean => {
    return Object.keys(validateFeatureForm(values)).length === 0;
};

export const toMembershipDetailRecord = (
    detail: Omit<MembershipDetailRecord, "status">,
): MembershipDetailRecord => ({
    ...detail,
    status: MEMBERSHIP_DISPLAY_STATUSES.includes(
        getMembershipDisplayStatus(detail.statusRaw, detail.endDate),
    )
        ? getMembershipDisplayStatus(detail.statusRaw, detail.endDate)
        : "active",
});

export const getMembershipRevenuePeriodLabel = (days: number): string => {
    if (days <= 30) {
        return "Last 30 Days";
    }

    if (days <= 90) {
        return "Last 90 Days";
    }

    return "Last 365 Days";
};

export const getFeatureStatusLabel = (status: FeatureLibraryRecord["status"]): string => {
    return FEATURE_LIBRARY_STATUS_LABELS[status];
};

export const getPlanTypeOptions = (): MembershipPlanType[] => [...MEMBERSHIP_PLAN_TYPES];
