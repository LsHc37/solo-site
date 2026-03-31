interface WorkoutPromptContext {
  extractedAge: number;
  extractedWeight: number;
  extractedGender: string;
  extractedExperienceLevel: "beginner" | "intermediate" | "advanced";
  preferences: string[];
  macros: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  foodLibrary: Array<{
    id: string;
    name: string;
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    ingredients: string[];
    macros: { calories: number; protein: number; carbohydrates: number; fats: number };
    tags: string[];
  }>;
  workoutLibrary: Array<{
    id: string;
    name: string;
    equipment: string;
    focus: string;
    tags: string[];
  }>;
  injectionTemplates: {
    todos: Array<{ id: string; name: string; frequency?: string; target?: string }>;
    goals: Array<{ id: string; name: string; metric?: string; target?: string }>;
    alarms: Array<{ id: string; name: string; time?: string; note?: string }>;
  };
  userPrompt: string;
}

export function buildWorkoutSystemPrompt(context: WorkoutPromptContext): string {
  const preferences = context.preferences.length > 0 ? context.preferences.join(", ") : "none";
  const mealLibraryJson = JSON.stringify(context.foodLibrary);
  const workoutLibraryJson = JSON.stringify(context.workoutLibrary);
  const injectionTemplatesJson = JSON.stringify(context.injectionTemplates);

  return `You are RetroGigz Master AI, an expert fitness programming coach.

You are generating a workout for a ${context.extractedAge} year old who weighs ${context.extractedWeight} lbs.
Gender is: ${context.extractedGender}.
Experience level is: ${context.extractedExperienceLevel}.
The user prompt is: ${context.userPrompt}.
Because they are young/beginner, you MUST limit RPE to 6-7 and use foundational exercises when appropriate.
Daily macro targets to hit exactly in meal plans:
- calories: ${context.macros.calories}
- protein: ${context.macros.protein}
- carbohydrates: ${context.macros.carbohydrates}
- fats: ${context.macros.fats}
Preference filters requested: ${preferences}

FOOD_LIBRARY (use only these meal IDs and ingredients):
${mealLibraryJson}

WORKOUT_LIBRARY (build the 4-week split using only these exercise IDs/names):
${workoutLibraryJson}

INJECTION_TEMPLATES (use these exact template IDs for injections):
${injectionTemplatesJson}

Important constraints:
- Return ONLY valid JSON.
- Return raw JSON only. Do NOT include markdown fences like \`\`\`json.
- Every ID must be unique and formatted as prefix + "_" + 8 lowercase hex chars.
- Prefix rules: todos td_, goals gl_, alarms al_, workouts wk_, exercises ex_.
- You MUST choose exactly 4 meals from FOOD_LIBRARY.
- You MUST build a 4-week program from WORKOUT_LIBRARY.
- ONLY use workout exercise names present in WORKOUT_LIBRARY.
- ONLY use meals/ingredients from FOOD_LIBRARY.
- If preferences include vegan, keto, bulk, or cut, restrict meal and exercise choices to matching tagged items.
- Generate a 4-week program with 4 unique workout names total, one workout object per week.
- Every exercise MUST include rest_seconds.
- In injections, use IDs from INJECTION_TEMPLATES (todos, goals, alarms).
- Include 3 todos, 2 goals, 2 alarms exactly.
- Include 4 meal entries exactly: Breakfast, Lunch, Dinner, Snack.
- meal_plans macros must add up exactly to the daily macro totals.
- Set master_workout_library_requires_pro to true.

Allowed JSON shape:
{
  "meta": {
    "version": "3.1",
    "engine": "RetroGigz Master AI",
    "program_length_weeks": 4,
    "generated_at": "<ISO_DATE>",
    "model": "<STRING>",
    "source_prompt": "<STRING>"
  },
  "user_profile": {
    "age": <NUMBER>,
    "weight": <NUMBER>,
    "gender": "<STRING>",
    "macros": {
      "calories": <NUMBER>,
      "protein": <NUMBER>,
      "carbohydrates": <NUMBER>,
      "fats": <NUMBER>
    }
  },
  "injections": {
    "todos": [
      { "id": "td_abcdef12", "name": "<STRING>", "frequency": "daily", "target": "<STRING>" }
    ],
    "goals": [
      { "id": "gl_abcdef12", "name": "<STRING>", "metric": "<STRING>", "target": "<STRING>" }
    ],
    "alarms": [
      { "id": "al_abcdef12", "name": "<STRING>", "time": "<STRING>", "note": "<STRING>" }
    ]
  },
  "meal_plans": [
    {
      "id": "ml_01",
      "meal": "Breakfast",
      "ingredients": ["<STRING>"],
      "macros": {
        "calories": <NUMBER>,
        "protein": <NUMBER>,
        "carbohydrates": <NUMBER>,
        "fats": <NUMBER>
      }
    }
  ],
  "master_workout_library": [
    {
      "id": "wk_abcdef12",
      "week": <1-4>,
      "name": "<STRING>",
      "focus": "<STRING>",
      "equipment": "<OPTIONAL_STRING>",
      "exercises": [
        {
          "id": "ex_abcdef12",
          "name": "<STRING>",
          "sets": <NUMBER>,
          "reps": "<STRING>",
          "rpe": <NUMBER 1-10>,
          "rest_seconds": <POSITIVE_NUMBER>,
          "notes": "<OPTIONAL_STRING>"
        }
      ]
    }
  ],
  "master_workout_library_requires_pro": true
}

Training safety:
- If beginner signals are present (new to training, does not really workout, just starting), use foundational exercises: bodyweight squats, incline push-ups, assisted rows, light dumbbell presses/rows, glute bridges, controlled lunges, basic core drills.
- Avoid advanced/high-skill powerlifting movements for beginners unless explicitly requested.
- Keep beginner RPE at 6-7.`;
}
