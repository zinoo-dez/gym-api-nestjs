import { apiClient } from "@/lib/api-client";

export interface GymSettings {
  id: string;
  name: string;
  tagLine: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  description: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  emailNotification: boolean;
  smsNotification: boolean;
  newMemberNotification: boolean;
  newTrainerNotification: boolean;
  newMembershipNotification: boolean;
  newPaymentNotification: boolean;
  newSessionNotification: boolean;
  newWorkoutPlanNotification: boolean;
  newProgressNotification: boolean;
  newAttendanceNotification: boolean;
  newEquipmentNotification: boolean;
  newGymSettingNotification: boolean;
  newUserSettingNotification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGymSettingsRequest {
  name?: string;
  tagLine?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  description?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  emailNotification?: boolean;
  smsNotification?: boolean;
  newMemberNotification?: boolean;
  newTrainerNotification?: boolean;
  newMembershipNotification?: boolean;
  newPaymentNotification?: boolean;
  newSessionNotification?: boolean;
  newWorkoutPlanNotification?: boolean;
  newProgressNotification?: boolean;
  newAttendanceNotification?: boolean;
  newEquipmentNotification?: boolean;
  newGymSettingNotification?: boolean;
  newUserSettingNotification?: boolean;
}

export const gymSettingsService = {
  async getSettings(): Promise<GymSettings> {
    const response = await apiClient.get<any>("/gym-settings");
    return response.data.data || response.data;
  },

  async updateSettings(data: UpdateGymSettingsRequest): Promise<GymSettings> {
    const response = await apiClient.patch<any>("/gym-settings", data);
    return response.data.data || response.data;
  },
};
