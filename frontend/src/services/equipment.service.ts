import api from './api';

import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CONDITIONS,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_LOG_TYPES,
  EquipmentAuditEntry,
  EquipmentCategory,
  EquipmentCondition,
  EquipmentFormValues,
  EquipmentRecord,
  MaintenanceFrequency,
  MaintenanceLogEntry,
  MaintenanceLogFormValues,
  MaintenanceLogType,
} from '@/features/equipment';

interface EquipmentMaintenanceLogApi {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  performedBy: string;
  nextDueDate?: string;
}

interface EquipmentAuditEntryApi {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy: string;
}

interface EquipmentRecordApi {
  id: string;
  name: string;
  category: string;
  brandModel: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  condition: string;
  maintenanceFrequency: string;
  lastMaintenanceDate: string;
  nextMaintenanceDue: string;
  assignedArea: string;
  notes: string;
  isActive: boolean;
  maintenanceLogs: EquipmentMaintenanceLogApi[];
  auditTrail: EquipmentAuditEntryApi[];
}

interface ApiResponse<T> {
  data: T;
}

const toDateOnly = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
};

const normalizeCategory = (value: string): EquipmentCategory => {
  const normalized = value.toLowerCase().replaceAll(' ', '_');
  return EQUIPMENT_CATEGORIES.includes(normalized as EquipmentCategory)
    ? (normalized as EquipmentCategory)
    : 'accessories';
};

const normalizeCondition = (value: string): EquipmentCondition => {
  const normalized = value.toLowerCase().replaceAll(' ', '_');
  return EQUIPMENT_CONDITIONS.includes(normalized as EquipmentCondition)
    ? (normalized as EquipmentCondition)
    : 'good';
};

const normalizeFrequency = (value: string): MaintenanceFrequency => {
  const normalized = value.toLowerCase();
  return MAINTENANCE_FREQUENCIES.includes(normalized as MaintenanceFrequency)
    ? (normalized as MaintenanceFrequency)
    : 'monthly';
};

const normalizeLogType = (value: string): MaintenanceLogType => {
  const normalized = value.toLowerCase();
  return MAINTENANCE_LOG_TYPES.includes(normalized as MaintenanceLogType)
    ? (normalized as MaintenanceLogType)
    : 'routine';
};

const normalizeMaintenanceLog = (
  log: EquipmentMaintenanceLogApi,
): MaintenanceLogEntry => ({
  id: log.id,
  date: toDateOnly(log.date),
  type: normalizeLogType(log.type),
  description: log.description,
  cost: Number(log.cost ?? 0),
  performedBy: log.performedBy,
  nextDueDate: log.nextDueDate ? toDateOnly(log.nextDueDate) : undefined,
});

const normalizeAuditEntry = (entry: EquipmentAuditEntryApi): EquipmentAuditEntry => ({
  id: entry.id,
  date: toDateOnly(entry.date),
  action: entry.action,
  description: entry.description,
  performedBy: entry.performedBy,
});

const normalizeEquipmentRecord = (record: EquipmentRecordApi): EquipmentRecord => ({
  id: record.id,
  name: record.name,
  category: normalizeCategory(record.category),
  brandModel: record.brandModel,
  serialNumber: record.serialNumber,
  purchaseDate: toDateOnly(record.purchaseDate),
  purchaseCost: Number(record.purchaseCost ?? 0),
  warrantyExpiryDate: toDateOnly(record.warrantyExpiryDate),
  condition: normalizeCondition(record.condition),
  maintenanceFrequency: normalizeFrequency(record.maintenanceFrequency),
  lastMaintenanceDate: toDateOnly(record.lastMaintenanceDate),
  nextMaintenanceDue: toDateOnly(record.nextMaintenanceDue),
  assignedArea: record.assignedArea,
  notes: record.notes,
  isActive: Boolean(record.isActive),
  maintenanceLogs: (record.maintenanceLogs ?? []).map(normalizeMaintenanceLog),
  auditTrail: (record.auditTrail ?? []).map(normalizeAuditEntry),
});

interface EquipmentUpsertPayload {
  name: string;
  category: EquipmentCategory;
  brandModel: string;
  serialNumber?: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  condition: EquipmentCondition;
  maintenanceFrequency: MaintenanceFrequency;
  lastMaintenanceDate: string;
  assignedArea: string;
  notes?: string;
  isActive: boolean;
}

const toUpsertPayload = (values: EquipmentFormValues): EquipmentUpsertPayload => ({
  name: values.name,
  category: values.category,
  brandModel: values.brandModel,
  serialNumber: values.serialNumber.trim() || undefined,
  purchaseDate: values.purchaseDate,
  purchaseCost: values.purchaseCost,
  warrantyExpiryDate: values.warrantyExpiryDate,
  condition: values.condition,
  maintenanceFrequency: values.maintenanceFrequency,
  lastMaintenanceDate: values.lastMaintenanceDate,
  assignedArea: values.assignedArea,
  notes: values.notes,
  isActive: values.isActive,
});

interface MaintenancePayload {
  date: string;
  type: MaintenanceLogType;
  description: string;
  cost: number;
  performedBy?: string;
  nextDueDate?: string;
}

const toMaintenancePayload = (
  values: MaintenanceLogFormValues,
  fallbackPerformedBy?: string,
): MaintenancePayload => ({
  date: values.date,
  type: values.type,
  description: values.description,
  cost: values.cost,
  performedBy: values.performedBy.trim() || fallbackPerformedBy,
  nextDueDate: values.nextDueDate?.trim() || undefined,
});

export const equipmentService = {
  async listEquipment(): Promise<EquipmentRecord[]> {
    const response = await api.get<ApiResponse<EquipmentRecordApi[]>>('/equipment');
    return response.data.data.map(normalizeEquipmentRecord);
  },

  async getEquipmentById(id: string): Promise<EquipmentRecord> {
    const response = await api.get<ApiResponse<EquipmentRecordApi>>(`/equipment/${id}`);
    return normalizeEquipmentRecord(response.data.data);
  },

  async createEquipment(values: EquipmentFormValues): Promise<EquipmentRecord> {
    const response = await api.post<ApiResponse<EquipmentRecordApi>>(
      '/equipment',
      toUpsertPayload(values),
    );
    return normalizeEquipmentRecord(response.data.data);
  },

  async updateEquipment(
    id: string,
    values: EquipmentFormValues,
  ): Promise<EquipmentRecord> {
    const response = await api.patch<ApiResponse<EquipmentRecordApi>>(
      `/equipment/${id}`,
      toUpsertPayload(values),
    );
    return normalizeEquipmentRecord(response.data.data);
  },

  async logMaintenance(
    id: string,
    values: MaintenanceLogFormValues,
    fallbackPerformedBy?: string,
  ): Promise<EquipmentRecord> {
    const response = await api.post<ApiResponse<EquipmentRecordApi>>(
      `/equipment/${id}/maintenance`,
      toMaintenancePayload(values, fallbackPerformedBy),
    );
    return normalizeEquipmentRecord(response.data.data);
  },

  async markOutOfOrder(id: string): Promise<EquipmentRecord> {
    const response = await api.post<ApiResponse<EquipmentRecordApi>>(
      `/equipment/${id}/mark-out-of-order`,
    );
    return normalizeEquipmentRecord(response.data.data);
  },

  async retireEquipment(id: string): Promise<EquipmentRecord> {
    const response = await api.post<ApiResponse<EquipmentRecordApi>>(
      `/equipment/${id}/retire`,
    );
    return normalizeEquipmentRecord(response.data.data);
  },
};
