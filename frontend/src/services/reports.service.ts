import axios from "axios";
import { format, isValid, parseISO } from "date-fns";

import type {
  AttendanceOverview,
  AttendancePoint,
  ExportFormat,
  MembershipDistributionPoint,
  ReportActivityRow,
  ReportKpiMetric,
  ReportsFilters,
  ReportsSummary,
  RevenuePeriod,
  RevenuePoint,
  TrendDirection,
} from "@/features/reports";

import api from "./api";

type GenericRecord = Record<string, unknown>;

interface ApiEnvelope<T> {
  data: T;
}

const shouldTryFallback = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const statusCode = error.response?.status;

  return statusCode === 400 || statusCode === 404 || statusCode === 405 || statusCode === 501;
};

const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === "object" && value !== null;

const asRecord = (value: unknown): GenericRecord | null => (isRecord(value) ? value : null);

const asArray = (value: unknown): unknown[] | null => (Array.isArray(value) ? value : null);

const asString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const asNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const unwrapPayload = <T>(value: unknown): T => {
  let cursor: unknown = value;

  for (let depth = 0; depth < 3; depth += 1) {
    if (!isRecord(cursor) || !("data" in cursor)) {
      break;
    }

    cursor = (cursor as ApiEnvelope<unknown>).data;
  }

  return cursor as T;
};

const roundToTwo = (value: number): number => Number(value.toFixed(2));

const resolveTrendDirection = (changePercent: number): TrendDirection => {
  if (changePercent > 0.05) {
    return "up";
  }

  if (changePercent < -0.05) {
    return "down";
  }

  return "flat";
};

const resolveChangePercent = (source: GenericRecord, currentValue: number): number => {
  const explicitPercent =
    asNumber(source.trendPercentage) ??
    asNumber(source.trendPercent) ??
    asNumber(source.percentChange) ??
    asNumber(source.percentageChange) ??
    asNumber(source.percentage);

  if (typeof explicitPercent === "number") {
    return roundToTwo(explicitPercent);
  }

  const previousValue =
    asNumber(source.previousValue) ??
    asNumber(source.previous) ??
    asNumber(source.lastPeriodValue);

  if (typeof previousValue === "number") {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : 100;
    }

    return roundToTwo(((currentValue - previousValue) / previousValue) * 100);
  }

  const delta = asNumber(source.change) ?? asNumber(source.delta) ?? 0;
  const previous = currentValue - delta;

  if (previous === 0) {
    return delta === 0 ? 0 : 100;
  }

  return roundToTwo((delta / previous) * 100);
};

const toKpiMetric = (input: unknown, fallbackValue = 0): ReportKpiMetric => {
  const record = asRecord(input);

  if (!record) {
    const rawValue = asNumber(input) ?? fallbackValue;
    return {
      value: roundToTwo(rawValue),
      changePercent: 0,
      trendDirection: "flat",
    };
  }

  const value =
    asNumber(record.value) ??
    asNumber(record.total) ??
    asNumber(record.count) ??
    asNumber(record.amount) ??
    fallbackValue;

  const changePercent = resolveChangePercent(record, value);

  return {
    value: roundToTwo(value),
    changePercent,
    trendDirection: resolveTrendDirection(changePercent),
  };
};

const normalizeOptions = (value: unknown): string[] => {
  const rows = asArray(value);

  if (!rows) {
    return [];
  }

  const tokens = rows
    .map((row) => {
      if (typeof row === "string") {
        return row.trim();
      }

      const record = asRecord(row);
      if (!record) {
        return "";
      }

      return (
        asString(record.label) ??
        asString(record.name) ??
        asString(record.value) ??
        asString(record.branch) ??
        asString(record.category) ??
        ""
      );
    })
    .filter((token) => token.length > 0);

  return Array.from(new Set(tokens));
};

const parseMembershipDistribution = (value: unknown): MembershipDistributionPoint[] => {
  const rows = asArray(value);

  if (!rows) {
    return [];
  }

  const distribution = new Map<string, number>();

  for (const row of rows) {
    const record = asRecord(row);
    if (!record) {
      continue;
    }

    const label =
      asString(record.label) ??
      asString(record.name) ??
      asString(record.planName) ??
      asString(record.type) ??
      "Unknown";

    const numericValue =
      asNumber(record.value) ??
      asNumber(record.count) ??
      asNumber(record.total) ??
      asNumber(record.members) ??
      0;

    if (numericValue <= 0) {
      continue;
    }

    distribution.set(label, (distribution.get(label) ?? 0) + numericValue);
  }

  return Array.from(distribution.entries())
    .map(([label, amount]) => ({
      label,
      value: roundToTwo(amount),
    }))
    .sort((left, right) => right.value - left.value);
};

const parseDate = (value: string): Date | null => {
  const isoParsed = parseISO(value);
  if (isValid(isoParsed)) {
    return isoParsed;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(value);
  if (monthMatch) {
    const parsed = new Date(`${monthMatch[1]}-${monthMatch[2]}-01T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const formatSeriesLabel = (rawLabel: string, period: RevenuePeriod): string => {
  const parsed = parseDate(rawLabel);

  if (!parsed) {
    return rawLabel;
  }

  if (period === "daily") {
    return format(parsed, "MMM d");
  }

  if (period === "weekly") {
    return format(parsed, "MMM d");
  }

  return format(parsed, "MMM yyyy");
};

const parseRevenueSeries = (
  payload: unknown,
  period: RevenuePeriod,
  startDate: string,
  endDate: string,
): RevenuePoint[] => {
  const record = asRecord(payload) ?? {};
  const revenueReports = asRecord(record.revenueReports) ?? {};

  const periodSeries =
    (period === "daily" ? asArray(revenueReports.dailyRevenue) : null) ??
    (period === "weekly" ? asArray(revenueReports.weeklyRevenue) : null) ??
    (period === "monthly" ? asArray(revenueReports.monthlyRevenue) : null) ??
    asArray(record.points) ??
    asArray(record.series) ??
    asArray(record[period]) ??
    asArray(record[`${period}Revenue`]) ??
    asArray(record.data) ??
    asArray(payload) ??
    [];

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const points = periodSeries
    .map((row, index) => {
      const rowRecord = asRecord(row) ?? {};
      const rawLabel =
        asString(rowRecord.label) ??
        asString(rowRecord.date) ??
        asString(rowRecord.period) ??
        asString(rowRecord.month) ??
        asString(rowRecord.week) ??
        `Point ${index + 1}`;

      const value =
        asNumber(rowRecord.value) ??
        asNumber(rowRecord.revenue) ??
        asNumber(rowRecord.amount) ??
        asNumber(rowRecord.total) ??
        0;

      const parsedDate = parseDate(rawLabel);

      return {
        label: formatSeriesLabel(rawLabel, period),
        value: roundToTwo(value),
        sortWeight: parsedDate?.getTime() ?? index,
        parsedDate,
      };
    })
    .filter((point) => {
      if (!point.parsedDate || !start || !end) {
        return true;
      }

      return point.parsedDate >= start && point.parsedDate <= end;
    })
    .sort((left, right) => left.sortWeight - right.sortWeight)
    .map(({ label, value }) => ({ label, value }));

  return points;
};

const normalizeStatus = (value: string | undefined): string => {
  if (!value) {
    return "Completed";
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "PAID" || normalized === "SUCCESS" || normalized === "COMPLETED") {
    return "Completed";
  }

  if (normalized === "PENDING") {
    return "Pending";
  }

  if (normalized === "FAILED" || normalized === "DECLINED" || normalized === "VOIDED") {
    return "Failed";
  }

  return value;
};

const inferMemberFromDetail = (detail: string | undefined): string => {
  if (!detail) {
    return "N/A";
  }

  const match = detail.match(/^([A-Za-z'-]+(?:\s+[A-Za-z'-]+){0,2})\s+(checked|booked|started|completed|purchased)/i);

  if (!match) {
    return "N/A";
  }

  return match[1];
};

const parseActivityRows = (value: unknown): ReportActivityRow[] => {
  const rows = asArray(value) ?? [];

  return rows.map((entry, index) => {
    const record = asRecord(entry) ?? {};
    const detail = asString(record.detail);
    const timestamp =
      asString(record.timestamp) ??
      asString(record.time) ??
      asString(record.date) ??
      asString(record.createdAt) ??
      new Date().toISOString();

    return {
      id: asString(record.id) ?? `${timestamp}-${index}`,
      member:
        asString(record.member) ??
        asString(record.memberName) ??
        asString(record.name) ??
        inferMemberFromDetail(detail),
      action:
        asString(record.action) ??
        asString(record.type) ??
        asString(record.description) ??
        detail ??
        "Activity",
      category:
        asString(record.category) ??
        asString(record.classCategory) ??
        asString(record.segment) ??
        "General",
      amount:
        asNumber(record.amount) ??
        asNumber(record.total) ??
        asNumber(record.value) ??
        asNumber(record.revenue) ??
        null,
      status: normalizeStatus(
        asString(record.status) ??
          asString(record.paymentStatus) ??
          asString(record.state) ??
          asString(record.result),
      ),
      timestamp,
      branch: asString(record.branch),
      classCategory: asString(record.classCategory),
    };
  });
};

const formatHourLabel = (hourValue: number): string => `${String(hourValue).padStart(2, "0")}:00`;

const parseAttendancePoints = (value: unknown, axis: "hour" | "day"): AttendancePoint[] => {
  const rows = asArray(value) ?? [];

  const points = rows.map((entry, index) => {
    const record = asRecord(entry) ?? {};
    const numericHour = asNumber(record.hour);
    const label =
      (typeof numericHour === "number" && axis === "hour" ? formatHourLabel(Math.trunc(numericHour)) : undefined) ??
      asString(record.label) ??
      asString(record.day) ??
      asString(record.dayOfWeek) ??
      asString(record.name) ??
      `${axis === "hour" ? "Hour" : "Day"} ${index + 1}`;

    const valueNumber =
      asNumber(record.value) ??
      asNumber(record.count) ??
      asNumber(record.attendance) ??
      asNumber(record.total) ??
      0;

    const sortWeight = axis === "hour" ? Number(label.slice(0, 2)) || index : index;

    return {
      label,
      value: Math.max(Math.trunc(valueNumber), 0),
      sortWeight,
    };
  });

  const weekdayOrder: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    sun: 7,
  };

  points.sort((left, right) => {
    if (axis === "hour") {
      return left.sortWeight - right.sortWeight;
    }

    const leftWeight = weekdayOrder[left.label.toLowerCase()] ?? left.sortWeight;
    const rightWeight = weekdayOrder[right.label.toLowerCase()] ?? right.sortWeight;

    return leftWeight - rightWeight;
  });

  return points.map(({ label, value }) => ({ label, value }));
};

const firstArray = (...candidates: unknown[]): unknown[] | null => {
  for (const candidate of candidates) {
    const rows = asArray(candidate);
    if (rows) {
      return rows;
    }
  }

  return null;
};

const parseAttendanceOverview = (payload: unknown): AttendanceOverview => {
  const record = asRecord(payload) ?? {};
  const operationalMetrics = asRecord(record.operationalMetrics) ?? {};

  const peakHoursSource = firstArray(
    record.peakHours,
    record.peakHoursAnalysis,
    record.hours,
    record.hourly,
    record.byHour,
    operationalMetrics.peakHoursAnalysis,
  );

  const attendanceRecord = asRecord(record.attendance) ?? {};
  const peakDaysSource = firstArray(
    record.peakDays,
    record.days,
    record.daily,
    record.byDay,
    attendanceRecord.visitsByDayOfWeek,
    record.visitsByDayOfWeek,
  );

  return {
    peakHours: parseAttendancePoints(peakHoursSource, "hour"),
    peakDays: parseAttendancePoints(peakDaysSource, "day"),
  };
};

const parseClassCategoriesFromAnalytics = (payload: unknown): string[] => {
  const record = asRecord(payload) ?? {};
  const operationalMetrics = asRecord(record.operationalMetrics) ?? {};
  const equipmentUsage = asRecord(operationalMetrics.equipmentUsagePatterns) ?? {};

  const usageRows = asArray(equipmentUsage.usageByClassCategory) ?? [];

  return usageRows
    .map((row) => {
      const recordRow = asRecord(row) ?? {};
      return asString(recordRow.category) ?? asString(recordRow.label) ?? asString(recordRow.name) ?? "";
    })
    .filter((token) => token.length > 0);
};

const buildFiltersParams = (filters: ReportsFilters): Record<string, string> => {
  const params: Record<string, string> = {
    range: filters.range,
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  if (filters.branch !== "all") {
    params.branch = filters.branch;
  }

  if (filters.classCategory !== "all") {
    params.classCategory = filters.classCategory;
  }

  return params;
};

const toSummaryPayload = (payload: unknown): ReportsSummary => {
  const record = asRecord(payload) ?? {};
  const memberAnalytics = asRecord(record.memberAnalytics) ?? {};
  const filtersRecord = asRecord(record.filters) ?? {};
  const filterOptionsRecord = asRecord(record.filterOptions) ?? {};

  const totalMembersMetric = toKpiMetric(record.totalMembers);
  const inferredSignups = Math.max(asNumber(asRecord(record.totalMembers)?.change) ?? 0, 0);

  const newSignupsMetric = toKpiMetric(record.newSignups ?? record.monthlySignups, inferredSignups);

  const directMembershipDistribution = parseMembershipDistribution(record.membershipDistribution);
  const analyticsMembershipDistribution = parseMembershipDistribution(
    memberAnalytics.membershipPlanDistribution,
  );

  return {
    totalRevenue: toKpiMetric(record.totalRevenue ?? record.monthlyRevenue ?? record.revenue),
    activeMembers: toKpiMetric(record.activeMembers ?? record.activeMemberships),
    todayAttendance: toKpiMetric(record.todayAttendance ?? record.todayCheckIns),
    newSignups:
      newSignupsMetric.value > 0 || inferredSignups === 0
        ? newSignupsMetric
        : {
            value: roundToTwo(totalMembersMetric.value),
            changePercent: totalMembersMetric.changePercent,
            trendDirection: totalMembersMetric.trendDirection,
          },
    membershipDistribution:
      directMembershipDistribution.length > 0
        ? directMembershipDistribution
        : analyticsMembershipDistribution,
    recentTransactions: parseActivityRows(
      record.recentTransactions ?? record.transactions ?? record.memberActivity ?? record.recentActivity,
    ),
    branchOptions: normalizeOptions(
      record.branchOptions ??
        record.branches ??
        filtersRecord.branches ??
        filterOptionsRecord.branches,
    ),
    classCategoryOptions: normalizeOptions(
      record.classCategoryOptions ??
        record.classCategories ??
        filtersRecord.classCategories ??
        filterOptionsRecord.classCategories,
    ),
  };
};

const fillMissingSummaryData = async (
  summary: ReportsSummary,
  filters: ReportsFilters,
): Promise<ReportsSummary> => {
  const shouldFetchAnalytics =
    summary.membershipDistribution.length === 0 || summary.classCategoryOptions.length === 0;
  const shouldFetchRecentActivity = summary.recentTransactions.length === 0;

  if (!shouldFetchAnalytics && !shouldFetchRecentActivity) {
    return summary;
  }

  const analyticsPromise = shouldFetchAnalytics
    ? api
        .get("/dashboard/analytics", { params: buildFiltersParams(filters) })
        .then((response) => unwrapPayload<unknown>(response.data))
        .catch(() => null)
    : Promise.resolve(null);

  const activityPromise = shouldFetchRecentActivity
    ? api
        .get("/dashboard/recent-activity", { params: buildFiltersParams(filters) })
        .then((response) => unwrapPayload<unknown>(response.data))
        .catch(() => null)
    : Promise.resolve(null);

  const [analyticsPayload, activityPayload] = await Promise.all([analyticsPromise, activityPromise]);
  const analyticsRecord = asRecord(analyticsPayload) ?? {};
  const analyticsMemberAnalytics = asRecord(analyticsRecord.memberAnalytics) ?? {};

  const nextSummary: ReportsSummary = {
    ...summary,
    membershipDistribution:
      summary.membershipDistribution.length > 0
        ? summary.membershipDistribution
        : parseMembershipDistribution(analyticsMemberAnalytics.membershipPlanDistribution),
    classCategoryOptions:
      summary.classCategoryOptions.length > 0
        ? summary.classCategoryOptions
        : parseClassCategoriesFromAnalytics(analyticsPayload),
    recentTransactions:
      summary.recentTransactions.length > 0
        ? summary.recentTransactions
        : parseActivityRows(activityPayload),
  };

  return {
    ...nextSummary,
    branchOptions: Array.from(new Set(nextSummary.branchOptions)),
    classCategoryOptions: Array.from(new Set(nextSummary.classCategoryOptions)),
  };
};

const buildFallbackSummary = async (filters: ReportsFilters): Promise<ReportsSummary> => {
  const [statsResult, analyticsResult, activityResult] = await Promise.allSettled([
    api.get("/dashboard/stats", { params: buildFiltersParams(filters) }),
    api.get("/dashboard/analytics", { params: buildFiltersParams(filters) }),
    api.get("/dashboard/recent-activity", { params: buildFiltersParams(filters) }),
  ]);

  const statsPayload = statsResult.status === "fulfilled" ? unwrapPayload<unknown>(statsResult.value.data) : {};
  const analyticsPayload =
    analyticsResult.status === "fulfilled" ? unwrapPayload<unknown>(analyticsResult.value.data) : {};
  const activityPayload =
    activityResult.status === "fulfilled" ? unwrapPayload<unknown>(activityResult.value.data) : [];

  const summary = toSummaryPayload(statsPayload);
  const analyticsRecord = asRecord(analyticsPayload) ?? {};
  const memberAnalytics = asRecord(analyticsRecord.memberAnalytics) ?? {};

  return {
    ...summary,
    membershipDistribution:
      summary.membershipDistribution.length > 0
        ? summary.membershipDistribution
        : parseMembershipDistribution(memberAnalytics.membershipPlanDistribution),
    classCategoryOptions:
      summary.classCategoryOptions.length > 0
        ? summary.classCategoryOptions
        : parseClassCategoriesFromAnalytics(analyticsPayload),
    recentTransactions:
      summary.recentTransactions.length > 0
        ? summary.recentTransactions
        : parseActivityRows(activityPayload),
  };
};

export const reportsService = {
  async getSummary(filters: ReportsFilters): Promise<ReportsSummary> {
    try {
      const response = await api.get("/reports/summary", {
        params: buildFiltersParams(filters),
      });

      const payload = unwrapPayload<unknown>(response.data);
      const normalized = toSummaryPayload(payload);
      return fillMissingSummaryData(normalized, filters);
    } catch (error) {
      if (!shouldTryFallback(error)) {
        throw error;
      }

      return buildFallbackSummary(filters);
    }
  },

  async getRevenueOverview(filters: ReportsFilters): Promise<RevenuePoint[]> {
    try {
      const response = await api.get("/reports/revenue", {
        params: buildFiltersParams(filters),
      });

      const payload = unwrapPayload<unknown>(response.data);
      const parsed = parseRevenueSeries(payload, filters.period, filters.startDate, filters.endDate);

      if (parsed.length > 0) {
        return parsed;
      }
    } catch (error) {
      if (!shouldTryFallback(error)) {
        throw error;
      }
    }

    const analyticsResponse = await api.get("/dashboard/analytics", {
      params: buildFiltersParams(filters),
    });
    const analyticsPayload = unwrapPayload<unknown>(analyticsResponse.data);

    return parseRevenueSeries(analyticsPayload, filters.period, filters.startDate, filters.endDate);
  },

  async getAttendanceOverview(filters: ReportsFilters): Promise<AttendanceOverview> {
    try {
      const response = await api.get("/reports/attendance", {
        params: buildFiltersParams(filters),
      });

      const payload = unwrapPayload<unknown>(response.data);
      const overview = parseAttendanceOverview(payload);

      if (overview.peakHours.length > 0 || overview.peakDays.length > 0) {
        return overview;
      }
    } catch (error) {
      if (!shouldTryFallback(error)) {
        throw error;
      }
    }

    const analyticsResponse = await api.get("/dashboard/analytics", {
      params: buildFiltersParams(filters),
    });
    const analyticsPayload = unwrapPayload<unknown>(analyticsResponse.data);

    return parseAttendanceOverview(analyticsPayload);
  },

  async exportReport(filters: ReportsFilters, formatType: ExportFormat): Promise<Blob> {
    const response = await api.get("/reports/export", {
      params: {
        ...buildFiltersParams(filters),
        format: formatType,
      },
      responseType: "blob",
    });

    const blobData = response.data;

    if (blobData instanceof Blob) {
      return blobData;
    }

    const mimeType = formatType === "pdf" ? "application/pdf" : "text/csv;charset=utf-8";
    return new Blob([blobData], { type: mimeType });
  },
};
