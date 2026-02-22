export type ReportDateRange = "today" | "last7days" | "last30days" | "custom";

export type RevenuePeriod = "daily" | "weekly" | "monthly";

export type TrendDirection = "up" | "down" | "flat";

export type ExportFormat = "csv" | "pdf";

export interface ReportsFilters {
  range: ReportDateRange;
  period: RevenuePeriod;
  startDate: string;
  endDate: string;
  branch: string;
  classCategory: string;
}

export interface ReportKpiMetric {
  value: number;
  changePercent: number;
  trendDirection: TrendDirection;
}

export interface MembershipDistributionPoint {
  label: string;
  value: number;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface AttendancePoint {
  label: string;
  value: number;
}

export interface AttendanceOverview {
  peakHours: AttendancePoint[];
  peakDays: AttendancePoint[];
}

export interface ReportActivityRow {
  id: string;
  member: string;
  action: string;
  category: string;
  amount: number | null;
  status: string;
  timestamp: string;
  branch?: string;
  classCategory?: string;
}

export interface ReportsSummary {
  totalRevenue: ReportKpiMetric;
  activeMembers: ReportKpiMetric;
  todayAttendance: ReportKpiMetric;
  newSignups: ReportKpiMetric;
  membershipDistribution: MembershipDistributionPoint[];
  recentTransactions: ReportActivityRow[];
  branchOptions: string[];
  classCategoryOptions: string[];
}
