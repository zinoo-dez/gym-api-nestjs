import { z } from "zod";

export const classSchema = z
  .object({
    name: z
      .string()
      .min(1, "Class name is required")
      .max(100, "Class name must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    trainerId: z.string().min(1, "Trainer is required"),
    startTime: z
      .string()
      .min(1, "Start time is required")
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Invalid start time"),
    endTime: z
      .string()
      .min(1, "End time is required")
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Invalid end time"),
    capacity: z
      .number()
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .max(100, "Capacity cannot exceed 100"),
    status: z
      .enum(["scheduled", "ongoing", "completed", "cancelled"])
      .optional()
      .default("scheduled"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );
