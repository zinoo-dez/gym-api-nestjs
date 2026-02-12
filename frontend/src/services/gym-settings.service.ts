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
  heroBadgeText: string;
  heroBackgroundImage?: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features?: Array<{ title: string; description: string; icon?: string }>;
  classesTitle: string;
  classesSubtitle: string;
  trainersTitle: string;
  trainersSubtitle: string;
  trainersCtaLabel?: string;
  workoutsTitle: string;
  workoutsSubtitle: string;
  workoutsCtaLabel?: string;
  pricingTitle: string;
  pricingSubtitle: string;
  footerTagline: string;
  appShowcaseTitle: string;
  appShowcaseSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonLabel: string;
  fontFamily: string;
  heroBgImage?: string;
  featuresBgImage?: string;
  classesBgImage?: string;
  trainersBgImage?: string;
  workoutsBgImage?: string;
  pricingBgImage?: string;
  ctaBgImage?: string;
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
  heroBadgeText?: string;
  heroBackgroundImage?: string;
  featuresTitle?: string;
  featuresSubtitle?: string;
  features?: Array<{ title: string; description: string; icon?: string }>;
  classesTitle?: string;
  classesSubtitle?: string;
  trainersTitle?: string;
  trainersSubtitle?: string;
  trainersCtaLabel?: string;
  workoutsTitle?: string;
  workoutsSubtitle?: string;
  workoutsCtaLabel?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  footerTagline?: string;
  appShowcaseTitle?: string;
  appShowcaseSubtitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonLabel?: string;
  fontFamily?: string;
  heroBgImage?: string;
  featuresBgImage?: string;
  classesBgImage?: string;
  trainersBgImage?: string;
  workoutsBgImage?: string;
  pricingBgImage?: string;
  ctaBgImage?: string;
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

export interface GymOperatingHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface UpdateOperatingHoursRequest {
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
}

export interface GymClosure {
  id: string;
  date: string;
  reason?: string;
}

export interface CreateGymClosureRequest {
  date: string;
  reason?: string;
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

  async getOperatingHours(): Promise<GymOperatingHours[]> {
    const response = await apiClient.get<any>("/operating-hours");
    return response.data.data || response.data;
  },

  async updateOperatingHours(
    data: UpdateOperatingHoursRequest,
  ): Promise<GymOperatingHours> {
    const response = await apiClient.patch<any>("/operating-hours", data);
    return response.data.data || response.data;
  },

  async getClosures(): Promise<GymClosure[]> {
    const response = await apiClient.get<any>("/operating-hours/closures");
    return response.data.data || response.data;
  },

  async createClosure(data: CreateGymClosureRequest): Promise<GymClosure> {
    const response = await apiClient.post<any>(
      "/operating-hours/closures",
      data,
    );
    return response.data.data || response.data;
  },

  async deleteClosure(id: string): Promise<void> {
    await apiClient.delete(`/operating-hours/closures/${id}`);
  },
};
