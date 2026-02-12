import { apiClient } from "@/lib/api-client";

export interface WorkoutPlan {
  id: string;
  memberId: string;
  memberName: string;
  trainerId: string;
  name: string;
  description?: string;
  goal: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  exercises?: any[];
}

export interface CreateWorkoutPlanDto {
  name: string;
  description?: string;
  memberId: string;
  goal: "WEIGHT_LOSS" | "MUSCLE_GAIN" | "ENDURANCE" | "FLEXIBILITY";
  exercises: {
    name: string;
    description?: string;
    sets: number;
    reps: number;
    duration?: number;
    targetMuscles: string[];
    order: number;
  }[];
}

export interface UpdateWorkoutPlanDto extends Partial<CreateWorkoutPlanDto> {}

export interface WorkoutPlansResponse {
  data: WorkoutPlan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const workoutPlansService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    goal?: string;
    memberId?: string;
    trainerId?: string;
  }) {
    const response = await apiClient.get<ApiResponse<WorkoutPlansResponse>>(
      "/workout-plans",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<WorkoutPlan>>(
      `/workout-plans/${id}`,
    );
    return response.data.data ?? response.data;
  },

  async getByMember(memberId: string) {
    const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>(
      `/workout-plans/member/${memberId}`,
    );
    return response.data.data ?? response.data;
  },

  async create(data: CreateWorkoutPlanDto) {
    const response = await apiClient.post<ApiResponse<WorkoutPlan>>(
      "/workout-plans",
      data,
    );
    return response.data.data ?? response.data;
  },

  async update(id: string, data: UpdateWorkoutPlanDto) {
    const response = await apiClient.patch<ApiResponse<WorkoutPlan>>(
      `/workout-plans/${id}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async deactivate(id: string) {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/workout-plans/${id}`,
    );
    return response.data.data ?? response.data;
  },
};
