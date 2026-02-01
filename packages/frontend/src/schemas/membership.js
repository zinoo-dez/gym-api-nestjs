import { z } from "zod";

export const membershipPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Plan name is required")
    .max(100, "Plan name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  price: z
    .number()
    .min(0, "Price must be a positive number")
    .max(10000, "Price cannot exceed 10,000"),
  durationDays: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 day")
    .max(3650, "Duration cannot exceed 10 years"),
  features: z
    .array(z.string())
    .min(1, "At least one feature is required")
    .optional()
    .default([]),
});

export const assignMembershipSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  membershipPlanId: z.string().min(1, "Membership plan is required"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, "Invalid start date"),
});
