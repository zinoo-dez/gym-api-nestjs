export type SettingsTabId =
  | "general"
  | "hours"
  | "memberships"
  | "payments"
  | "security";

export type BusinessDayId =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type MembershipPlanDuration = "MONTHLY" | "YEARLY";

export type ThemeMode = "light" | "dark";

export interface SocialLinks {
  website: string;
  facebook: string;
  instagram: string;
  twitter: string;
}

export interface GeneralSettingsFormValues {
  gymName: string;
  logo: string;
  contactEmail: string;
  phone: string;
  address: string;
  tagLine: string;
  description: string;
  socialLinks: SocialLinks;
}

export interface BusinessHourRow {
  day: BusinessDayId;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

export interface BusinessHoursFormValues {
  hours: BusinessHourRow[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: MembershipPlanDuration;
  features: string[];
}

export type MembershipPlanInput = Omit<MembershipPlan, "id">;

export interface PaymentsSettingsFormValues {
  currency: string;
  taxPercentage: number;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalClientId: string;
  paypalSecret: string;
}

export interface SecuritySettingsFormValues {
  emailNotifications: boolean;
  smsNotifications: boolean;
  theme: ThemeMode;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface SettingsBundle {
  general: GeneralSettingsFormValues;
  businessHours: BusinessHourRow[];
  membershipPlans: MembershipPlan[];
  payments: PaymentsSettingsFormValues;
  security: SecuritySettingsFormValues;
}
