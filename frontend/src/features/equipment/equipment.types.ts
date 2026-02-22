import {
  EquipmentCategory,
  EquipmentCondition,
  MaintenanceFrequency,
  MaintenanceLogType,
} from "./equipment.constants";

export interface MaintenanceLogEntry {
  id: string;
  date: string;
  type: MaintenanceLogType;
  description: string;
  cost: number;
  performedBy: string;
  nextDueDate?: string;
}

export interface EquipmentAuditEntry {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy: string;
}

/**
 * Form values for creating or updating an equipment record
 */
export interface EquipmentFormValues {
  name: string;
  category: EquipmentCategory;
  brandModel: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  condition: EquipmentCondition;
  maintenanceFrequency: MaintenanceFrequency;
  lastMaintenanceDate: string;
  assignedArea: string;
  notes: string;
  isActive: boolean;
}

/**
 * Full equipment record including system-generated fields and relations
 */
export interface EquipmentRecord extends EquipmentFormValues {
  id: string;
  nextMaintenanceDue: string;
  maintenanceLogs: MaintenanceLogEntry[];
  auditTrail: EquipmentAuditEntry[];
}

/**
 * Form values for creating a maintenance log entry
 */
export interface MaintenanceLogFormValues {
  date: string;
  type: MaintenanceLogType;
  description: string;
  cost: number;
  performedBy: string;
  nextDueDate?: string;
}

export interface EquipmentFilterState {
  search: string;
  condition: EquipmentCondition | "all";
  category: EquipmentCategory | "all";
  maintenanceDue: "all" | "overdue" | "next_30_days";
}

export interface EquipmentMetrics {
  totalEquipment: number;
  activeEquipment: number;
  needsMaintenance: number;
  outOfOrder: number;
  upcomingMaintenance: number;
  totalAssetValue: number;
}

export interface EquipmentAlertState {
  isMaintenanceOverdue: boolean;
  isMaintenanceUpcoming: boolean;
  isWarrantyExpiring: boolean;
  isWarrantyExpired: boolean;
}
