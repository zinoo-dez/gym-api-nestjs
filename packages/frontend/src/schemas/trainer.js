import { z } from "zod";

export const trainerSchema = z.object({
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
  specialization: z
    .string()
    .min(1, "Specialization is required")
    .max(100, "Specialization must be less than 100 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});
