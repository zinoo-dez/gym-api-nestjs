export const MEMBERSHIP_PLAN_TYPES = [
  "monthly",
  "quarterly",
  "yearly",
  "custom",
] as const;

export type MembershipPlanType = (typeof MEMBERSHIP_PLAN_TYPES)[number];

export const MEMBERSHIP_PLAN_TYPE_LABELS: Record<MembershipPlanType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  custom: "Custom",
};

export const MEMBERSHIP_PLAN_TYPE_DURATIONS: Record<
  Exclude<MembershipPlanType, "custom">,
  number
> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const FEATURE_LEVELS = ["BASIC", "STANDARD", "PREMIUM"] as const;

export type FeatureLevel = (typeof FEATURE_LEVELS)[number];

export const FEATURE_LEVEL_LABELS: Record<FeatureLevel, string> = {
  BASIC: "Basic",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

export const MEMBERSHIP_RAW_STATUSES = [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "PENDING",
  "FROZEN",
] as const;

export type MembershipRawStatus = (typeof MEMBERSHIP_RAW_STATUSES)[number];

export const MEMBERSHIP_DISPLAY_STATUSES = [
  "active",
  "expiring_soon",
  "expired",
  "frozen",
  "pending",
] as const;

export type MembershipDisplayStatus =
  (typeof MEMBERSHIP_DISPLAY_STATUSES)[number];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipDisplayStatus, string> =
  {
    active: "Active",
    expiring_soon: "Expiring Soon",
    expired: "Expired",
    frozen: "Frozen",
    pending: "Pending",
  };

export const MEMBERSHIP_STATUS_BADGE_STYLES: Record<
  MembershipDisplayStatus,
  string
> = {
  active: "bg-tertiary-container text-on-tertiary-container",
  expiring_soon: "bg-error-container text-on-error-container",
  expired: "bg-surface-variant text-on-surface-variant",
  frozen: "bg-secondary-container text-on-secondary-container",
  pending: "bg-surface-container-high text-on-surface-variant",
};

export const MEMBERSHIP_QUICK_FILTERS = [
  "all",
  "active",
  "expiring_soon",
  "expired",
  "frozen",
] as const;

export type MembershipQuickFilter = (typeof MEMBERSHIP_QUICK_FILTERS)[number];

export const MEMBERSHIP_PLAN_STATUSES = ["active", "inactive"] as const;

export type MembershipPlanStatus = (typeof MEMBERSHIP_PLAN_STATUSES)[number];

export const MEMBERSHIP_PLAN_STATUS_LABELS: Record<
  MembershipPlanStatus,
  string
> = {
  active: "Active",
  inactive: "Inactive",
};

export const MEMBERSHIP_PLAN_STATUS_BADGE_STYLES: Record<
  MembershipPlanStatus,
  string
> = {
  active: "bg-tertiary-container text-on-tertiary-container",
  inactive: "bg-surface-variant text-on-surface-variant",
};

export const MEMBERSHIP_PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "REJECTED",
  "UNKNOWN",
] as const;

export type MembershipPaymentStatus =
  (typeof MEMBERSHIP_PAYMENT_STATUSES)[number];

export const MEMBERSHIP_PAYMENT_STATUS_LABELS: Record<
  MembershipPaymentStatus,
  string
> = {
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected",
  UNKNOWN: "Not Recorded",
};

export const MEMBERSHIP_PAYMENT_STATUS_BADGE_STYLES: Record<
  MembershipPaymentStatus,
  string
> = {
  PENDING: "bg-error-container text-on-error-container",
  PAID: "bg-tertiary-container text-on-tertiary-container",
  REJECTED: "bg-error text-on-error",
  UNKNOWN: "bg-surface-variant text-on-surface-variant",
};

export const FEATURE_LIBRARY_STATUSES = ["active", "inactive"] as const;

export type FeatureLibraryStatus = (typeof FEATURE_LIBRARY_STATUSES)[number];

export const FEATURE_LIBRARY_STATUS_LABELS: Record<
  FeatureLibraryStatus,
  string
> = {
  active: "Active",
  inactive: "Inactive",
};

export const FEATURE_LIBRARY_STATUS_BADGE_STYLES: Record<
  FeatureLibraryStatus,
  string
> = {
  active: "bg-primary-container text-on-primary-container",
  inactive: "bg-surface-variant text-on-surface-variant",
};

export const PLAN_SORT_OPTIONS = [
  "name_asc",
  "name_desc",
  "price_asc",
  "price_desc",
  "popularity_desc",
  "popularity_asc",
] as const;

export type PlanSortOption = (typeof PLAN_SORT_OPTIONS)[number];

export const MEMBERSHIP_SORT_OPTIONS = ["expiry_asc", "expiry_desc"] as const;

export type MembershipSortOption = (typeof MEMBERSHIP_SORT_OPTIONS)[number];
