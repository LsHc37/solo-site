import { z } from "zod";

const PrefixedId = (prefix: string) => z.string().regex(new RegExp(`^${prefix}_[a-f0-9]{8}$`));

export const MacrosSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbohydrates: z.number(),
  fats: z.number(),
});

export const TodoSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  frequency: z.string().default("daily"),
  target: z.string(),
});

export const GoalSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  metric: z.string(),
  target: z.string(),
});

export const AlarmSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  time: z.string(),
  note: z.string(),
});

export const MealPlanSchema = z.object({
  id: z.string().min(1),
  meal: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  ingredients: z.array(z.string()).min(1),
  macros: MacrosSchema,
});

export const WorkoutExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rpe: z.number().min(1).max(10),
  rest_seconds: z.number().int().positive(),
  notes: z.string().optional(),
});

export const InjectionsSchema = z.object({
  todos: z.array(TodoSchema).length(3),
  goals: z.array(GoalSchema).length(2),
  alarms: z.array(AlarmSchema).length(2),
});

const MasterWorkoutLibraryItemSchema = z.object({
  id: PrefixedId("wk"),
  week: z.number().int().min(1).max(4),
  name: z.string(),
  focus: z.string(),
  equipment: z.string().optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1),
});

export const FinalWorkoutPlanSchema = z.object({
  meta: z.object({
    version: z.literal("3.1"),
    engine: z.literal("RetroGigz Master AI"),
    program_length_weeks: z.literal(4),
    generated_at: z.string(),
    model: z.string(),
    source_prompt: z.string(),
  }),
  user_profile: z.object({
    age: z.number(),
    weight: z.number(),
    gender: z.string(),
    macros: MacrosSchema,
  }),
  injections: InjectionsSchema,
  meal_plans: z.array(MealPlanSchema).length(4),
  master_workout_library: z.array(MasterWorkoutLibraryItemSchema).min(1),
  master_workout_library_requires_pro: z.literal(true),
});

export const RetroGigzWorkoutPlanSchema = FinalWorkoutPlanSchema;

export type RetroGigzWorkoutPlan = z.infer<typeof RetroGigzWorkoutPlanSchema>;
export type FinalWorkoutPlan = z.infer<typeof FinalWorkoutPlanSchema>;
export type Todo = z.infer<typeof TodoSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type Alarm = z.infer<typeof AlarmSchema>;
export type MealPlan = z.infer<typeof MealPlanSchema>;
