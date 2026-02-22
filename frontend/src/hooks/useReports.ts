import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ReportsFilters } from "@/features/reports";
import { reportsService } from "@/services/reports.service";

const buildFilterKey = (filters: ReportsFilters) =>
  [
    filters.range,
    filters.period,
    filters.startDate,
    filters.endDate,
    filters.branch,
    filters.classCategory,
  ] as const;

export const reportsQueryKeys = {
  all: ["reports"] as const,
  summary: (filters: ReportsFilters) => ["reports", "summary", ...buildFilterKey(filters)] as const,
  revenue: (filters: ReportsFilters) => ["reports", "revenue", ...buildFilterKey(filters)] as const,
  attendance: (filters: ReportsFilters) => ["reports", "attendance", ...buildFilterKey(filters)] as const,
};

export const useReportsSummaryQuery = (filters: ReportsFilters) =>
  useQuery({
    queryKey: reportsQueryKeys.summary(filters),
    queryFn: () => reportsService.getSummary(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const useRevenueOverviewQuery = (filters: ReportsFilters) =>
  useQuery({
    queryKey: reportsQueryKeys.revenue(filters),
    queryFn: () => reportsService.getRevenueOverview(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

export const useAttendanceOverviewQuery = (filters: ReportsFilters) =>
  useQuery({
    queryKey: reportsQueryKeys.attendance(filters),
    queryFn: () => reportsService.getAttendanceOverview(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
