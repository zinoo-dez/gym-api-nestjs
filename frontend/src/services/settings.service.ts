import axios from "axios";

import api from "./api";

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

interface ApiEnvelope<T> {
  data: T;
}

type GenericRecord = Record<string, unknown>;

const SETTINGS_BASE = "/settings";
const GYM_SETTINGS_BASE = "/gym-settings";
const OPERATING_HOURS_BASE = "/operating-hours";
const MEMBERSHIP_PLANS_BASE = "/membership-plans";

const isRecord = (value: unknown): value is GenericRecord => {
  return typeof value === "object" && value !== null;
};

const asRecord = (value: unknown): GenericRecord | null => {
  return isRecord(value) ? value : null;
};

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
};

const asNumber = (value: unknown): number | undefined => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return undefined;
};

const asArray = (value: unknown): unknown[] | null => {
  return Array.isArray(value) ? value : null;
};

const hasAnyKey = (record: GenericRecord, keys: string[]): boolean => {
  return keys.some((key) => key in record);
};

const extractPayload = <T>(value: unknown): T => {
  if (isRecord(value) && "data" in value) {
    return (value as ApiEnvelope<T>).data;
  }

  return value as T;
};

const isNotFoundError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

const requestWithNotFoundFallback = async <T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> => {
  try {
    return await primary();
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    return fallback();
  }
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

const normalizeGeneralSettings = (payload: GenericRecord): GeneralSettingsFormValues => {
  const source = asRecord(payload.general) ?? payload;
  const socialSource =
    asRecord(source.socialLinks) ??
    asRecord(source.socialMedia) ??
    asRecord(payload.socialLinks) ??
    asRecord(payload.socialMedia) ??
    {};

  return {
    ...defaultGeneralSettings,
    gymName: asString(source.gymName) ?? asString(source.name) ?? defaultGeneralSettings.gymName,
    logo: asString(source.logo) ?? asString(source.logoUrl) ?? defaultGeneralSettings.logo,
    contactEmail:
      asString(source.contactEmail) ?? asString(source.email) ?? defaultGeneralSettings.contactEmail,
    phone: asString(source.phone) ?? defaultGeneralSettings.phone,
    address: asString(source.address) ?? defaultGeneralSettings.address,
    tagLine: asString(source.tagLine) ?? asString(source.tagline) ?? defaultGeneralSettings.tagLine,
    description: asString(source.description) ?? defaultGeneralSettings.description,
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

  const dayMap = new Map<BusinessDayId, BusinessHourRow>(defaults.map((row) => [row.day, row]));

  for (const rawRow of source) {
    const row = asRecord(rawRow);

    if (!row) {
      continue;
    }

    const rawDay =
      asString(row.day) ?? asString(row.dayOfWeek) ?? asString(row.weekDay) ?? asString(row.name);

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

    const current = dayMap.get(day) ?? defaults.find((item) => item.day === day);

    if (!current) {
      continue;
    }

    const closed = asBoolean(row.closed) ?? asBoolean(row.isClosed) ?? current.closed;
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

const normalizeMembershipPlan = (raw: unknown, index: number): MembershipPlan | null => {
  const row = asRecord(raw);

  if (!row) {
    return null;
  }

  const name = asString(row.name) ?? asString(row.planName) ?? "Untitled Plan";
  const id = asString(row.id) ?? asString(row.planId) ?? `plan-${index + 1}`;

  const apiFeatures = normalizeFeatureList(
    row.features ?? row.featureList ?? row.planFeatures ?? row.membershipFeatures,
  );
  const descriptionFeatures = parseFeaturesFromDescription(row.description);
  const features = apiFeatures.length > 0 ? apiFeatures : descriptionFeatures;

  return {
    id,
    name,
    price: asNumber(row.price) ?? asNumber(row.amount) ?? 0,
    duration: normalizeDuration(row.duration ?? row.billingCycle ?? row.durationDays ?? row.planType),
    features,
  };
};

const normalizeMembershipPlans = (payload: GenericRecord): MembershipPlan[] => {
  const sourceCandidate = payload.membershipPlans ?? payload.memberships ?? payload.plans;

  const source =
    toArrayFromCandidate(sourceCandidate) ??
    toArrayFromCandidate(asRecord(sourceCandidate)?.data) ??
    toArrayFromCandidate(asRecord(sourceCandidate)?.items) ??
    [];

  return source
    .map((row, index) => normalizeMembershipPlan(row, index))
    .filter((plan): plan is MembershipPlan => Boolean(plan));
};

const normalizePaymentsSettings = (payload: GenericRecord): PaymentsSettingsFormValues => {
  const source = asRecord(payload.payments) ?? {};
  const stripe = asRecord(source.stripe) ?? asRecord(payload.stripe) ?? {};
  const paypal = asRecord(source.paypal) ?? asRecord(payload.paypal) ?? {};

  return {
    ...defaultPaymentsSettings,
    currency:
      (
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

const normalizeSecuritySettings = (payload: GenericRecord): SecuritySettingsFormValues => {
  const source = asRecord(payload.security) ?? {};
  const themeCandidate = (asString(source.theme) ?? asString(payload.theme) ?? "light").toLowerCase();

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
    gymName: values.gymName,
    name: values.gymName,
    logo: values.logo,
    contactEmail: values.contactEmail,
    email: values.contactEmail,
    phone: values.phone,
    address: values.address,
    tagLine: values.tagLine,
    description: values.description,
    socialLinks: values.socialLinks,
    socialMedia: values.socialLinks,
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
    new Set(values.features.map((feature) => feature.trim()).filter((feature) => feature.length > 0)),
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
    payments: {
      currency: values.currency,
      taxPercentage: values.taxPercentage,
      stripePublicKey: values.stripePublicKey,
      stripeSecretKey: values.stripeSecretKey,
      paypalClientId: values.paypalClientId,
      paypalSecret: values.paypalSecret,
      stripe: {
        publicKey: values.stripePublicKey,
        secretKey: values.stripeSecretKey,
      },
      paypal: {
        clientId: values.paypalClientId,
        secret: values.paypalSecret,
      },
    },
    currency: values.currency,
    taxPercentage: values.taxPercentage,
    stripePublicKey: values.stripePublicKey,
    stripeSecretKey: values.stripeSecretKey,
    paypalClientId: values.paypalClientId,
    paypalSecret: values.paypalSecret,
  };
};

const hasPasswordChangeInput = (values: SecuritySettingsFormValues): boolean => {
  return (
    values.currentPassword.length > 0 ||
    values.newPassword.length > 0 ||
    values.confirmNewPassword.length > 0
  );
};

const toSecurityPayload = (values: SecuritySettingsFormValues) => {
  const hasPasswordChange = hasPasswordChangeInput(values);

  return {
    security: {
      emailNotifications: values.emailNotifications,
      smsNotifications: values.smsNotifications,
      theme: values.theme,
      ...(hasPasswordChange
        ? {
            changePassword: {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            },
          }
        : {}),
    },
    emailNotifications: values.emailNotifications,
    emailNotification: values.emailNotifications,
    smsNotifications: values.smsNotifications,
    smsNotification: values.smsNotifications,
    theme: values.theme,
    ...(hasPasswordChange
      ? {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }
      : {}),
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
    return requestWithNotFoundFallback(
      async () => {
        const response = await api.get<ApiEnvelope<unknown> | unknown>(SETTINGS_BASE);
        const payload = asRecord(extractPayload<unknown>(response.data)) ?? {};
        return toSettingsBundle(payload);
      },
      async () => {
        const gymSettingsResponse = await api.get<ApiEnvelope<unknown> | unknown>(GYM_SETTINGS_BASE);
        const gymSettingsPayload = asRecord(extractPayload<unknown>(gymSettingsResponse.data)) ?? {};

        let operatingHoursPayload: unknown = [];
        let membershipPlansPayload: unknown = [];

        try {
          const hoursResponse = await api.get<ApiEnvelope<unknown> | unknown>(OPERATING_HOURS_BASE);
          operatingHoursPayload = extractPayload<unknown>(hoursResponse.data);
        } catch (error) {
          if (!isNotFoundError(error)) {
            throw error;
          }
        }

        try {
          const plansResponse = await api.get<ApiEnvelope<unknown> | unknown>(MEMBERSHIP_PLANS_BASE, {
            params: {
              page: 1,
              limit: 200,
            },
          });
          membershipPlansPayload = extractPayload<unknown>(plansResponse.data);
        } catch (error) {
          if (!isNotFoundError(error)) {
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
    );
  },

  async updateGeneralSettings(values: GeneralSettingsFormValues): Promise<GeneralSettingsFormValues> {
    const responsePayload = await requestWithNotFoundFallback(
      async () => {
        const response = await api.put<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/general`,
          toGeneralPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
      async () => {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
          GYM_SETTINGS_BASE,
          toGeneralPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
    );

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

  async updateBusinessHours(values: BusinessHoursFormValues): Promise<BusinessHourRow[]> {
    return requestWithNotFoundFallback(
      async () => {
        const response = await api.put<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/hours`,
          toBusinessHoursPayload(values),
        );

        const payload = asRecord(extractPayload<unknown>(response.data)) ?? {};
        const hasHoursData =
          toArrayFromCandidate(payload.hours) !== null ||
          toArrayFromCandidate(payload.businessHours) !== null ||
          toArrayFromCandidate(payload.operatingHours) !== null;

        if (!hasHoursData) {
          return values.hours;
        }

        return normalizeBusinessHours(payload);
      },
      async () => {
        for (const row of values.hours) {
          await api.patch(OPERATING_HOURS_BASE, {
            dayOfWeek: businessDayToDayOfWeek(row.day),
            openTime: row.openTime,
            closeTime: row.closeTime,
            isClosed: row.closed,
          });
        }

        try {
          const response = await api.get<ApiEnvelope<unknown> | unknown>(OPERATING_HOURS_BASE);
          const payload: GenericRecord = {
            businessHours: extractPayload<unknown>(response.data),
          };

          return normalizeBusinessHours(payload);
        } catch (error) {
          if (!isNotFoundError(error)) {
            throw error;
          }

          return values.hours;
        }
      },
    );
  },

  async updatePayments(values: PaymentsSettingsFormValues): Promise<PaymentsSettingsFormValues> {
    const payload = await requestWithNotFoundFallback(
      async () => {
        const response = await api.put<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/general`,
          toPaymentsPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
      async () => {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
          GYM_SETTINGS_BASE,
          toPaymentsPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
    );

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

  async updateSecurity(values: SecuritySettingsFormValues): Promise<SecuritySettingsFormValues> {
    if (hasPasswordChangeInput(values)) {
      await api.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    }

    const payload = await requestWithNotFoundFallback(
      async () => {
        const response = await api.put<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/general`,
          toSecurityPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
      async () => {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
          GYM_SETTINGS_BASE,
          toSecurityPayload(values),
        );

        return asRecord(extractPayload<unknown>(response.data)) ?? {};
      },
    );

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

    return {
      ...values,
      ...normalizeSecuritySettings(payload),
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    };
  },

  async createMembershipPlan(values: MembershipPlanInput): Promise<MembershipPlan> {
    const responsePayload = await requestWithNotFoundFallback(
      async () => {
        const response = await api.post<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/membership-plans`,
          toMembershipPayload(values),
        );

        return extractPayload<unknown>(response.data);
      },
      async () => {
        const response = await api.post<ApiEnvelope<unknown> | unknown>(
          MEMBERSHIP_PLANS_BASE,
          toLegacyMembershipPayload(values),
        );

        return extractPayload<unknown>(response.data);
      },
    );

    const normalized = normalizeMembershipPlan(responsePayload, 0);

    if (normalized) {
      return normalized;
    }

    return {
      id: `plan-${Date.now()}`,
      ...values,
    };
  },

  async updateMembershipPlan(id: string, values: MembershipPlanInput): Promise<MembershipPlan> {
    const responsePayload = await requestWithNotFoundFallback(
      async () => {
        const response = await api.put<ApiEnvelope<unknown> | unknown>(
          `${SETTINGS_BASE}/membership-plans/${id}`,
          toMembershipPayload(values),
        );

        return extractPayload<unknown>(response.data);
      },
      async () => {
        const response = await api.patch<ApiEnvelope<unknown> | unknown>(
          `${MEMBERSHIP_PLANS_BASE}/${id}`,
          toLegacyMembershipPayload(values),
        );

        return extractPayload<unknown>(response.data);
      },
    );

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
    await requestWithNotFoundFallback(
      async () => {
        await api.delete(`${SETTINGS_BASE}/membership-plans/${id}`);
      },
      async () => {
        await api.delete(`${MEMBERSHIP_PLANS_BASE}/${id}`);
      },
    );
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

    if (typeof errorWithMessage.message === "string" && errorWithMessage.message.length > 0) {
      return errorWithMessage.message;
    }
  }

  return "Unable to save settings. Please try again.";
};
