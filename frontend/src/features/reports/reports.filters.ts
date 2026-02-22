import { format, isValid, parseISO, startOfDay, subDays } from "date-fns";

import type { ReportDateRange, ReportsFilters, RevenuePeriod } from "./reports.types";

const REPORT_DATE_RANGES: readonly ReportDateRange[] = ["today", "last7days", "last30days", "custom"];
const REVENUE_PERIODS: readonly RevenuePeriod[] = ["daily", "weekly", "monthly"];

const DATE_FORMAT = "yyyy-MM-dd";

const toDateInputValue = (value: Date): string => format(value, DATE_FORMAT);

const parseDateValue = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : null;
};

const normalizeDateRange = (start: Date, end: Date): { startDate: string; endDate: string } => {
  if (start.getTime() <= end.getTime()) {
    return {
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end),
    };
  }

  return {
    startDate: toDateInputValue(end),
    endDate: toDateInputValue(start),
  };
};

export const resolvePresetDateRange = (
  range: Exclude<ReportDateRange, "custom">,
  referenceDate = new Date(),
): { startDate: string; endDate: string } => {
  const today = startOfDay(referenceDate);

  if (range === "today") {
    const date = toDateInputValue(today);
    return {
      startDate: date,
      endDate: date,
    };
  }

  if (range === "last7days") {
    return normalizeDateRange(subDays(today, 6), today);
  }

  return normalizeDateRange(subDays(today, 29), today);
};

export const getDefaultReportsFilters = (): ReportsFilters => {
  const { startDate, endDate } = resolvePresetDateRange("last30days");

  return {
    range: "last30days",
    period: "daily",
    startDate,
    endDate,
    branch: "all",
    classCategory: "all",
  };
};

const isValidRange = (value: string | null): value is ReportDateRange => {
  if (!value) {
    return false;
  }

  return REPORT_DATE_RANGES.includes(value as ReportDateRange);
};

const isValidPeriod = (value: string | null): value is RevenuePeriod => {
  if (!value) {
    return false;
  }

  return REVENUE_PERIODS.includes(value as RevenuePeriod);
};

const normalizeFilterToken = (value: string | null): string => {
  const normalized = value?.trim();

  if (!normalized) {
    return "all";
  }

  return normalized;
};

export const parseReportsFiltersFromSearchParams = (searchParams: URLSearchParams): ReportsFilters => {
  const defaults = getDefaultReportsFilters();

  const range = isValidRange(searchParams.get("range")) ? searchParams.get("range")! : defaults.range;
  const period = isValidPeriod(searchParams.get("period"))
    ? searchParams.get("period")!
    : defaults.period;

  const branch = normalizeFilterToken(searchParams.get("branch"));
  const classCategory = normalizeFilterToken(searchParams.get("category"));

  if (range !== "custom") {
    const { startDate, endDate } = resolvePresetDateRange(range);

    return {
      range,
      period,
      startDate,
      endDate,
      branch,
      classCategory,
    };
  }

  const parsedStart = parseDateValue(searchParams.get("start"));
  const parsedEnd = parseDateValue(searchParams.get("end"));

  if (!parsedStart || !parsedEnd) {
    const { startDate, endDate } = resolvePresetDateRange("last30days");

    return {
      range: "custom",
      period,
      startDate,
      endDate,
      branch,
      classCategory,
    };
  }

  const normalized = normalizeDateRange(parsedStart, parsedEnd);

  return {
    range: "custom",
    period,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    branch,
    classCategory,
  };
};

export const createSearchParamsFromReportsFilters = (filters: ReportsFilters): URLSearchParams => {
  const params = new URLSearchParams();

  params.set("range", filters.range);
  params.set("period", filters.period);
  params.set("branch", filters.branch);
  params.set("category", filters.classCategory);

  if (filters.range === "custom") {
    params.set("start", filters.startDate);
    params.set("end", filters.endDate);
  }

  return params;
};

export const setDateRangePreset = (
  currentFilters: ReportsFilters,
  range: ReportDateRange,
): ReportsFilters => {
  if (range === "custom") {
    return {
      ...currentFilters,
      range,
    };
  }

  const { startDate, endDate } = resolvePresetDateRange(range);

  return {
    ...currentFilters,
    range,
    startDate,
    endDate,
  };
};
