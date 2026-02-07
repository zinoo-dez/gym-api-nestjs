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
  backgroundColor: string;
  textColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  featuresTitle: string;
  featuresSubtitle: string;
  classesTitle: string;
  classesSubtitle: string;
  trainersTitle: string;
  trainersSubtitle: string;
  workoutsTitle: string;
  workoutsSubtitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
  footerTagline: string;
  appShowcaseTitle: string;
  appShowcaseSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
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
  backgroundColor?: string;
  textColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  featuresTitle?: string;
  featuresSubtitle?: string;
  classesTitle?: string;
  classesSubtitle?: string;
  trainersTitle?: string;
  trainersSubtitle?: string;
  workoutsTitle?: string;
  workoutsSubtitle?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  footerTagline?: string;
  appShowcaseTitle?: string;
  appShowcaseSubtitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonLabel?: string;
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
