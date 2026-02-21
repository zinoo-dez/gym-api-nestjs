import { apiClient } from "@/lib/api-client";

export type ProgressPhotoPose = "FRONT" | "SIDE" | "BACK" | "FLEXED" | "OTHER";
export type ProgressPhotoPhase = "BEFORE" | "AFTER" | "PROGRESS";
export type ProgressGoalType = "WEIGHT" | "STRENGTH" | "BODY_COMPOSITION" | "MEASUREMENT";
export type ProgressMetric =
  | "WEIGHT"
  | "BMI"
  | "BODY_FAT"
  | "MUSCLE_MASS"
  | "CHEST"
  | "WAIST"
  | "HIPS"
  | "LEFT_ARM"
  | "RIGHT_ARM"
  | "LEFT_THIGH"
  | "RIGHT_THIGH"
  | "LEFT_CALF"
  | "RIGHT_CALF"
  | "BENCH_PRESS"
  | "SQUAT"
  | "DEADLIFT"
  | "CUSTOM";

export type ProgressGoalStatus = "ACTIVE" | "ACHIEVED" | "PAUSED" | "CANCELLED";

export interface BodyCompositionMeasurement {
  id: string;
  memberId: string;
  recordedAt: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  cardioEndurance?: string;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  memberId: string;
  photoUrl: string;
  pose: ProgressPhotoPose;
  phase: ProgressPhotoPhase;
  capturedAt: string;
  note?: string;
}

export interface ProgressGoal {
  id: string;
  memberId: string;
  type: ProgressGoalType;
  metric: ProgressMetric;
  title: string;
  description?: string;
  unit?: string;
  startValue?: number;
  targetValue: number;
  currentValue?: number;
  status: ProgressGoalStatus;
  targetDate?: string;
  achievedAt?: string;
  createdAt: string;
  updatedAt: string;
  progressPercent?: number;
}

export interface ProgressMilestone {
  id: string;
  memberId: string;
  goalId?: string;
  title: string;
  description?: string;
  reachedValue?: number;
  unit?: string;
  shareToken?: string;
  sharePath?: string;
  achievedAt: string;
}

export interface DashboardSummary {
  totalEntries: number;
  periodStart?: string | null;
  periodEnd?: string | null;
  latestWeight?: number | null;
  weightChange?: number | null;
  latestBodyFat?: number | null;
  bodyFatChange?: number | null;
  latestMuscleMass?: number | null;
  muscleMassChange?: number | null;
  latestBmi?: number | null;
  bmiChange?: number | null;
}

export interface BodyCompositionDashboard {
  summary: DashboardSummary;
  charts: Record<string, Array<{ recordedAt: string; value: number }>>;
  goals: ProgressGoal[];
  milestones: ProgressMilestone[];
  photos: {
    total: number;
    beforeCount: number;
    afterCount: number;
    progressCount: number;
    latest?: ProgressPhoto | null;
  };
}

export interface RecordMeasurementRequest {
  recordedAt?: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  cardioEndurance?: string;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
}

export interface CreatePhotoRequest {
  photoUrl: string;
  pose?: ProgressPhotoPose;
  phase?: ProgressPhotoPhase;
  capturedAt?: string;
  note?: string;
}

export interface CreateGoalRequest {
  type: ProgressGoalType;
  metric: ProgressMetric;
  title: string;
  description?: string;
  unit?: string;
  startValue?: number;
  targetValue: number;
  targetDate?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  unit?: string;
  targetValue?: number;
  currentValue?: number;
  status?: ProgressGoalStatus;
  targetDate?: string;
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

export const bodyCompositionService = {
  async recordMeasurement(data: RecordMeasurementRequest) {
    const response = await apiClient.post<ApiResponse<any>>(
      "/body-composition/measurements",
      data,
    );
    return response.data.data ?? response.data;
  },

  async getMyMeasurements(params?: { from?: string; to?: string; take?: number }) {
    const response = await apiClient.get<ApiResponse<BodyCompositionMeasurement[]>>(
      "/body-composition/me/measurements",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getMyPhotos(params?: {
    from?: string;
    to?: string;
    take?: number;
    phase?: ProgressPhotoPhase;
    pose?: ProgressPhotoPose;
  }) {
    const response = await apiClient.get<ApiResponse<ProgressPhoto[]>>(
      "/body-composition/me/photos",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async createPhoto(data: CreatePhotoRequest) {
    const response = await apiClient.post<ApiResponse<ProgressPhoto>>(
      "/body-composition/photos",
      data,
    );
    return response.data.data ?? response.data;
  },

  async compareMyPhotos(params?: {
    beforePhotoId?: string;
    afterPhotoId?: string;
    pose?: ProgressPhotoPose;
  }) {
    const response = await apiClient.get<ApiResponse<any>>(
      "/body-composition/me/photos/comparison",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async createGoal(data: CreateGoalRequest) {
    const response = await apiClient.post<ApiResponse<any>>(
      "/body-composition/goals",
      data,
    );
    return response.data.data ?? response.data;
  },

  async getMyGoals(params?: { status?: ProgressGoalStatus; take?: number }) {
    const response = await apiClient.get<ApiResponse<ProgressGoal[]>>(
      "/body-composition/me/goals",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async updateGoal(goalId: string, data: UpdateGoalRequest) {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/body-composition/goals/${goalId}`,
      data,
    );
    return response.data.data ?? response.data;
  },

  async getMyMilestones(params?: { from?: string; to?: string; take?: number }) {
    const response = await apiClient.get<ApiResponse<ProgressMilestone[]>>(
      "/body-composition/me/milestones",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async shareMilestone(id: string) {
    const response = await apiClient.post<ApiResponse<any>>(
      `/body-composition/milestones/${id}/share`,
    );
    return response.data.data ?? response.data;
  },

  async getMyDashboard(params?: { from?: string; to?: string; take?: number }) {
    const response = await apiClient.get<ApiResponse<BodyCompositionDashboard>>(
      "/body-composition/me/dashboard",
      { params },
    );
    return response.data.data ?? response.data;
  },

  async getMyReport(params?: { from?: string; to?: string; take?: number }) {
    const response = await apiClient.get<ApiResponse<any>>(
      "/body-composition/me/report",
      { params },
    );
    return response.data.data ?? response.data;
  },
};
