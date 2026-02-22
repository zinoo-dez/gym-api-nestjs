import type {
  BusinessHourRow,
  GeneralSettingsFormValues,
  PaymentsSettingsFormValues,
  SecuritySettingsFormValues,
  SettingsTabId,
} from "./settings.types";

export const SETTINGS_TABS: Array<{
  id: SettingsTabId;
  label: string;
  description: string;
}> = [
  {
    id: "general",
    label: "General",
    description: "Gym profile, contact info, branding, and social links.",
  },
  {
    id: "hours",
    label: "Business Hours",
    description: "Opening schedule for each day with closed-day toggles.",
  },
  {
    id: "memberships",
    label: "Memberships",
    description: "Create and manage membership plan tiers.",
  },
  {
    id: "payments",
    label: "Payments",
    description: "Currency, tax, and payment gateway configuration.",
  },
  {
    id: "security",
    label: "Security",
    description: "Notification toggles, theme preference, and password update.",
  },
];

export const BUSINESS_DAY_IDS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const BUSINESS_DAY_LABELS: Record<(typeof BUSINESS_DAY_IDS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_DAY_TIMES: Record<(typeof BUSINESS_DAY_IDS)[number], { open: string; close: string }> = {
  monday: { open: "06:00", close: "22:00" },
  tuesday: { open: "06:00", close: "22:00" },
  wednesday: { open: "06:00", close: "22:00" },
  thursday: { open: "06:00", close: "22:00" },
  friday: { open: "06:00", close: "22:00" },
  saturday: { open: "08:00", close: "20:00" },
  sunday: { open: "08:00", close: "20:00" },
};

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "MMK", label: "MMK - Myanmar Kyat" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
] as const;

export const defaultGeneralSettings: GeneralSettingsFormValues = {
  gymName: "",
  logo: "",
  contactEmail: "",
  phone: "",
  address: "",
  tagLine: "",
  description: "",
  socialLinks: {
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
  },
};

export const createDefaultBusinessHours = (): BusinessHourRow[] => {
  return BUSINESS_DAY_IDS.map((day) => ({
    day,
    openTime: DEFAULT_DAY_TIMES[day].open,
    closeTime: DEFAULT_DAY_TIMES[day].close,
    closed: false,
  }));
};

export const defaultPaymentsSettings: PaymentsSettingsFormValues = {
  currency: "USD",
  taxPercentage: 0,
  stripePublicKey: "",
  stripeSecretKey: "",
  paypalClientId: "",
  paypalSecret: "",
};

export const defaultSecuritySettings: SecuritySettingsFormValues = {
  emailNotifications: true,
  smsNotifications: false,
  theme: "light",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export const UNSAVED_SETTINGS_MESSAGE =
  "You have unsaved settings changes. Leave this page without saving?";
