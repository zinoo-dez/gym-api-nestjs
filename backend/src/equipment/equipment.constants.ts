export const EQUIPMENT_CATEGORIES = [
  'cardio',
  'strength',
  'free_weights',
  'accessories',
] as const;

export const EQUIPMENT_CONDITIONS = [
  'new',
  'good',
  'needs_maintenance',
  'out_of_order',
] as const;

export const MAINTENANCE_FREQUENCIES = [
  'monthly',
  'quarterly',
  'yearly',
] as const;

export const MAINTENANCE_LOG_TYPES = [
  'routine',
  'repair',
  'replacement',
] as const;

export const MAINTENANCE_DUE_FILTERS = ['all', 'overdue', 'next_30_days'] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];
export type EquipmentCondition = (typeof EQUIPMENT_CONDITIONS)[number];
export type MaintenanceFrequency = (typeof MAINTENANCE_FREQUENCIES)[number];
export type MaintenanceLogType = (typeof MAINTENANCE_LOG_TYPES)[number];
export type MaintenanceDueFilter = (typeof MAINTENANCE_DUE_FILTERS)[number];
