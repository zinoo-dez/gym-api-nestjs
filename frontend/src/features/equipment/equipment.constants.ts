export const EQUIPMENT_CATEGORIES = [
  "cardio",
  "strength",
  "free_weights",
  "accessories",
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  cardio: "Cardio",
  strength: "Strength",
  free_weights: "Free Weights",
  accessories: "Accessories",
};

export const EQUIPMENT_CONDITIONS = [
  "new",
  "good",
  "needs_maintenance",
  "out_of_order",
] as const;

export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number];

export const EQUIPMENT_CONDITION_LABELS: Record<EquipmentCondition, string> = {
  new: "New",
  good: "Good",
  needs_maintenance: "Needs Maintenance",
  out_of_order: "Out of Order",
};

export const MAINTENANCE_FREQUENCIES = ["monthly", "quarterly", "yearly"] as const;

export type MaintenanceFrequency = (typeof MAINTENANCE_FREQUENCIES)[number];

export const MAINTENANCE_FREQUENCY_LABELS: Record<MaintenanceFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const MAINTENANCE_LOG_TYPES = ["routine", "repair", "replacement"] as const;

export type MaintenanceLogType = (typeof MAINTENANCE_LOG_TYPES)[number];

export const MAINTENANCE_LOG_TYPE_LABELS: Record<MaintenanceLogType, string> = {
  routine: "Routine",
  repair: "Repair",
  replacement: "Replacement",
};

export const MAINTENANCE_DUE_FILTERS = ["all", "overdue", "next_30_days"] as const;

export type MaintenanceDueFilter = (typeof MAINTENANCE_DUE_FILTERS)[number];

export const MAINTENANCE_DUE_FILTER_LABELS: Record<MaintenanceDueFilter, string> = {
  all: "All",
  overdue: "Overdue",
  next_30_days: "Next 30 Days",
};

export const EQUIPMENT_SORT_FIELDS = [
  "name",
  "category",
  "condition",
  "assignedArea",
  "lastMaintenanceDate",
  "nextMaintenanceDue",
  "isActive",
] as const;

export type EquipmentSortField = (typeof EQUIPMENT_SORT_FIELDS)[number];

export type SortDirection = "asc" | "desc";
