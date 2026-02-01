import { z } from "zod";

export const memberSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed < new Date();
    }, "Invalid date or date must be in the past"),
  membershipPlanId: z.string().min(1, "Membership plan is required"),
  status: z
    .enum(["active", "inactive", "suspended"])
    .optional()
    .default("active"),
});
