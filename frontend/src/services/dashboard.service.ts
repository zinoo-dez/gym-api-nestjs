import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
  totalMembers: {
    value: number;
    change: number;
    type: "increase" | "decrease";
  };
  activeMemberships: {
    value: number;
    change: number;
    type: "increase" | "decrease";
  };
  expiringMemberships: {
    value: number;
    change: number;
    type: "increase" | "decrease";
  };
  todayCheckIns: {
    value: number;
    change: number;
    type: "increase" | "decrease";
  };
  monthlyRevenue: {
    value: number;
    change: number;
    type: "increase" | "decrease";
  };
}

export interface RecentMember {
  id: string;
  name: string;
  email: string;
  plan: string;
  joined: string;
  status: string;
}

export interface PopularClass {
  id: string;
  name: string;
  trainer: string;
  enrolled: number;
  capacity: number;
  time: string;
}

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
}

export interface UpcomingClasses {
  windowDays: number;
  totalUpcomingClasses: number;
  totalCapacity: number;
  totalBookings: number;
  utilization: number;
  topClasses: Array<{
    id: string;
    name: string;
    trainer: string;
    booked: number;
    capacity: number;
    startTime: string;
  }>;
}

export interface ReportingAnalytics {
  generatedAt: string;
  revenueReports: {
    dailyRevenue: Array<{ label: string; value: number }>;
    weeklyRevenue: Array<{ label: string; value: number }>;
    monthlyRevenue: Array<{ label: string; value: number }>;
    revenueBySource: {
      memberships: number;
      products: number;
      sessions: number;
    };
    paymentCollection: {
      invoicedAmount: number;
      collectedAmount: number;
      collectionRate: number;
    };
    outstandingPayments: {
      invoiceOutstanding: number;
      pendingPayments: number;
      totalOutstanding: number;
    };
  };
  memberAnalytics: {
    growthTrends: Array<{ label: string; value: number }>;
    churnRate: number;
    activeVsInactive: {
      activeMembers: number;
      inactiveMembers: number;
      previousPeriodActiveMembers: number;
    };
    demographics: {
      genderDistribution: Record<string, number>;
      ageDistribution: {
        under18: number;
        age18to25: number;
        age26to35: number;
        age36to45: number;
        age46plus: number;
        unknown: number;
      };
    };
    membershipPlanDistribution: Array<{ planName: string; count: number }>;
  };
  operationalMetrics: {
    peakHoursAnalysis: Array<{ label: string; value: number }>;
    classAttendanceTrends: Array<{ className: string; attendanceCount: number }>;
    trainerUtilization: {
      totalTrainers: number;
      engagedTrainers: number;
      utilizationRate: number;
      topTrainersBySessions: Array<{
        trainerId: string;
        trainerName: string;
        sessionsCount: number;
      }>;
    };
    equipmentUsagePatterns: {
      usageByClassCategory: Array<{ category: string; usage: number }>;
      activeEquipmentByCategory: Record<string, number>;
    };
    averageMemberLifetimeValue: number;
  };
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const dashboardService = {
  async getStats() {
    const response =
      await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return response.data.data ?? response.data;
  },

  async getRecentMembers() {
    const response = await apiClient.get<ApiResponse<RecentMember[]>>(
      "/dashboard/recent-members",
    );
    return response.data.data ?? response.data;
  },

  async getPopularClasses() {
    const response = await apiClient.get<ApiResponse<PopularClass[]>>(
      "/dashboard/popular-classes",
    );
    return response.data.data ?? response.data;
  },

  async getUpcomingClasses(days = 7) {
    const response = await apiClient.get<ApiResponse<UpcomingClasses>>(
      `/dashboard/upcoming-classes?days=${days}`,
    );
    return response.data.data ?? response.data;
  },

  async getRecentActivity() {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      "/dashboard/recent-activity",
    );
    return response.data.data ?? response.data;
  },

  async getReportingAnalytics() {
    const response = await apiClient.get<ApiResponse<ReportingAnalytics>>(
      "/dashboard/analytics",
    );
    return response.data.data ?? response.data;
  },
};
