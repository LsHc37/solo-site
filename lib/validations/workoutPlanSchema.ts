import { z } from "zod";

const WorkoutExerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
});

const WorkoutDaySchema = z.object({
  day: z.string(),
  focus: z.string(),
  exercises: z.array(WorkoutExerciseSchema).min(1),
});

export const WorkoutPlanSchema = z.object({
  user_profile: z.object({
    age: z.number(),
    weight: z.number(),
    gender: z.string(),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  }),
  macros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbohydrates: z.number().optional(),
    fats: z.number().optional(),
  }),
  program: z.object({
    days_per_week: z.number(),
    workouts: z.array(WorkoutDaySchema).min(1),
  }),
});

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;
