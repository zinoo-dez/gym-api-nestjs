import {
  addDays,
  addMonths,
  compareAsc,
  format,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from "date-fns";

import {
  EquipmentSortField,
  MaintenanceDueFilter,
  MaintenanceFrequency,
  SortDirection,
} from "./equipment.constants";
import {
  EquipmentAlertState,
  EquipmentAuditEntry,
  EquipmentFilterState,
  EquipmentFormValues,
  EquipmentMetrics,
  EquipmentRecord,
  MaintenanceLogEntry,
  MaintenanceLogFormValues,
} from "./equipment.types";

const MAINTENANCE_FREQUENCY_TO_MONTHS: Record<MaintenanceFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const toDay = (date: Date): Date => startOfDay(date);

const toDate = (date: string): Date => startOfDay(parseISO(date));

const toDateInputValue = (date: Date): string => format(date, "yyyy-MM-dd");

const createId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createAuditEntry = (
  action: string,
  description: string,
  performedBy: string,
  date?: string,
): EquipmentAuditEntry => ({
  id: createId(),
  action,
  description,
  performedBy,
  date: date ?? toDateInputValue(new Date()),
});

export const formatDisplayDate = (date: string | undefined): string => {
  if (!date) {
    return "-";
  }

  return format(toDate(date), "MMM d, yyyy");
};

export const formatCurrency = (value: number): string => CURRENCY_FORMATTER.format(value);

export const calculateNextMaintenanceDue = (
  lastMaintenanceDate: string,
  frequency: MaintenanceFrequency,
): string => {
  const baseDate = toDate(lastMaintenanceDate);
  const nextDue = addMonths(baseDate, MAINTENANCE_FREQUENCY_TO_MONTHS[frequency]);
  return toDateInputValue(nextDue);
};

export const sortLogsMostRecentFirst = (
  logs: MaintenanceLogEntry[],
): MaintenanceLogEntry[] => {
  return [...logs].sort((a, b) => compareAsc(toDate(b.date), toDate(a.date)));
};

export const getEquipmentAlertState = (
  equipment: EquipmentRecord,
  referenceDate: Date = new Date(),
): EquipmentAlertState => {
  const today = toDay(referenceDate);
  const nextDueDate = toDate(equipment.nextMaintenanceDue);
  const warrantyDate = toDate(equipment.warrantyExpiryDate);
  const upcomingBoundary = toDay(addDays(today, 30));

  const isMaintenanceOverdue = isBefore(nextDueDate, today);
  const isMaintenanceUpcoming =
    !isMaintenanceOverdue &&
    (isEqual(nextDueDate, today) || isBefore(nextDueDate, upcomingBoundary));

  const isWarrantyExpired = isBefore(warrantyDate, today);
  const isWarrantyExpiring =
    !isWarrantyExpired &&
    (isEqual(warrantyDate, today) || isBefore(warrantyDate, upcomingBoundary));

  return {
    isMaintenanceOverdue,
    isMaintenanceUpcoming,
    isWarrantyExpiring,
    isWarrantyExpired,
  };
};

export const isDueInNextDays = (
  equipment: EquipmentRecord,
  days: number,
  referenceDate: Date = new Date(),
): boolean => {
  const today = toDay(referenceDate);
  const nextDueDate = toDate(equipment.nextMaintenanceDue);
  const boundary = toDay(addDays(today, days));

  if (isBefore(nextDueDate, today)) {
    return false;
  }

  return isEqual(nextDueDate, today) || isBefore(nextDueDate, boundary);
};

export const matchesMaintenanceDueFilter = (
  equipment: EquipmentRecord,
  filter: MaintenanceDueFilter,
  referenceDate: Date = new Date(),
): boolean => {
  if (filter === "all") {
    return true;
  }

  const alerts = getEquipmentAlertState(equipment, referenceDate);

  if (filter === "overdue") {
    return alerts.isMaintenanceOverdue;
  }

  return alerts.isMaintenanceUpcoming;
};

export const calculateEquipmentMetrics = (
  equipment: EquipmentRecord[],
  referenceDate: Date = new Date(),
): EquipmentMetrics => {
  return equipment.reduce<EquipmentMetrics>(
    (metrics, item) => {
      const alerts = getEquipmentAlertState(item, referenceDate);

      metrics.totalEquipment += 1;
      if (item.isActive) {
        metrics.activeEquipment += 1;
      }
      if (item.condition === "needs_maintenance") {
        metrics.needsMaintenance += 1;
      }
      if (item.condition === "out_of_order") {
        metrics.outOfOrder += 1;
      }
      if (alerts.isMaintenanceUpcoming) {
        metrics.upcomingMaintenance += 1;
      }
      metrics.totalAssetValue += item.purchaseCost;

      return metrics;
    },
    {
      totalEquipment: 0,
      activeEquipment: 0,
      needsMaintenance: 0,
      outOfOrder: 0,
      upcomingMaintenance: 0,
      totalAssetValue: 0,
    },
  );
};

export const buildEquipmentRecordFromForm = (
  values: EquipmentFormValues,
  performedBy: string,
  id: string = createId(),
): EquipmentRecord => {
  const today = toDateInputValue(new Date());

  const initialLog: MaintenanceLogEntry = {
    id: createId(),
    date: values.lastMaintenanceDate,
    type: "routine",
    description: "Baseline maintenance schedule recorded",
    cost: 0,
    performedBy,
    nextDueDate: calculateNextMaintenanceDue(
      values.lastMaintenanceDate,
      values.maintenanceFrequency,
    ),
  };

  return {
    id,
    name: values.name.trim(),
    category: values.category,
    brandModel: values.brandModel.trim(),
    serialNumber: values.serialNumber.trim() || undefined,
    purchaseDate: values.purchaseDate,
    purchaseCost: values.purchaseCost,
    warrantyExpiryDate: values.warrantyExpiryDate,
    condition: values.condition,
    maintenanceFrequency: values.maintenanceFrequency,
    lastMaintenanceDate: values.lastMaintenanceDate,
    nextMaintenanceDue: calculateNextMaintenanceDue(
      values.lastMaintenanceDate,
      values.maintenanceFrequency,
    ),
    assignedArea: values.assignedArea.trim(),
    notes: values.notes.trim(),
    isActive: values.isActive,
    maintenanceLogs: [initialLog],
    auditTrail: [
      createAuditEntry(
        "Created",
        "Equipment asset was added to inventory",
        performedBy,
        today,
      ),
    ],
  };
};

export const updateEquipmentFromForm = (
  equipment: EquipmentRecord,
  values: EquipmentFormValues,
  performedBy: string,
): EquipmentRecord => {
  const nextMaintenanceDue = calculateNextMaintenanceDue(
    values.lastMaintenanceDate,
    values.maintenanceFrequency,
  );

  const updated: EquipmentRecord = {
    ...equipment,
    name: values.name.trim(),
    category: values.category,
    brandModel: values.brandModel.trim(),
    serialNumber: values.serialNumber.trim() || undefined,
    purchaseDate: values.purchaseDate,
    purchaseCost: values.purchaseCost,
    warrantyExpiryDate: values.warrantyExpiryDate,
    condition: values.condition,
    maintenanceFrequency: values.maintenanceFrequency,
    lastMaintenanceDate: values.lastMaintenanceDate,
    nextMaintenanceDue,
    assignedArea: values.assignedArea.trim(),
    notes: values.notes.trim(),
    isActive: values.isActive,
  };

  return {
    ...updated,
    auditTrail: [
      createAuditEntry(
        "Updated",
        "Equipment details were updated",
        performedBy,
      ),
      ...updated.auditTrail,
    ],
  };
};

export const appendMaintenanceLog = (
  equipment: EquipmentRecord,
  logValues: MaintenanceLogFormValues,
): EquipmentRecord => {
  const newLog: MaintenanceLogEntry = {
    id: createId(),
    date: logValues.date,
    type: logValues.type,
    description: logValues.description.trim(),
    cost: logValues.cost,
    performedBy: logValues.performedBy.trim(),
    nextDueDate: logValues.nextDueDate,
  };

  const nextMaintenanceDue =
    logValues.nextDueDate && logValues.nextDueDate.length > 0
      ? logValues.nextDueDate
      : calculateNextMaintenanceDue(logValues.date, equipment.maintenanceFrequency);

  const nextCondition = logValues.type === "replacement" ? "new" : "good";

  return {
    ...equipment,
    condition: equipment.condition === "out_of_order" ? "good" : nextCondition,
    lastMaintenanceDate: logValues.date,
    nextMaintenanceDue,
    maintenanceLogs: sortLogsMostRecentFirst([newLog, ...equipment.maintenanceLogs]),
    auditTrail: [
      createAuditEntry(
        "Maintenance Logged",
        `${logValues.type} maintenance recorded with cost ${formatCurrency(logValues.cost)}`,
        logValues.performedBy,
        logValues.date,
      ),
      ...equipment.auditTrail,
    ],
  };
};

export const markEquipmentOutOfOrder = (
  equipment: EquipmentRecord,
  performedBy: string,
): EquipmentRecord => {
  return {
    ...equipment,
    condition: "out_of_order",
    auditTrail: [
      createAuditEntry(
        "Marked Out of Order",
        "Equipment condition changed to out of order",
        performedBy,
      ),
      ...equipment.auditTrail,
    ],
  };
};

export const retireEquipment = (
  equipment: EquipmentRecord,
  performedBy: string,
): EquipmentRecord => {
  return {
    ...equipment,
    isActive: false,
    auditTrail: [
      createAuditEntry("Retired", "Equipment was retired from active inventory", performedBy),
      ...equipment.auditTrail,
    ],
  };
};

export const applyEquipmentFilters = (
  equipment: EquipmentRecord[],
  filters: EquipmentFilterState,
): EquipmentRecord[] => {
  const query = filters.search.trim().toLowerCase();

  return equipment.filter((item) => {
    const categorySearchValue = item.category.replaceAll("_", " ").toLowerCase();
    const matchesQuery =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      categorySearchValue.includes(query);

    const matchesCondition =
      filters.condition === "all" || item.condition === filters.condition;

    const matchesCategory = filters.category === "all" || item.category === filters.category;

    const matchesMaintenance = matchesMaintenanceDueFilter(item, filters.maintenanceDue);

    return matchesQuery && matchesCondition && matchesCategory && matchesMaintenance;
  });
};

const compareStrings = (a: string, b: string): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

export const sortEquipmentRecords = (
  equipment: EquipmentRecord[],
  field: EquipmentSortField,
  direction: SortDirection,
): EquipmentRecord[] => {
  const sorted = [...equipment].sort((a, b) => {
    switch (field) {
      case "name":
        return compareStrings(a.name, b.name);
      case "category":
        return compareStrings(a.category, b.category);
      case "condition":
        return compareStrings(a.condition, b.condition);
      case "assignedArea":
        return compareStrings(a.assignedArea, b.assignedArea);
      case "lastMaintenanceDate":
        return compareAsc(toDate(a.lastMaintenanceDate), toDate(b.lastMaintenanceDate));
      case "nextMaintenanceDue":
        return compareAsc(toDate(a.nextMaintenanceDue), toDate(b.nextMaintenanceDue));
      case "isActive":
        return Number(a.isActive) - Number(b.isActive);
      default:
        return 0;
    }
  });

  return direction === "asc" ? sorted : sorted.reverse();
};

export const sanitizeSeedRecord = (record: EquipmentRecord): EquipmentRecord => {
  const normalizedLastDate = record.lastMaintenanceDate;

  return {
    ...record,
    nextMaintenanceDue: calculateNextMaintenanceDue(
      normalizedLastDate,
      record.maintenanceFrequency,
    ),
    maintenanceLogs: sortLogsMostRecentFirst(record.maintenanceLogs),
  };
};

export const getDefaultFormValues = (): EquipmentFormValues => {
  const today = toDateInputValue(new Date());

  return {
    name: "",
    category: "cardio",
    brandModel: "",
    serialNumber: "",
    purchaseDate: today,
    purchaseCost: 0,
    warrantyExpiryDate: today,
    condition: "new",
    maintenanceFrequency: "monthly",
    lastMaintenanceDate: today,
    assignedArea: "",
    notes: "",
    isActive: true,
  };
};

export const getFormValuesFromEquipment = (
  equipment: EquipmentRecord,
): EquipmentFormValues => ({
  name: equipment.name,
  category: equipment.category,
  brandModel: equipment.brandModel,
  serialNumber: equipment.serialNumber ?? "",
  purchaseDate: equipment.purchaseDate,
  purchaseCost: equipment.purchaseCost,
  warrantyExpiryDate: equipment.warrantyExpiryDate,
  condition: equipment.condition,
  maintenanceFrequency: equipment.maintenanceFrequency,
  lastMaintenanceDate: equipment.lastMaintenanceDate,
  assignedArea: equipment.assignedArea,
  notes: equipment.notes,
  isActive: equipment.isActive,
});

export const getDefaultLogFormValues = (): MaintenanceLogFormValues => {
  const today = toDateInputValue(new Date());

  return {
    date: today,
    type: "routine",
    description: "",
    cost: 0,
    performedBy: "",
    nextDueDate: "",
  };
};

export const getMaintenanceHint = (
  frequency: MaintenanceFrequency,
  lastMaintenanceDate: string,
): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastMaintenanceDate)) {
    return "Select a maintenance date to preview next due.";
  }

  const nextDate = calculateNextMaintenanceDue(lastMaintenanceDate, frequency);
  return `Next due ${formatDisplayDate(nextDate)}`;
};

export const canRetireEquipment = (equipment: EquipmentRecord): boolean => equipment.isActive;

export const isWarrantyCovered = (
  equipment: EquipmentRecord,
  referenceDate: Date = new Date(),
): boolean => {
  const warrantyDate = toDate(equipment.warrantyExpiryDate);
  return isAfter(warrantyDate, toDay(referenceDate)) || isEqual(warrantyDate, toDay(referenceDate));
};
