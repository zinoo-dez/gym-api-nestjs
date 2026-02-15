import { apiClient } from "@/lib/api-client";

export type TrainerSessionStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export interface TrainerSession {
  id: string;
  memberId: string;
  trainerId: string;
  sessionDate: string;
  duration: number;
  title: string;
  description?: string;
  notes?: string;
  rate: number;
  status: TrainerSessionStatus;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName?: string;
    lastName?: string;
    user?: { firstName?: string; lastName?: string; email?: string };
  };
  trainer?: {
    id: string;
    user?: { firstName?: string; lastName?: string; email?: string };
  };
}

export interface CreateTrainerSessionRequest {
  memberId: string;
  trainerId?: string;
  sessionDate: string;
  duration: number;
  title: string;
  description?: string;
  notes?: string;
  rate: number;
  status?: TrainerSessionStatus;
}

export interface BookableMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateUserProgressRequest {
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  cardioEndurance?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const trainerSessionsService = {
  async create(data: CreateTrainerSessionRequest) {
    const response = await apiClient.post<ApiResponse<TrainerSession>>(
      "/trainer-sessions",
      data,
    );
    return response.data.data ?? response.data;
  },

  async getAll(params?: {
    memberId?: string;
    trainerId?: string;
    status?: TrainerSessionStatus;
    upcomingOnly?: boolean;
  }) {
    const response = await apiClient.get<ApiResponse<TrainerSession[]>>(
      "/trainer-sessions",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async complete(id: string) {
    const response = await apiClient.patch<ApiResponse<TrainerSession>>(
      `/trainer-sessions/${id}/complete`,
    );
    return response.data.data ?? response.data;
  },

  async recordProgress(sessionId: string, data: CreateUserProgressRequest) {
    const response = await apiClient.post<ApiResponse<any>>(
      `/trainer-sessions/${sessionId}/progress`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async getMemberProgress(memberId: string) {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/trainer-sessions/member/${memberId}/progress`,
    );
    return response.data.data ?? response.data;
  },

  async getMyProgress() {
    const response = await apiClient.get<ApiResponse<any[]>>(
      "/trainer-sessions/me/progress",
    );
    return response.data.data ?? response.data;
  },

  async getBookableMembers() {
    const response = await apiClient.get<ApiResponse<BookableMember[]>>(
      "/trainer-sessions/bookable-members",
    );
    return response.data.data ?? response.data;
  },
};
