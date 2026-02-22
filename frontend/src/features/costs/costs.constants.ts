export const COST_CATEGORIES = [
  "rent",
  "utilities",
  "salaries",
  "equipment",
  "maintenance",
  "marketing",
  "software",
  "other",
] as const;

export type CostCategory = (typeof COST_CATEGORIES)[number];

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  rent: "Rent",
  utilities: "Utilities",
  salaries: "Salaries",
  equipment: "Equipment",
  maintenance: "Maintenance",
  marketing: "Marketing",
  software: "Software",
  other: "Other",
};

export const COST_TYPES = ["fixed", "variable"] as const;

export type CostType = (typeof COST_TYPES)[number];

export const COST_TYPE_LABELS: Record<CostType, string> = {
  fixed: "Fixed",
  variable: "Variable",
};

export const COST_PAYMENT_METHODS = ["cash", "bank", "card", "online"] as const;

export type CostPaymentMethod = (typeof COST_PAYMENT_METHODS)[number];

export const COST_PAYMENT_METHOD_LABELS: Record<CostPaymentMethod, string> = {
  cash: "Cash",
  bank: "Bank",
  card: "Card",
  online: "Online",
};

export const COST_PAYMENT_STATUSES = ["pending", "paid", "overdue"] as const;

export type CostPaymentStatus = (typeof COST_PAYMENT_STATUSES)[number];

export const COST_PAYMENT_STATUS_LABELS: Record<CostPaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

export const COST_BILLING_PERIODS = ["one_time", "monthly", "quarterly", "yearly"] as const;

export type CostBillingPeriod = (typeof COST_BILLING_PERIODS)[number];

export const COST_BILLING_PERIOD_LABELS: Record<CostBillingPeriod, string> = {
  one_time: "One-time",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const COST_STATUSES = ["active", "archived"] as const;

export type CostStatus = (typeof COST_STATUSES)[number];

export const COST_STATUS_LABELS: Record<CostStatus, string> = {
  active: "Active",
  archived: "Archived",
};

export const COST_SORT_FIELDS = [
  "costDate",
  "dueDate",
  "title",
  "category",
  "costType",
  "amount",
  "billingPeriod",
  "paymentStatus",
  "status",
] as const;

export type CostSortField = (typeof COST_SORT_FIELDS)[number];

export type CostSortDirection = "asc" | "desc";

export const BILLING_PERIOD_MONTH_INTERVAL: Record<CostBillingPeriod, number | null> = {
  one_time: null,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};
