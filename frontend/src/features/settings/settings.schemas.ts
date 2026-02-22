import { z } from "zod";

import { BUSINESS_DAY_IDS } from "./settings.constants";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^https?:\/\/.+/i.test(value),
    "Use a valid URL starting with http:// or https://",
  );

export const generalSettingsSchema = z.object({
  gymName: z.string().trim().min(2, "Gym name must be at least 2 characters."),
  logo: z.string().trim(),
  contactEmail: z.string().trim().email("Enter a valid contact email."),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits."),
  address: z.string().trim().min(5, "Address must be at least 5 characters."),
  tagLine: z.string().trim().max(120, "Tagline must be 120 characters or less."),
  description: z.string().trim().max(500, "Description must be 500 characters or less."),
  socialLinks: z.object({
    website: optionalUrlSchema,
    facebook: optionalUrlSchema,
    instagram: optionalUrlSchema,
    twitter: optionalUrlSchema,
  }),
});

const businessHourSchema = z
  .object({
    day: z.enum(BUSINESS_DAY_IDS),
    openTime: z.string().regex(TIME_PATTERN, "Use HH:mm format."),
    closeTime: z.string().regex(TIME_PATTERN, "Use HH:mm format."),
    closed: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.closed) {
      return;
    }

    if (value.openTime >= value.closeTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Closing time must be later than opening time.",
        path: ["closeTime"],
      });
    }
  });

export const businessHoursSchema = z.object({
  hours: z.array(businessHourSchema).length(7, "All seven days are required."),
});

export const membershipPlanEditorSchema = z.object({
  name: z.string().trim().min(2, "Plan name must be at least 2 characters."),
  price: z
    .number()
    .finite("Plan price is required.")
    .min(0, "Plan price cannot be negative."),
  duration: z.enum(["MONTHLY", "YEARLY"]),
  features: z
    .array(
      z.object({
        value: z.string().trim().min(1, "Feature cannot be empty."),
      }),
    )
    .min(1, "At least one feature is required."),
});

export const paymentsSettingsSchema = z.object({
  currency: z.string().trim().min(3, "Currency is required.").max(3, "Use a 3-letter currency code."),
  taxPercentage: z
    .number()
    .finite("Tax percentage is required.")
    .min(0, "Tax cannot be negative.")
    .max(100, "Tax cannot exceed 100%"),
  stripePublicKey: z.string().trim(),
  stripeSecretKey: z.string().trim(),
  paypalClientId: z.string().trim(),
  paypalSecret: z.string().trim(),
});

export const securitySettingsSchema = z
  .object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    theme: z.enum(["light", "dark"]),
    currentPassword: z.string().trim(),
    newPassword: z.string().trim(),
    confirmNewPassword: z.string().trim(),
  })
  .superRefine((value, context) => {
    const hasPasswordChangeInput =
      value.currentPassword.length > 0 ||
      value.newPassword.length > 0 ||
      value.confirmNewPassword.length > 0;

    if (!hasPasswordChangeInput) {
      return;
    }

    if (value.currentPassword.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current password is required.",
        path: ["currentPassword"],
      });
    }

    if (value.newPassword.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password is required.",
        path: ["newPassword"],
      });
      return;
    }

    if (value.newPassword.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be at least 8 characters.",
        path: ["newPassword"],
      });
    }

    if (value.newPassword !== value.confirmNewPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password confirmation does not match.",
        path: ["confirmNewPassword"],
      });
    }
  });

export type MembershipPlanEditorFormValues = z.infer<typeof membershipPlanEditorSchema>;
