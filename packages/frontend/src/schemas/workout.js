import { z } from "zod";

const exerciseSchema = z.object({
  name: z
    .string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  sets: z
    .number()
    .int("Sets must be a whole number")
    .min(1, "Sets must be at least 1")
    .max(20, "Sets cannot exceed 20"),
  reps: z
    .number()
    .int("Reps must be a whole number")
    .min(1, "Reps must be at least 1")
    .max(100, "Reps cannot exceed 100"),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(0, "Duration must be a positive number")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export const workoutPlanSchema = z
  .object({
    name: z
      .string()
      .min(1, "Workout plan name is required")
      .max(100, "Workout plan name must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    trainerId: z.string().min(1, "Trainer is required"),
    memberId: z.string().min(1, "Member is required"),
    exercises: z
      .array(exerciseSchema)
      .min(1, "At least one exercise is required"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Invalid start date"),
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
      }, "Invalid end date"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );
