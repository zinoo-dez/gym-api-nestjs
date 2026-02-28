import { isAxiosError } from "./api";
import api from "./api";
import type { ApiEnvelope } from "./api.types";

import {
    BUSINESS_DAY_IDS,
    createDefaultBusinessHours,
    defaultGeneralSettings,
    defaultPaymentsSettings,
    defaultSecuritySettings,
} from "@/features/settings";
import type {
    BusinessDayId,
    BusinessHourRow,
    BusinessHoursFormValues,
    GeneralSettingsFormValues,
    MembershipPlan,
    MembershipPlanDuration,
    MembershipPlanInput,
    PaymentsSettingsFormValues,
    SecuritySettingsFormValues,
    SettingsBundle,
    SocialLinks,
} from "@/features/settings";
import { isRecord, asRecord, asString, asNumber, asBoolean, asArray, type GenericRecord } from "@/lib/type-guards";

const GYM_SETTINGS_BASE = "/gym-settings";
const OPERATING_HOURS_BASE = "/operating-hours";
const MEMBERSHIP_PLANS_BASE = "/membership-plans";

const hasAnyKey = (record: GenericRecord, keys: string[]): boolean => {
    return keys.some((key) => key in record);
};

const extractPayload = <T>(value: unknown): T => {
    if (isRecord(value) && "data" in value) {
        return (value as unknown as ApiEnvelope<T>).data;
    }

    return value as T;
};

const isBusinessDayId = (value: string): value is BusinessDayId => {
    return (BUSINESS_DAY_IDS as readonly string[]).includes(value);
};

const dayOfWeekToBusinessDay = (value: number): BusinessDayId | null => {
    if (value === 1) {
        return "monday";
    }

    if (value === 2) {
        return "tuesday";
    }

    if (value === 3) {
        return "wednesday";
    }

    if (value === 4) {
        return "thursday";
    }

    if (value === 5) {
        return "friday";
    }

    if (value === 6) {
        return "saturday";
    }

    if (value === 0) {
        return "sunday";
    }

    return null;
};

const businessDayToDayOfWeek = (day: BusinessDayId): number => {
    if (day === "monday") {
        return 1;
    }

    if (day === "tuesday") {
        return 2;
    }

    if (day === "wednesday") {
        return 3;
    }

    if (day === "thursday") {
        return 4;
    }

    if (day === "friday") {
        return 5;
    }

    if (day === "saturday") {
        return 6;
    }

    return 0;
};

const toArrayFromCandidate = (candidate: unknown): unknown[] | null => {
    const directArray = asArray(candidate);

    if (directArray) {
        return directArray;
    }

    const record = asRecord(candidate);

    if (!record) {
        return null;
    }

    const dataArray = asArray(record.data);

    if (dataArray) {
        return dataArray;
    }

    const itemsArray = asArray(record.items);

    if (itemsArray) {
        return itemsArray;
    }

    return null;
};

const normalizeDuration = (value: unknown): MembershipPlanDuration => {
    const numberValue = asNumber(value);

    if (typeof numberValue === "number") {
        return numberValue >= 365 ? "YEARLY" : "MONTHLY";
    }

    const normalized = (asString(value) ?? "").toUpperCase();

    if (normalized.includes("YEAR") || normalized.includes("ANNUAL")) {
        return "YEARLY";
    }

    return "MONTHLY";
};

const normalizeFeatureList = (value: unknown): string[] => {
    if (typeof value === "string") {
        return value
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    }

    const rows = asArray(value);

    if (!rows) {
        return [];
    }

    return rows
        .map((row) => {
            if (typeof row === "string") {
                return row.trim();
            }

            const record = asRecord(row);
            if (!record) {
                return "";
            }

            return (
                asString(record.value) ??
                asString(record.feature) ??
                asString(record.name) ??
                asString(record.label) ??
                ""
            );
        })
        .filter((feature) => feature.length > 0);
};

const parseFeaturesFromDescription = (value: unknown): string[] => {
    const description = asString(value);

    if (!description) {
        return [];
    }

    const lines = description
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.replace(/^features\s*:?[\s-]*/i, ""))
        .map((line) => line.replace(/^[-*•]\s*/, ""))
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length === 0) {
        return [];
    }

    if (lines.length === 1 && lines[0].includes(",")) {
        return lines[0]
            .split(",")
            .map((part) => part.trim())
            .filter((part) => part.length > 0);
    }

    return Array.from(new Set(lines));
};

const normalizeSocialLinks = (value: unknown): SocialLinks => {
    const source = asRecord(value) ?? {};

    return {
        website: asString(source.website) ?? "",
        facebook: asString(source.facebook) ?? "",
        instagram: asString(source.instagram) ?? "",
        twitter: asString(source.twitter) ?? "",
    };
};

const normalizeGeneralSettings = (
    payload: GenericRecord,
): GeneralSettingsFormValues => {
    const source = asRecord(payload.general) ?? payload;
    const socialSource =
        asRecord(source.socialLinks) ??
        asRecord(source.socialMedia) ??
        asRecord(payload.socialLinks) ??
        asRecord(payload.socialMedia) ??
        {};

    return {
        ...defaultGeneralSettings,
        gymName:
            asString(source.gymName) ??
            asString(source.name) ??
            defaultGeneralSettings.gymName,
        logo:
            asString(source.logo) ??
            asString(source.logoUrl) ??
            defaultGeneralSettings.logo,
        contactEmail:
            asString(source.contactEmail) ??
            asString(source.email) ??
            defaultGeneralSettings.contactEmail,
        phone: asString(source.phone) ?? defaultGeneralSettings.phone,
        address: asString(source.address) ?? defaultGeneralSettings.address,
        tagLine:
            asString(source.tagLine) ??
            asString(source.tagline) ??
            defaultGeneralSettings.tagLine,
        description:
            asString(source.description) ?? defaultGeneralSettings.description,
        socialLinks: {
            ...defaultGeneralSettings.socialLinks,
            ...normalizeSocialLinks(socialSource),
        },
    };
};

const normalizeBusinessHours = (payload: GenericRecord): BusinessHourRow[] => {
    const defaults = createDefaultBusinessHours();
    const source =
        toArrayFromCandidate(payload.businessHours) ??
        toArrayFromCandidate(payload.hours) ??
        toArrayFromCandidate(payload.operatingHours);

    if (!source) {
        return defaults;
    }

    const dayMap = new Map<BusinessDayId, BusinessHourRow>(
        defaults.map((row) => [row.day, row]),
    );

    for (const rawRow of source) {
        const row = asRecord(rawRow);

        if (!row) {
            continue;
        }

        const rawDay =
            asString(row.day) ??
            asString(row.dayOfWeek) ??
            asString(row.weekDay) ??
            asString(row.name);

        let day: BusinessDayId | null = null;

        if (rawDay) {
            const normalizedDay = rawDay.toLowerCase();
            day = isBusinessDayId(normalizedDay) ? normalizedDay : null;
        } else {
            const numericDay = asNumber(row.dayOfWeek) ?? asNumber(row.day);

            if (typeof numericDay === "number") {
                day = dayOfWeekToBusinessDay(Math.trunc(numericDay));
            }
        }

        if (!day) {
            continue;
        }

        const current =
            dayMap.get(day) ?? defaults.find((item) => item.day === day);

        if (!current) {
            continue;
        }

        const closed =
            asBoolean(row.closed) ?? asBoolean(row.isClosed) ?? current.closed;
        const openTime =
            asString(row.openTime) ??
            asString(row.opensAt) ??
            asString(row.open) ??
            current.openTime;
        const closeTime =
            asString(row.closeTime) ??
            asString(row.closesAt) ??
            asString(row.close) ??
            current.closeTime;

        dayMap.set(day, {
            day,
            openTime,
            closeTime,
            closed,
        });
    }

    return defaults.map((row) => dayMap.get(row.day) ?? row);
};

const normalizeMembershipPlan = (
    raw: unknown,
    index: number,
): MembershipPlan | null => {
    const row = asRecord(raw);

    if (!row) {
        return null;
    }

    const name = asString(row.name) ?? asString(row.planName) ?? "Untitled Plan";
    const id = asString(row.id) ?? asString(row.planId) ?? `plan-${index + 1}`;

    const apiFeatures = normalizeFeatureList(
        row.features ??
        row.featureList ??
        row.planFeatures ??
        row.membershipFeatures,
    );
    const descriptionFeatures = parseFeaturesFromDescription(row.description);
    const features = apiFeatures.length > 0 ? apiFeatures : descriptionFeatures;

    return {
        id,
        name,
        price: asNumber(row.price) ?? asNumber(row.amount) ?? 0,
        duration: normalizeDuration(
            row.duration ?? row.billingCycle ?? row.durationDays ?? row.planType,
        ),
        features,
    };
};

const normalizeMembershipPlans = (payload: GenericRecord): MembershipPlan[] => {
    const sourceCandidate =
        payload.membershipPlans ?? payload.memberships ?? payload.plans;

    const source =
        toArrayFromCandidate(sourceCandidate) ??
        toArrayFromCandidate(asRecord(sourceCandidate)?.data) ??
        toArrayFromCandidate(asRecord(sourceCandidate)?.items) ??
        [];

    return source
        .map((row, index) => normalizeMembershipPlan(row, index))
        .filter((plan): plan is MembershipPlan => Boolean(plan));
};

const normalizePaymentsSettings = (
    payload: GenericRecord,
): PaymentsSettingsFormValues => {
    const source = asRecord(payload.payments) ?? {};
    const stripe = asRecord(source.stripe) ?? asRecord(payload.stripe) ?? {};
    const paypal = asRecord(source.paypal) ?? asRecord(payload.paypal) ?? {};

    return {
        ...defaultPaymentsSettings,
        currency: (
            asString(source.currency) ??
            asString(payload.currency) ??
            defaultPaymentsSettings.currency
        ).toUpperCase(),
        taxPercentage:
            asNumber(source.taxPercentage) ??
            asNumber(source.taxRate) ??
            asNumber(payload.taxPercentage) ??
            defaultPaymentsSettings.taxPercentage,
        stripePublicKey:
            asString(source.stripePublicKey) ??
            asString(stripe.publicKey) ??
            asString(payload.stripePublicKey) ??
            defaultPaymentsSettings.stripePublicKey,
        stripeSecretKey:
            asString(source.stripeSecretKey) ??
            asString(stripe.secretKey) ??
            asString(payload.stripeSecretKey) ??
            defaultPaymentsSettings.stripeSecretKey,
        paypalClientId:
            asString(source.paypalClientId) ??
            asString(paypal.clientId) ??
            asString(payload.paypalClientId) ??
            defaultPaymentsSettings.paypalClientId,
        paypalSecret:
            asString(source.paypalSecret) ??
            asString(paypal.secret) ??
            asString(payload.paypalSecret) ??
            defaultPaymentsSettings.paypalSecret,
    };
};

const normalizeSecuritySettings = (
    payload: GenericRecord,
): SecuritySettingsFormValues => {
    const source = asRecord(payload.security) ?? {};
    const themeCandidate = (
        asString(source.theme) ??
        asString(payload.theme) ??
        "light"
    ).toLowerCase();

    return {
        ...defaultSecuritySettings,
        emailNotifications:
            asBoolean(source.emailNotifications) ??
            asBoolean(payload.emailNotifications) ??
            asBoolean(payload.emailNotification) ??
            defaultSecuritySettings.emailNotifications,
        smsNotifications:
            asBoolean(source.smsNotifications) ??
            asBoolean(payload.smsNotifications) ??
            asBoolean(payload.smsNotification) ??
            defaultSecuritySettings.smsNotifications,
        theme: themeCandidate === "dark" ? "dark" : "light",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    };
};

const toGeneralPayload = (values: GeneralSettingsFormValues) => {
    return {
        name: values.gymName.trim(),
        logo: values.logo.trim(),
        email: values.contactEmail.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        tagLine: values.tagLine.trim(),
        description: values.description.trim(),
    };
};

const toBusinessHoursPayload = (values: BusinessHoursFormValues) => {
    const normalizedHours = values.hours.map((row) => ({
        day: row.day,
        openTime: row.openTime,
        closeTime: row.closeTime,
        closed: row.closed,
    }));

    return {
        hours: normalizedHours,
        businessHours: normalizedHours,
    };
};

const toMembershipPayload = (values: MembershipPlanInput) => {
    return {
        name: values.name,
        price: values.price,
        duration: values.duration,
        features: values.features,
        featureList: values.features,
    };
};

const toLegacyMembershipPayload = (values: MembershipPlanInput) => {
    const normalizedFeatures = Array.from(
        new Set(
            values.features
                .map((feature) => feature.trim())
                .filter((feature) => feature.length > 0),
        ),
    );

    return {
        name: values.name,
        price: values.price,
        durationDays: values.duration === "YEARLY" ? 365 : 30,
        description:
            normalizedFeatures.length > 0
                ? normalizedFeatures.map((feature) => `- ${feature}`).join("\n")
                : undefined,
        unlimitedClasses: false,
        personalTrainingHours: 0,
        accessToEquipment: false,
        accessToLocker: false,
        nutritionConsultation: false,
    };
};

const toPaymentsPayload = (values: PaymentsSettingsFormValues) => {
    return {
        currency: values.currency.trim().toUpperCase(),
        taxPercentage: Number.isFinite(values.taxPercentage)
            ? values.taxPercentage
            : defaultPaymentsSettings.taxPercentage,
        stripePublicKey: values.stripePublicKey.trim(),
        stripeSecretKey: values.stripeSecretKey.trim(),
        paypalClientId: values.paypalClientId.trim(),
        paypalSecret: values.paypalSecret.trim(),
    };
};

const hasPasswordChangeInput = (
    values: SecuritySettingsFormValues,
): boolean => {
    return (
        values.currentPassword.length > 0 ||
        values.newPassword.length > 0 ||
        values.confirmNewPassword.length > 0
    );
};

const toSecurityPayload = (values: SecuritySettingsFormValues) => {
    return {
        emailNotification: values.emailNotifications,
        smsNotification: values.smsNotifications,
    };
};

const toSettingsBundle = (payload: GenericRecord): SettingsBundle => {
    return {
        general: normalizeGeneralSettings(payload),
        businessHours: normalizeBusinessHours(payload),
        membershipPlans: normalizeMembershipPlans(payload),
        payments: normalizePaymentsSettings(payload),
        security: normalizeSecuritySettings(payload),
    };
};

export const settingsService = {
    async getSettings(): Promise<SettingsBundle> {
        const gymSettingsResponse = await api.get<ApiEnvelope<unknown> | unknown>(
            GYM_SETTINGS_BASE,
        );
        const gymSettingsPayload =
            asRecord(extractPayload<unknown>(gymSettingsResponse.data)) ?? {};

        let operatingHoursPayload: unknown = [];
        let membershipPlansPayload: unknown = [];

        try {
            const hoursResponse = await api.get<ApiEnvelope<unknown> | unknown>(
                OPERATING_HOURS_BASE,
            );
            operatingHoursPayload = extractPayload<unknown>(hoursResponse.data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                // ignore
            } else {
                throw error;
            }
        }

        try {
            const plansResponse = await api.get<ApiEnvelope<unknown> | unknown>(
                MEMBERSHIP_PLANS_BASE,
                {
                    params: {
                        page: 1,
                        limit: 200,
                    },
                },
            );
            membershipPlansPayload = extractPayload<unknown>(plansResponse.data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                // ignore
            } else {
                throw error;
            }
        }

        const payload: GenericRecord = {
            ...gymSettingsPayload,
            businessHours: operatingHoursPayload,
            membershipPlans: membershipPlansPayload,
        };

        return toSettingsBundle(payload);
    },

    async updateGeneralSettings(
        values: GeneralSettingsFormValues,
    ): Promise<GeneralSettingsFormValues> {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
            GYM_SETTINGS_BASE,
            toGeneralPayload(values),
        );

        const responsePayload =
            asRecord(extractPayload<unknown>(response.data)) ?? {};

        const hasGeneralData =
            asRecord(responsePayload.general) !== null ||
            hasAnyKey(responsePayload, [
                "gymName",
                "name",
                "logo",
                "contactEmail",
                "email",
                "phone",
                "address",
                "tagLine",
                "tagline",
                "description",
                "socialLinks",
                "socialMedia",
            ]);

        if (!hasGeneralData) {
            return values;
        }

        const normalized = normalizeGeneralSettings(responsePayload);
        return {
            ...values,
            ...normalized,
            socialLinks: {
                ...values.socialLinks,
                ...normalized.socialLinks,
            },
        };
    },

    async updateBusinessHours(
        values: BusinessHoursFormValues,
    ): Promise<BusinessHourRow[]> {
        for (const row of values.hours) {
            await api.patch(OPERATING_HOURS_BASE, {
                dayOfWeek: businessDayToDayOfWeek(row.day),
                openTime: row.openTime,
                closeTime: row.closeTime,
                isClosed: row.closed,
            });
        }

        try {
            const response = await api.get<ApiEnvelope<unknown> | unknown>(
                OPERATING_HOURS_BASE,
            );
            const payload: GenericRecord = {
                businessHours: extractPayload<unknown>(response.data),
            };

            return normalizeBusinessHours(payload);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 404) {
                return values.hours;
            }

            throw error;
        }
    },

    async updatePayments(
        values: PaymentsSettingsFormValues,
    ): Promise<PaymentsSettingsFormValues> {
        const payloadToSave = toPaymentsPayload(values);

        if (Object.keys(payloadToSave).length === 0) {
            return values;
        }

        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
            GYM_SETTINGS_BASE,
            payloadToSave,
        );

        const payload = asRecord(extractPayload<unknown>(response.data)) ?? {};

        const hasPaymentsData =
            asRecord(payload.payments) !== null ||
            hasAnyKey(payload, [
                "currency",
                "taxPercentage",
                "taxRate",
                "stripePublicKey",
                "stripeSecretKey",
                "paypalClientId",
                "paypalSecret",
                "stripe",
                "paypal",
            ]);

        if (!hasPaymentsData) {
            return values;
        }

        return {
            ...values,
            ...normalizePaymentsSettings(payload),
        };
    },

    async updateSecurity(
        values: SecuritySettingsFormValues,
    ): Promise<SecuritySettingsFormValues> {
        if (hasPasswordChangeInput(values)) {
            await api.post("/auth/change-password", {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
        }

        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
            GYM_SETTINGS_BASE,
            toSecurityPayload(values),
        );

        const payload = asRecord(extractPayload<unknown>(response.data)) ?? {};

        const hasSecurityData =
            asRecord(payload.security) !== null ||
            hasAnyKey(payload, [
                "emailNotifications",
                "emailNotification",
                "smsNotifications",
                "smsNotification",
                "theme",
            ]);

        if (!hasSecurityData) {
            return {
                ...values,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            };
        }

        const hasThemeData =
            (asRecord(payload.security) !== null &&
                hasAnyKey(asRecord(payload.security) ?? {}, ["theme"])) ||
            hasAnyKey(payload, ["theme"]);

        const normalized = normalizeSecuritySettings(payload);
        return {
            ...values,
            ...normalized,
            theme: hasThemeData ? normalized.theme : values.theme,
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        };
    },

    async createMembershipPlan(
        values: MembershipPlanInput,
    ): Promise<MembershipPlan> {
        const response = await api.post<ApiEnvelope<unknown> | unknown>(
            MEMBERSHIP_PLANS_BASE,
            toLegacyMembershipPayload(values),
        );

        const responsePayload = extractPayload<unknown>(response.data);

        const normalized = normalizeMembershipPlan(responsePayload, 0);

        if (normalized) {
            return normalized;
        }

        return {
            id: `plan-${Date.now()}`,
            ...values,
        };
    },

    async updateMembershipPlan(
        id: string,
        values: MembershipPlanInput,
    ): Promise<MembershipPlan> {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
            `${MEMBERSHIP_PLANS_BASE}/${id}`,
            toLegacyMembershipPayload(values),
        );

        const responsePayload = extractPayload<unknown>(response.data);

        const normalized = normalizeMembershipPlan(responsePayload, 0);

        if (normalized) {
            return normalized;
        }

        return {
            id,
            ...values,
        };
    },

    async deleteMembershipPlan(id: string): Promise<void> {
        await api.delete(`${MEMBERSHIP_PLANS_BASE}/${id}`);
    },
};

export const toSettingsErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null) {
        const errorWithMessage = error as {
            message?: string;
            response?: {
                data?: {
                    message?: string | string[];
                };
            };
        };

        const apiMessage = errorWithMessage.response?.data?.message;

        if (Array.isArray(apiMessage)) {
            return apiMessage.join(", ");
        }

        if (typeof apiMessage === "string" && apiMessage.length > 0) {
            return apiMessage;
        }

        if (
            typeof errorWithMessage.message === "string" &&
            errorWithMessage.message.length > 0
        ) {
            return errorWithMessage.message;
        }
    }

    return "Unable to save settings. Please try again.";
};
