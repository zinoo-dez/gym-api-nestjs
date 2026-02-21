import { apiClient } from "@/lib/api-client";

export type RetentionRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RetentionTaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "DISMISSED";

export interface RetentionOverview {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  newHighThisWeek: number;
  openTasks: number;
  evaluatedMembers: number;
}

export interface RetentionMember {
  memberId: string;
  fullName: string;
  email: string;
  riskLevel: RetentionRiskLevel;
  score: number;
  reasons: string[];
  lastCheckInAt?: string;
  daysSinceCheckIn?: number;
  subscriptionEndsAt?: string;
  unpaidPendingCount: number;
  lastEvaluatedAt: string;
}

export interface RetentionMembersResponse {
  data: RetentionMember[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RetentionTask {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  assignedToId?: string;
  assignedToEmail?: string;
  status: RetentionTaskStatus;
  priority: number;
  title: string;
  note?: string;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionTasksResponse {
  data: RetentionTask[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RetentionTaskDetail {
  id: string;
  title: string;
  note?: string;
  status: RetentionTaskStatus;
  priority: number;
  dueDate?: string;
  createdAt: string;
  assignedToEmail?: string;
}

export interface RetentionSubscriptionSummary {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  planName?: string;
}

export interface RetentionMemberDetail {
  risk: RetentionMember;
  tasks: RetentionTaskDetail[];
  recentSubscriptions: RetentionSubscriptionSummary[];
}

export interface BulkUpdateRetentionTasksRequest {
  taskIds: string[];
  status?: RetentionTaskStatus;
  priority?: number;
  assignedToId?: string;
  note?: string;
  dueDate?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const retentionService = {
  async getOverview() {
    const response = await apiClient.get<ApiResponse<RetentionOverview>>(
      "/retention/overview",
    );
    return response.data.data ?? response.data;
  },

  async getMembers(params?: {
    page?: number;
    limit?: number;
    riskLevel?: RetentionRiskLevel;
    minScore?: number;
    search?: string;
  }) {
    const response = await apiClient.get<ApiResponse<RetentionMembersResponse>>(
      "/retention/members",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getMemberDetail(memberId: string) {
    const response = await apiClient.get<ApiResponse<RetentionMemberDetail>>(
      `/retention/members/${memberId}`,
    );
    return response.data.data ?? response.data;
  },

  async recalculate() {
    const response = await apiClient.post<ApiResponse<{
      processed: number;
      high: number;
      medium: number;
      low: number;
    }>>("/retention/recalculate");
    return response.data.data ?? response.data;
  },

  async getTasks(params?: {
    page?: number;
    limit?: number;
    status?: RetentionTaskStatus;
    priority?: number;
    assignedToId?: string;
  }) {
    const response = await apiClient.get<ApiResponse<RetentionTasksResponse>>(
      "/retention/tasks",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async updateTask(
    id: string,
    data: {
      status?: RetentionTaskStatus;
      priority?: number;
      assignedToId?: string;
      note?: string;
      dueDate?: string;
    },
  ) {
    const response = await apiClient.patch<ApiResponse<RetentionTask>>(
      `/retention/tasks/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async bulkUpdateTasks(data: BulkUpdateRetentionTasksRequest) {
    const response = await apiClient.patch<ApiResponse<{ updatedCount: number }>>(
      `/retention/tasks/bulk`,
      data,
    );
    return response.data.data ?? response.data;
  },
};
