import { apiClient } from "@/lib/api-client";

export interface WorkoutPlan {
  id: string;
  memberId: string;
  trainerId: string;
  name: string;
  description?: string;
  goal: "muscle" | "fat-loss" | "strength" | "endurance";
  difficulty: "beginner" | "intermediate" | "advanced";
  durationWeeks: number;
  daysPerWeek: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  exercises?: any[];
}

export interface WorkoutPlansResponse {
  data: WorkoutPlan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const workoutPlansService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    goal?: string;
    difficulty?: string;
  }) {
    const response = await apiClient.get<WorkoutPlansResponse>(
      "/workout-plans",
      { params },
    );
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<WorkoutPlan>(`/workout-plans/${id}`);
    return response.data;
  },

  async getByMember(memberId: string) {
    const response = await apiClient.get<WorkoutPlan[]>(
      `/workout-plans/member/${memberId}`,
    );
    return response.data;
  },
};
