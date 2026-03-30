import { z } from "zod";

const WorkoutExerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rpe: z.number().min(1).max(10),
  notes: z.string().optional(),
});

const MasterWorkoutLibraryItemSchema = z.object({
  name: z.string(),
  focus: z.string(),
  equipment: z.string().optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1),
});

export const MasterWorkoutLibraryOnlySchema = z.object({
  master_workout_library: z.array(MasterWorkoutLibraryItemSchema).min(1),
});

export const FinalWorkoutPlanSchema = z.object({
  meta: z.object({
    generated_at: z.string(),
    model: z.string(),
    source_prompt: z.string(),
  }),
  user_profile: z.object({
    age: z.number(),
    weight: z.number(),
    gender: z.string(),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  }),
  macros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbohydrates: z.number(),
    fats: z.number(),
  }),
  master_workout_library: z.array(MasterWorkoutLibraryItemSchema).min(1),
});

export type MasterWorkoutLibraryOnly = z.infer<typeof MasterWorkoutLibraryOnlySchema>;
export type FinalWorkoutPlan = z.infer<typeof FinalWorkoutPlanSchema>;
