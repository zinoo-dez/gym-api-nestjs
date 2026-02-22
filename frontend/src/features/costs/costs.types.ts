import {
  CostBillingPeriod,
  CostCategory,
  CostPaymentMethod,
  CostPaymentStatus,
  CostSortDirection,
  CostSortField,
  CostStatus,
  CostType,
} from "./costs.constants";

export interface CostAuditEntry {
  id: string;
  date: string;
  action: string;
  description: string;
  performedBy: string;
}

export interface CostTrackingFields {
  dueDate: string;
  paidDate: string;
  taxAmount: number;
  budgetGroup: string;
  paymentStatus: CostPaymentStatus;
}

export interface CostFormValues extends CostTrackingFields {
  title: string;
  category: CostCategory;
  costType: CostType;
  amount: number;
  paymentMethod: CostPaymentMethod;
  billingPeriod: CostBillingPeriod;
  costDate: string;
  vendor: string;
  referenceNumber: string;
  notes: string;
  createdBy: string;
  status: CostStatus;
}

export interface CostRecord extends CostFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: CostAuditEntry[];
}

export interface CostRecordInput
  extends Omit<CostRecord, keyof CostTrackingFields>,
    Partial<CostTrackingFields> {}

export interface CostFilterState {
  search: string;
  category: CostCategory | "all";
  costType: CostType | "all";
  paymentStatus: CostPaymentStatus | "all";
  status: CostStatus | "all";
  dateFrom: string;
  dateTo: string;
}

export interface CostMetrics {
  totalCurrentMonth: number;
  fixedCurrentMonth: number;
  variableCurrentMonth: number;
  highestCostCategory: CostCategory | null;
  highestCostCategoryTotal: number;
  yearToDateTotal: number;
}

export interface CostPaymentMetrics {
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  dueSoonAmount: number;
}

export interface MonthlyCostTrendPoint {
  monthKey: string;
  label: string;
  total: number;
}

export interface CostCategoryBreakdownPoint {
  category: CostCategory;
  label: string;
  value: number;
}

export interface CostTypeComparisonPoint {
  type: CostType;
  label: string;
  value: number;
}

export interface CostProjectionPoint {
  monthKey: string;
  label: string;
  projectedTotal: number;
}

export interface CostProjectionSummary {
  nextYearTotal: number;
  averageMonthlyProjection: number;
}

export interface RecurringCostTrackItem {
  id: string;
  title: string;
  billingPeriod: CostBillingPeriod;
  nextChargeDate: string;
  amount: number;
  taxAmount: number;
  vendor: string;
  paymentStatus: CostPaymentStatus;
}

export interface VendorSpendSummaryItem {
  vendor: string;
  totalAmount: number;
  entryCount: number;
  averageAmount: number;
  overdueCount: number;
  latestCostDate: string;
}

export interface CostSortState {
  field: CostSortField;
  direction: CostSortDirection;
}

export type CostQuickFilter =
  | "none"
  | "current_month"
  | "fixed"
  | "variable"
  | "highest_category"
  | "ytd";

export type CostSectionView =
  | "overview"
  | "analysis"
  | "records"
  | "recurring"
  | "vendors";
