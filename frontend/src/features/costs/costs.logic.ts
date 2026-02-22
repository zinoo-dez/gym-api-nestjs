import {
  addDays,
  addMonths,
  compareAsc,
  differenceInCalendarMonths,
  format,
  isAfter,
  isBefore,
  isEqual,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";

import { formatCurrency as formatCurrencyShared } from "@/lib/currency";

import {
  BILLING_PERIOD_MONTH_INTERVAL,
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  COST_PAYMENT_STATUSES,
  CostCategory,
  CostPaymentStatus,
} from "./costs.constants";
import {
  CostAuditEntry,
  CostCategoryBreakdownPoint,
  CostFilterState,
  CostFormValues,
  CostMetrics,
  CostPaymentMetrics,
  CostProjectionPoint,
  CostProjectionSummary,
  CostQuickFilter,
  CostRecord,
  CostRecordInput,
  CostSortState,
  CostTypeComparisonPoint,
  MonthlyCostTrendPoint,
  RecurringCostTrackItem,
  VendorSpendSummaryItem,
} from "./costs.types";

const parseDateOnly = (value: string | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : null;
};

const toDateInputValue = (date: Date): string => format(date, "yyyy-MM-dd");

const createId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createAuditEntry = (
  action: string,
  description: string,
  performedBy: string,
  date: string = toDateInputValue(new Date()),
): CostAuditEntry => ({
  id: createId(),
  date,
  action,
  description,
  performedBy,
});

const toSafeComparableDate = (value: string): Date => parseDateOnly(value) ?? new Date(0);

const compareStrings = (a: string, b: string): number =>
  a.localeCompare(b, "en", { sensitivity: "base" });

const isPaymentStatus = (value: unknown): value is CostPaymentStatus => {
  return COST_PAYMENT_STATUSES.includes(value as CostPaymentStatus);
};

const inMonth = (value: string, referenceDate: Date): boolean => {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    return false;
  }

  const monthStart = startOfMonth(referenceDate);
  const nextMonthStart = addMonths(monthStart, 1);

  return (
    (isEqual(parsed, monthStart) || isAfter(parsed, monthStart)) &&
    isBefore(parsed, nextMonthStart)
  );
};

const inYearToDate = (value: string, referenceDate: Date): boolean => {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    return false;
  }

  const yearStart = startOfYear(referenceDate);
  const currentDay = startOfDay(referenceDate);

  return (
    (isEqual(parsed, yearStart) || isAfter(parsed, yearStart)) &&
    (isEqual(parsed, currentDay) || isBefore(parsed, currentDay))
  );
};

const inDateRange = (value: string, dateFrom: string, dateTo: string): boolean => {
  const target = parseDateOnly(value);
  if (!target) {
    return false;
  }

  const from = parseDateOnly(dateFrom);
  const to = parseDateOnly(dateTo);

  if (from && isBefore(target, from)) {
    return false;
  }

  if (to && isAfter(target, to)) {
    return false;
  }

  return true;
};

const activeCosts = (costs: CostRecord[]): CostRecord[] =>
  costs.filter((cost) => cost.status === "active");

export const formatDisplayDate = (value: string | undefined): string => {
  const parsed = parseDateOnly(value);
  if (!parsed) {
    return "-";
  }

  return format(parsed, "MMM d, yyyy");
};

export const formatCurrency = (value: number): string => formatCurrencyShared(value);

export const isRecurringBillingPeriod = (billingPeriod: CostRecord["billingPeriod"]): boolean =>
  billingPeriod !== "one_time";

export const isRecurringCost = (cost: CostRecord): boolean =>
  isRecurringBillingPeriod(cost.billingPeriod);

export const getGrossCostAmount = (
  cost: Pick<CostRecord, "amount" | "taxAmount">,
): number => {
  return cost.amount + cost.taxAmount;
};

export const resolvePaymentStatus = (
  inputStatus: CostRecordInput["paymentStatus"] | undefined,
  dueDate: string,
  paidDate: string,
  referenceDate: Date = new Date(),
): CostPaymentStatus => {
  const parsedPaidDate = parseDateOnly(paidDate);
  if (parsedPaidDate) {
    return "paid";
  }

  const due = parseDateOnly(dueDate);
  const today = startOfDay(referenceDate);

  if (inputStatus === "paid") {
    return "paid";
  }

  if (due && isBefore(due, today)) {
    return "overdue";
  }

  if (inputStatus === "overdue") {
    return "overdue";
  }

  if (isPaymentStatus(inputStatus)) {
    return inputStatus;
  }

  return "pending";
};

export const sanitizeCostRecord = (record: CostRecordInput): CostRecord => {
  const createdBy = record.createdBy?.trim().length ? record.createdBy.trim() : "Admin";
  const status = record.status === "archived" ? "archived" : "active";
  const parsedCostDate = parseDateOnly(record.costDate);
  const safeCostDate = parsedCostDate ? toDateInputValue(parsedCostDate) : toDateInputValue(new Date());
  const parsedDueDate = parseDateOnly(record.dueDate);
  const safeDueDate = parsedDueDate ? toDateInputValue(parsedDueDate) : safeCostDate;
  const parsedPaidDate = parseDateOnly(record.paidDate);
  const safePaidDate = parsedPaidDate ? toDateInputValue(parsedPaidDate) : "";
  const taxAmount = Math.max(0, Number(record.taxAmount ?? 0));
  const amount = Math.max(0, Number(record.amount ?? 0));

  return {
    ...record,
    title: record.title.trim(),
    amount,
    costDate: safeCostDate,
    dueDate: safeDueDate,
    paidDate: safePaidDate,
    taxAmount,
    budgetGroup: record.budgetGroup?.trim() ?? "",
    paymentStatus: resolvePaymentStatus(record.paymentStatus, safeDueDate, safePaidDate),
    vendor: record.vendor ?? "",
    referenceNumber: record.referenceNumber ?? "",
    notes: record.notes ?? "",
    createdBy,
    status,
    createdAt: record.createdAt?.slice(0, 10) || safeCostDate,
    updatedAt: record.updatedAt?.slice(0, 10) || safeCostDate,
    auditTrail: [...(record.auditTrail ?? [])].sort((a, b) =>
      compareAsc(toSafeComparableDate(b.date), toSafeComparableDate(a.date)),
    ),
  };
};

export const calculateCostMetrics = (
  costs: CostRecord[],
  referenceDate: Date = new Date(),
): CostMetrics => {
  const byCategory = new Map<CostCategory, number>();
  COST_CATEGORIES.forEach((category) => byCategory.set(category, 0));

  const totals = activeCosts(costs).reduce(
    (accumulator, cost) => {
      const grossAmount = getGrossCostAmount(cost);

      if (inMonth(cost.costDate, referenceDate)) {
        accumulator.totalCurrentMonth += grossAmount;
        if (cost.costType === "fixed") {
          accumulator.fixedCurrentMonth += grossAmount;
        } else {
          accumulator.variableCurrentMonth += grossAmount;
        }

        byCategory.set(cost.category, (byCategory.get(cost.category) ?? 0) + grossAmount);
      }

      if (inYearToDate(cost.costDate, referenceDate)) {
        accumulator.yearToDateTotal += grossAmount;
      }

      return accumulator;
    },
    {
      totalCurrentMonth: 0,
      fixedCurrentMonth: 0,
      variableCurrentMonth: 0,
      yearToDateTotal: 0,
    },
  );

  let highestCostCategory: CostCategory | null = null;
  let highestCostCategoryTotal = 0;

  byCategory.forEach((total, category) => {
    if (total > highestCostCategoryTotal) {
      highestCostCategory = category;
      highestCostCategoryTotal = total;
    }
  });

  return {
    ...totals,
    highestCostCategory,
    highestCostCategoryTotal,
  };
};

export const calculateCostPaymentMetrics = (
  costs: CostRecord[],
  referenceDate: Date = new Date(),
): CostPaymentMetrics => {
  const today = startOfDay(referenceDate);
  const dueSoonBoundary = addDays(today, 7);

  return activeCosts(costs).reduce<CostPaymentMetrics>(
    (metrics, cost) => {
      const grossAmount = getGrossCostAmount(cost);

      if (cost.paymentStatus === "paid") {
        metrics.paidAmount += grossAmount;
      } else if (cost.paymentStatus === "overdue") {
        metrics.overdueAmount += grossAmount;
      } else {
        metrics.pendingAmount += grossAmount;
      }

      const dueDate = parseDateOnly(cost.dueDate);
      if (
        cost.paymentStatus !== "paid" &&
        dueDate &&
        (isEqual(dueDate, today) || isAfter(dueDate, today)) &&
        (isEqual(dueDate, dueSoonBoundary) || isBefore(dueDate, dueSoonBoundary))
      ) {
        metrics.dueSoonAmount += grossAmount;
      }

      return metrics;
    },
    {
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      dueSoonAmount: 0,
    },
  );
};

export const buildMonthlyCostTrend = (
  costs: CostRecord[],
  months: number = 12,
  referenceDate: Date = new Date(),
): MonthlyCostTrendPoint[] => {
  const timelineStart = addMonths(startOfMonth(referenceDate), -(months - 1));
  const source = activeCosts(costs);

  return Array.from({ length: months }, (_, index) => {
    const monthStart = addMonths(timelineStart, index);
    const nextMonthStart = addMonths(monthStart, 1);

    const total = source.reduce((sum, record) => {
      const costDate = parseDateOnly(record.costDate);
      if (!costDate) {
        return sum;
      }

      const withinMonth =
        (isEqual(costDate, monthStart) || isAfter(costDate, monthStart)) &&
        isBefore(costDate, nextMonthStart);

      return withinMonth ? sum + getGrossCostAmount(record) : sum;
    }, 0);

    return {
      monthKey: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM yy"),
      total,
    };
  });
};

export const buildCostByCategoryBreakdown = (
  costs: CostRecord[],
  referenceDate: Date = new Date(),
): CostCategoryBreakdownPoint[] => {
  const ytdCosts = activeCosts(costs).filter((cost) => inYearToDate(cost.costDate, referenceDate));

  const totals = COST_CATEGORIES.reduce<Map<CostCategory, number>>((map, category) => {
    map.set(category, 0);
    return map;
  }, new Map());

  ytdCosts.forEach((cost) => {
    totals.set(cost.category, (totals.get(cost.category) ?? 0) + getGrossCostAmount(cost));
  });

  return COST_CATEGORIES
    .map((category) => ({
      category,
      label: COST_CATEGORY_LABELS[category],
      value: totals.get(category) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

export const buildFixedVsVariableComparison = (
  costs: CostRecord[],
  referenceDate: Date = new Date(),
): CostTypeComparisonPoint[] => {
  const currentMonthCosts = activeCosts(costs).filter((cost) => inMonth(cost.costDate, referenceDate));

  const fixedTotal = currentMonthCosts
    .filter((cost) => cost.costType === "fixed")
    .reduce((sum, cost) => sum + getGrossCostAmount(cost), 0);

  const variableTotal = currentMonthCosts
    .filter((cost) => cost.costType === "variable")
    .reduce((sum, cost) => sum + getGrossCostAmount(cost), 0);

  return [
    {
      type: "fixed",
      label: "Fixed",
      value: fixedTotal,
    },
    {
      type: "variable",
      label: "Variable",
      value: variableTotal,
    },
  ];
};

const occursInProjectedMonth = (cost: CostRecord, monthStart: Date): boolean => {
  const interval = BILLING_PERIOD_MONTH_INTERVAL[cost.billingPeriod];
  if (!interval) {
    return false;
  }

  const anchorDate = parseDateOnly(cost.costDate);
  if (!anchorDate) {
    return false;
  }

  const anchorMonthStart = startOfMonth(anchorDate);
  const diff = differenceInCalendarMonths(monthStart, anchorMonthStart);

  if (diff < 0) {
    return false;
  }

  return diff % interval === 0;
};

export const buildFutureCostProjection = (
  costs: CostRecord[],
  months: number = 12,
  referenceDate: Date = new Date(),
): CostProjectionPoint[] => {
  const recurringCosts = activeCosts(costs).filter(isRecurringCost);
  const firstProjectionMonth = addMonths(startOfMonth(referenceDate), 1);

  return Array.from({ length: months }, (_, index) => {
    const monthStart = addMonths(firstProjectionMonth, index);

    const projectedTotal = recurringCosts.reduce((sum, cost) => {
      return occursInProjectedMonth(cost, monthStart) ? sum + getGrossCostAmount(cost) : sum;
    }, 0);

    return {
      monthKey: format(monthStart, "yyyy-MM"),
      label: format(monthStart, "MMM yy"),
      projectedTotal,
    };
  });
};

export const summarizeFutureProjection = (
  points: CostProjectionPoint[],
): CostProjectionSummary => {
  if (points.length === 0) {
    return {
      nextYearTotal: 0,
      averageMonthlyProjection: 0,
    };
  }

  const nextYearTotal = points.reduce((sum, item) => sum + item.projectedTotal, 0);

  return {
    nextYearTotal,
    averageMonthlyProjection: nextYearTotal / points.length,
  };
};

export const getNextRecurringChargeDate = (
  cost: CostRecord,
  referenceDate: Date = new Date(),
): string => {
  const interval = BILLING_PERIOD_MONTH_INTERVAL[cost.billingPeriod];

  if (!interval) {
    return cost.dueDate || cost.costDate;
  }

  const today = startOfDay(referenceDate);
  const anchorDate = parseDateOnly(cost.dueDate) ?? parseDateOnly(cost.costDate) ?? today;
  let nextDate = anchorDate;
  let attempts = 0;

  while ((isBefore(nextDate, today) || isEqual(nextDate, today)) && attempts < 240) {
    nextDate = addMonths(nextDate, interval);
    attempts += 1;
  }

  return toDateInputValue(nextDate);
};

export const buildRecurringCostTracker = (
  costs: CostRecord[],
  referenceDate: Date = new Date(),
): RecurringCostTrackItem[] => {
  return activeCosts(costs)
    .filter(isRecurringCost)
    .map((cost) => ({
      id: cost.id,
      title: cost.title,
      billingPeriod: cost.billingPeriod,
      nextChargeDate: getNextRecurringChargeDate(cost, referenceDate),
      amount: cost.amount,
      taxAmount: cost.taxAmount,
      vendor: cost.vendor,
      paymentStatus: cost.paymentStatus,
    }))
    .sort((a, b) => compareAsc(toSafeComparableDate(a.nextChargeDate), toSafeComparableDate(b.nextChargeDate)));
};

export const buildVendorSpendSummary = (
  costs: CostRecord[],
): VendorSpendSummaryItem[] => {
  const vendorMap = new Map<string, VendorSpendSummaryItem>();

  activeCosts(costs).forEach((cost) => {
    const vendor = cost.vendor.trim();
    if (!vendor) {
      return;
    }

    const existing = vendorMap.get(vendor);
    const grossAmount = getGrossCostAmount(cost);

    if (!existing) {
      vendorMap.set(vendor, {
        vendor,
        totalAmount: grossAmount,
        entryCount: 1,
        averageAmount: grossAmount,
        overdueCount: cost.paymentStatus === "overdue" ? 1 : 0,
        latestCostDate: cost.costDate,
      });
      return;
    }

    const latestDate =
      compareAsc(toSafeComparableDate(existing.latestCostDate), toSafeComparableDate(cost.costDate)) < 0
        ? cost.costDate
        : existing.latestCostDate;

    const nextCount = existing.entryCount + 1;
    const nextTotal = existing.totalAmount + grossAmount;

    vendorMap.set(vendor, {
      vendor,
      totalAmount: nextTotal,
      entryCount: nextCount,
      averageAmount: nextTotal / nextCount,
      overdueCount: existing.overdueCount + (cost.paymentStatus === "overdue" ? 1 : 0),
      latestCostDate: latestDate,
    });
  });

  return Array.from(vendorMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
};

export const buildUpcomingDueCosts = (
  costs: CostRecord[],
  days: number = 14,
  referenceDate: Date = new Date(),
): CostRecord[] => {
  const today = startOfDay(referenceDate);
  const boundary = addDays(today, days);

  return activeCosts(costs)
    .filter((cost) => cost.paymentStatus !== "paid")
    .filter((cost) => {
      const dueDate = parseDateOnly(cost.dueDate);
      if (!dueDate) {
        return false;
      }

      return (
        (isEqual(dueDate, today) || isAfter(dueDate, today)) &&
        (isEqual(dueDate, boundary) || isBefore(dueDate, boundary))
      );
    })
    .sort((a, b) => compareAsc(toSafeComparableDate(a.dueDate), toSafeComparableDate(b.dueDate)));
};

export const applyCostFilters = (
  costs: CostRecord[],
  filters: CostFilterState,
): CostRecord[] => {
  const query = filters.search.trim().toLowerCase();

  return costs.filter((cost) => {
    const matchesQuery =
      query.length === 0 ||
      cost.title.toLowerCase().includes(query) ||
      cost.vendor.toLowerCase().includes(query) ||
      cost.referenceNumber.toLowerCase().includes(query) ||
      cost.budgetGroup.toLowerCase().includes(query);

    const matchesCategory = filters.category === "all" || cost.category === filters.category;
    const matchesCostType = filters.costType === "all" || cost.costType === filters.costType;
    const matchesPaymentStatus =
      filters.paymentStatus === "all" || cost.paymentStatus === filters.paymentStatus;
    const matchesStatus = filters.status === "all" || cost.status === filters.status;
    const matchesDateRange = inDateRange(cost.costDate, filters.dateFrom, filters.dateTo);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCostType &&
      matchesPaymentStatus &&
      matchesStatus &&
      matchesDateRange
    );
  });
};

export const applyCostQuickFilter = (
  costs: CostRecord[],
  filter: CostQuickFilter,
  highestCategory: CostCategory | null,
  referenceDate: Date = new Date(),
): CostRecord[] => {
  switch (filter) {
    case "none":
      return costs;
    case "current_month":
      return activeCosts(costs).filter((cost) => inMonth(cost.costDate, referenceDate));
    case "fixed":
      return activeCosts(costs).filter(
        (cost) => inMonth(cost.costDate, referenceDate) && cost.costType === "fixed",
      );
    case "variable":
      return activeCosts(costs).filter(
        (cost) => inMonth(cost.costDate, referenceDate) && cost.costType === "variable",
      );
    case "highest_category":
      if (!highestCategory) {
        return [];
      }

      return activeCosts(costs).filter(
        (cost) => inMonth(cost.costDate, referenceDate) && cost.category === highestCategory,
      );
    case "ytd":
      return activeCosts(costs).filter((cost) => inYearToDate(cost.costDate, referenceDate));
    default:
      return costs;
  }
};

export const sortCostRecords = (
  costs: CostRecord[],
  sortState: CostSortState,
): CostRecord[] => {
  const sorted = [...costs].sort((a, b) => {
    switch (sortState.field) {
      case "costDate":
        return compareAsc(toSafeComparableDate(a.costDate), toSafeComparableDate(b.costDate));
      case "dueDate":
        return compareAsc(toSafeComparableDate(a.dueDate), toSafeComparableDate(b.dueDate));
      case "title":
        return compareStrings(a.title, b.title);
      case "category":
        return compareStrings(a.category, b.category);
      case "costType":
        return compareStrings(a.costType, b.costType);
      case "amount":
        return getGrossCostAmount(a) - getGrossCostAmount(b);
      case "billingPeriod":
        return compareStrings(a.billingPeriod, b.billingPeriod);
      case "paymentStatus":
        return compareStrings(a.paymentStatus, b.paymentStatus);
      case "status":
        return compareStrings(a.status, b.status);
      default:
        return 0;
    }
  });

  return sortState.direction === "asc" ? sorted : sorted.reverse();
};

export const getDefaultCostFilterState = (): CostFilterState => {
  const today = startOfDay(new Date());

  return {
    search: "",
    category: "all",
    costType: "all",
    paymentStatus: "all",
    status: "all",
    dateFrom: toDateInputValue(startOfYear(today)),
    dateTo: toDateInputValue(today),
  };
};

export const getDefaultCostFormValues = (createdBy: string): CostFormValues => {
  const today = toDateInputValue(new Date());

  return {
    title: "",
    category: "rent",
    costType: "fixed",
    amount: 0,
    paymentMethod: "bank",
    billingPeriod: "monthly",
    costDate: today,
    dueDate: today,
    paidDate: "",
    taxAmount: 0,
    budgetGroup: "",
    paymentStatus: "pending",
    vendor: "",
    referenceNumber: "",
    notes: "",
    createdBy,
    status: "active",
  };
};

export const getCostFormValuesFromRecord = (record: CostRecord): CostFormValues => ({
  title: record.title,
  category: record.category,
  costType: record.costType,
  amount: record.amount,
  paymentMethod: record.paymentMethod,
  billingPeriod: record.billingPeriod,
  costDate: record.costDate,
  dueDate: record.dueDate,
  paidDate: record.paidDate,
  taxAmount: record.taxAmount,
  budgetGroup: record.budgetGroup,
  paymentStatus: record.paymentStatus,
  vendor: record.vendor,
  referenceNumber: record.referenceNumber,
  notes: record.notes,
  createdBy: record.createdBy,
  status: record.status,
});

const normalizeFormValues = (values: CostFormValues): CostFormValues => {
  const paidDate = values.paidDate.trim();
  const paymentStatus = resolvePaymentStatus(values.paymentStatus, values.dueDate, paidDate);

  return {
    ...values,
    title: values.title.trim(),
    amount: Number(values.amount),
    dueDate: values.dueDate,
    paidDate,
    taxAmount: Math.max(0, Number(values.taxAmount)),
    budgetGroup: values.budgetGroup.trim(),
    paymentStatus,
    vendor: values.vendor.trim(),
    referenceNumber: values.referenceNumber.trim(),
    notes: values.notes.trim(),
    createdBy: values.createdBy.trim(),
  };
};

export const buildCostRecordFromForm = (
  values: CostFormValues,
  performedBy: string,
  id: string = createId(),
): CostRecord => {
  const normalizedValues = normalizeFormValues(values);
  const now = toDateInputValue(new Date());
  const createdBy =
    normalizedValues.createdBy.trim().length > 0 ? normalizedValues.createdBy.trim() : performedBy;

  return {
    ...normalizedValues,
    id,
    createdBy,
    createdAt: now,
    updatedAt: now,
    auditTrail: [
      createAuditEntry("Created", "Cost entry created", performedBy, now),
      createAuditEntry(
        "Payment Status",
        `Payment status set to ${normalizedValues.paymentStatus}`,
        performedBy,
        now,
      ),
      createAuditEntry(
        "Status",
        `Cost status set to ${normalizedValues.status === "active" ? "active" : "archived"}`,
        performedBy,
        now,
      ),
    ],
  };
};

export const updateCostRecordFromForm = (
  record: CostRecord,
  values: CostFormValues,
  performedBy: string,
): CostRecord => {
  const normalizedValues = normalizeFormValues(values);
  const now = toDateInputValue(new Date());
  const statusChanged = record.status !== normalizedValues.status;
  const paymentStatusChanged = record.paymentStatus !== normalizedValues.paymentStatus;

  return {
    ...record,
    ...normalizedValues,
    createdBy: normalizedValues.createdBy || performedBy,
    updatedAt: now,
    auditTrail: [
      createAuditEntry("Updated", "Cost details updated", performedBy, now),
      ...(paymentStatusChanged
        ? [
            createAuditEntry(
              "Payment Status",
              `Payment status changed to ${normalizedValues.paymentStatus}`,
              performedBy,
              now,
            ),
          ]
        : []),
      ...(statusChanged
        ? [
            createAuditEntry(
              "Status",
              `Cost status changed to ${normalizedValues.status === "active" ? "active" : "archived"}`,
              performedBy,
              now,
            ),
          ]
        : []),
      ...record.auditTrail,
    ],
  };
};

export const archiveCostRecord = (
  record: CostRecord,
  performedBy: string,
): CostRecord => {
  const now = toDateInputValue(new Date());

  if (record.status === "archived") {
    return record;
  }

  return {
    ...record,
    status: "archived",
    updatedAt: now,
    auditTrail: [
      createAuditEntry("Archived", "Cost entry archived", performedBy, now),
      ...record.auditTrail,
    ],
  };
};

export const restoreCostRecord = (
  record: CostRecord,
  performedBy: string,
): CostRecord => {
  const now = toDateInputValue(new Date());

  if (record.status === "active") {
    return record;
  }

  return {
    ...record,
    status: "active",
    updatedAt: now,
    auditTrail: [
      createAuditEntry("Restored", "Cost entry restored", performedBy, now),
      ...record.auditTrail,
    ],
  };
};

export const getDuplicateCostFormValues = (
  record: CostRecord,
  createdBy: string,
): CostFormValues => {
  const today = toDateInputValue(new Date());

  return {
    ...getCostFormValuesFromRecord(record),
    costDate: today,
    dueDate: today,
    paidDate: "",
    paymentStatus: "pending",
    status: "active",
    createdBy,
  };
};

export const getCostDateValidationHint = (value: string): string => {
  const date = parseDateOnly(value);
  if (!date) {
    return "Choose a valid cost date.";
  }

  const today = startOfDay(new Date());
  if (isAfter(date, today)) {
    return "Cost date cannot be in the future.";
  }

  return `Recorded date: ${formatDisplayDate(value)}`;
};

export const getCostDueDateValidationHint = (value: string): string => {
  const date = parseDateOnly(value);
  if (!date) {
    return "Choose a valid due date.";
  }

  return `Due date: ${formatDisplayDate(value)}`;
};

export const getHighestCostCategoryLabel = (metrics: CostMetrics): string => {
  if (!metrics.highestCostCategory) {
    return "No current month data";
  }

  return COST_CATEGORY_LABELS[metrics.highestCostCategory];
};

export const getCostCategoryLabel = (category: CostCategory): string => COST_CATEGORY_LABELS[category];
