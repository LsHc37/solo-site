import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildWorkoutSystemPrompt } from "@/lib/workout-system-prompt";
import { RetroGigzWorkoutPlanSchema } from "@/lib/validations/workoutPlanSchema";
import { FOOD_LIBRARY, WORKOUT_LIBRARY, INJECTION_TEMPLATES, type LibraryMeal, type LibraryExercise } from "@/lib/libraries";

interface OllamaGenerateResponse {
  response?: string;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type IdPrefix = "td" | "gl" | "al" | "wk" | "ex";
type Preference = "vegan" | "keto" | "bulk" | "cut";

function extractPromptDemographics(prompt: string): { age: number; weightLbs: number; extractedNumbers: number[] } {
  const extractedNumbers = (prompt.match(/\d+(?:\.\d+)?/g) ?? [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const ageMatch =
    prompt.match(/\bi\s*am\s*(\d{1,2})\b/i) ||
    prompt.match(/\b(\d{1,2})\s*(?:years?\s*old|yo|y\/o)\b/i);

  const lbsMatch = prompt.match(/\b(\d{2,3}(?:\.\d+)?)\s*(?:lbs?|pounds?)\b/i);
  const kgMatch = prompt.match(/\b(\d{2,3}(?:\.\d+)?)\s*(?:kg|kgs|kilograms?)\b/i);

  let age = ageMatch ? Math.round(Number(ageMatch[1])) : null;
  let weightLbs = lbsMatch
    ? Math.round(Number(lbsMatch[1]))
    : kgMatch
      ? Math.round(Number(kgMatch[1]) * 2.20462)
      : null;

  const numbersUnder100 = extractedNumbers.filter((value) => value > 0 && value < 100);
  const numbersOver90 = extractedNumbers.filter((value) => value > 90 && value < 1000);

  // Heuristic fallback: smaller number under 100 is likely age.
  if (age === null && numbersUnder100.length > 0) {
    age = Math.round(Math.min(...numbersUnder100));
  }

  // Heuristic fallback: larger number over 90 is likely weight in lbs.
  if (weightLbs === null && numbersOver90.length > 0) {
    weightLbs = Math.round(Math.max(...numbersOver90));
  }

  // Single-number fallback: use the only number as age or weight based on range.
  if (extractedNumbers.length === 1) {
    const onlyNumber = extractedNumbers[0];
    if (age === null && onlyNumber > 0 && onlyNumber < 100) {
      age = Math.round(onlyNumber);
    }
    if (weightLbs === null && onlyNumber > 90 && onlyNumber < 1000) {
      weightLbs = Math.round(onlyNumber);
    }
  }

  // Hard safety defaults so extraction never crashes downstream calculations.
  if (age === null || age <= 0 || age >= 100) {
    age = 25;
  }
  if (weightLbs === null || weightLbs <= 0 || weightLbs >= 1000) {
    weightLbs = 150;
  }

  return { age, weightLbs, extractedNumbers };
}

function extractGender(text: string): string {
  if (/\bmale\b/i.test(text)) return "male";
  if (/\bfemale\b/i.test(text)) return "female";
  if (/\bnon[-\s]?binary\b/i.test(text)) return "non-binary";
  return "unspecified";
}

function extractExperienceLevel(text: string): ExperienceLevel {
  if (/\b(beginner|new to lifting|just starting|never been to the gym|don't really workout|do not really workout)\b/i.test(text)) {
    return "beginner";
  }
  if (/\b(advanced|elite|powerlifting|competitive|high volume|heavy barbell)\b/i.test(text)) {
    return "advanced";
  }
  if (/\b(intermediate|some experience|trained for|lifting for)\b/i.test(text)) {
    return "intermediate";
  }
  return "beginner";
}

function clampBeginnerRpe(output: { master_workout_library: Array<{ exercises: Array<{ rpe: number }> }> }) {
  for (const workout of output.master_workout_library) {
    if (!workout.exercises) continue;
    for (const exercise of workout.exercises) {
      if (typeof exercise.rpe === "number" && exercise.rpe > 7) {
        exercise.rpe = 7;
      }
    }
  }

  return output;
}

function calculateMacros(age: number, weightLbs: number, experienceLevel: ExperienceLevel) {
  const ageFactor = age < 16 ? 13.5 : 14.5;
  const experienceFactor = experienceLevel === "advanced" ? 16 : experienceLevel === "intermediate" ? 15 : 14;
  const calorieMultiplier = Math.round((ageFactor + experienceFactor) / 2);
  const calories = Math.round(weightLbs * calorieMultiplier);

  const proteinPerLb = age < 16 ? 0.82 : 0.9;
  const fatPerLb = 0.3;

  const protein = Math.round(weightLbs * proteinPerLb);
  const fats = Math.round(weightLbs * fatPerLb);
  const caloriesFromProtein = protein * 4;
  const caloriesFromFats = fats * 9;
  const carbs = Math.max(0, Math.round((calories - caloriesFromProtein - caloriesFromFats) / 4));

  return {
    calories,
    protein,
    carbohydrates: carbs,
    fats,
  };
}

function extractPreferences(text: string): Preference[] {
  const preferences: Preference[] = [];
  if (/\bvegan\b/i.test(text)) preferences.push("vegan");
  if (/\bketo\b/i.test(text)) preferences.push("keto");
  if (/\bbulk|bulking|mass\b/i.test(text)) preferences.push("bulk");
  if (/\bcut|cutting|fat\s*loss\b/i.test(text)) preferences.push("cut");
  return preferences;
}

function hasAllTags(tags: string[], required: Preference[]) {
  return required.every((requiredTag) => tags.includes(requiredTag));
}

function filterMealLibraryByPreferences(preferences: Preference[]) {
  if (preferences.length === 0) return FOOD_LIBRARY;
  const filtered = FOOD_LIBRARY.filter((meal) => hasAllTags(meal.tags, preferences));
  return filtered.length > 0 ? filtered : FOOD_LIBRARY;
}

function filterExerciseLibraryByPreferences(preferences: Preference[]) {
  if (preferences.length === 0) return WORKOUT_LIBRARY;
  const filtered = WORKOUT_LIBRARY.filter((exercise) => hasAllTags(exercise.tags, preferences));
  return filtered.length > 0 ? filtered : WORKOUT_LIBRARY;
}

function isValidPrefixedId(value: unknown, prefix: IdPrefix): value is string {
  return typeof value === "string" && new RegExp(`^${prefix}_[a-f0-9]{8}$`).test(value);
}

function createIdGenerator() {
  const usedIds = new Set<string>();
  return (prefix: IdPrefix, preferredId?: unknown) => {
    if (isValidPrefixedId(preferredId, prefix) && !usedIds.has(preferredId)) {
      usedIds.add(preferredId);
      return preferredId;
    }

    let generated = "";
    do {
      generated = `${prefix}_${randomBytes(4).toString("hex")}`;
    } while (usedIds.has(generated));
    usedIds.add(generated);
    return generated;
  };
}

function splitTotal(total: number, ratios: number[]) {
  const normalizedRatios = ratios.map((ratio) => ratio / ratios.reduce((sum, value) => sum + value, 0));
  const buckets = normalizedRatios.map((ratio) => Math.floor(total * ratio));
  let remainder = total - buckets.reduce((sum, value) => sum + value, 0);
  let index = 0;

  while (remainder > 0) {
    buckets[index % buckets.length] += 1;
    remainder -= 1;
    index += 1;
  }

  return buckets;
}

function pickMealByType(
  meals: LibraryMeal[],
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack",
  target: { calories: number; protein: number; carbohydrates: number; fats: number },
) {
  const candidates = meals.filter((meal) => meal.mealType === mealType);
  const pool = candidates.length > 0 ? candidates : FOOD_LIBRARY.filter((meal) => meal.mealType === mealType);

  return pool
    .map((meal) => {
      const score =
        Math.abs(meal.macros.calories - target.calories) +
        Math.abs(meal.macros.protein - target.protein) * 4 +
        Math.abs(meal.macros.carbohydrates - target.carbohydrates) * 2 +
        Math.abs(meal.macros.fats - target.fats) * 3;
      return { meal, score };
    })
    .sort((a, b) => a.score - b.score)[0]?.meal;
}

function buildMealPlans(
  macros: { calories: number; protein: number; carbohydrates: number; fats: number },
  mealLibrary: LibraryMeal[],
) {
  const caloriesSplit = splitTotal(macros.calories, [0.3, 0.3, 0.3, 0.1]);
  const proteinSplit = splitTotal(macros.protein, [0.3, 0.3, 0.3, 0.1]);
  const carbSplit = splitTotal(macros.carbohydrates, [0.3, 0.3, 0.3, 0.1]);
  const fatSplit = splitTotal(macros.fats, [0.3, 0.3, 0.3, 0.1]);

  const selectedMeals = [
    pickMealByType(mealLibrary, "Breakfast", { calories: caloriesSplit[0], protein: proteinSplit[0], carbohydrates: carbSplit[0], fats: fatSplit[0] }),
    pickMealByType(mealLibrary, "Lunch", { calories: caloriesSplit[1], protein: proteinSplit[1], carbohydrates: carbSplit[1], fats: fatSplit[1] }),
    pickMealByType(mealLibrary, "Dinner", { calories: caloriesSplit[2], protein: proteinSplit[2], carbohydrates: carbSplit[2], fats: fatSplit[2] }),
    pickMealByType(mealLibrary, "Snack", { calories: caloriesSplit[3], protein: proteinSplit[3], carbohydrates: carbSplit[3], fats: fatSplit[3] }),
  ];

  return [
    {
      id: selectedMeals[0]?.id ?? "ml_breakfast_fallback",
      meal: "Breakfast" as const,
      ingredients: selectedMeals[0]?.ingredients ?? ["Oats", "Protein source", "Fruit"],
      macros: {
        calories: caloriesSplit[0],
        protein: proteinSplit[0],
        carbohydrates: carbSplit[0],
        fats: fatSplit[0],
      },
    },
    {
      id: selectedMeals[1]?.id ?? "ml_lunch_fallback",
      meal: "Lunch" as const,
      ingredients: selectedMeals[1]?.ingredients ?? ["Lean protein", "Complex carbs", "Vegetables"],
      macros: {
        calories: caloriesSplit[1],
        protein: proteinSplit[1],
        carbohydrates: carbSplit[1],
        fats: fatSplit[1],
      },
    },
    {
      id: selectedMeals[2]?.id ?? "ml_dinner_fallback",
      meal: "Dinner" as const,
      ingredients: selectedMeals[2]?.ingredients ?? ["Protein", "Carb source", "Healthy fat"],
      macros: {
        calories: caloriesSplit[2],
        protein: proteinSplit[2],
        carbohydrates: carbSplit[2],
        fats: fatSplit[2],
      },
    },
    {
      id: selectedMeals[3]?.id ?? "ml_snack_fallback",
      meal: "Snack" as const,
      ingredients: selectedMeals[3]?.ingredients ?? ["Yogurt or shake", "Fruit", "Nuts"],
      macros: {
        calories: caloriesSplit[3],
        protein: proteinSplit[3],
        carbohydrates: carbSplit[3],
        fats: fatSplit[3],
      },
    },
  ];
}

function buildInjections(weightLbs: number) {
  const targetWeightTemplate = INJECTION_TEMPLATES.goals.find((goal) => goal.name === "Target Weight");
  const targetWeightValue = targetWeightTemplate?.target?.replace("{weight_lbs}", String(weightLbs)) ?? String(weightLbs);

  return {
    todos: INJECTION_TEMPLATES.todos.map((todo) => ({
      id: todo.id,
      name: todo.name,
      frequency: todo.frequency ?? "daily",
      target: todo.target ?? "Complete daily",
    })),
    goals: INJECTION_TEMPLATES.goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      metric: goal.metric ?? "value",
      target: goal.name === "Target Weight" ? targetWeightValue : (goal.target ?? "100"),
    })),
    alarms: INJECTION_TEMPLATES.alarms.map((alarm) => ({
      id: alarm.id,
      name: alarm.name,
      time: alarm.time ?? "08:00",
      note: alarm.note ?? "Reminder",
    })),
  };
}

function normalizeWorkoutLibrary(
  rawWorkouts: unknown,
  makeId: (prefix: IdPrefix, preferredId?: unknown) => string,
  isBeginner: boolean,
  exerciseLibrary: LibraryExercise[],
) {
  const source = Array.isArray(rawWorkouts) ? rawWorkouts : [];
  const allowedExerciseNames = new Set(exerciseLibrary.map((exercise) => exercise.name));
  const exerciseFallbacks = exerciseLibrary.length > 0 ? exerciseLibrary : WORKOUT_LIBRARY;
  const fallbackNames = [
    "Powerbuilding Full Body Blast",
    "Engine Builder Strength Circuit",
    "Athletic Hypertrophy Forge",
    "Performance Conditioning Reload",
  ];
  const usedNames = new Set<string>();

  return Array.from({ length: 4 }, (_, index) => {
    const item = (source[index] ?? {}) as {
      id?: unknown;
      week?: unknown;
      name?: unknown;
      focus?: unknown;
      equipment?: unknown;
      exercises?: unknown;
    };

    const baseName = typeof item.name === "string" && item.name.trim().length > 0
      ? item.name.trim()
      : fallbackNames[index];
    const name = usedNames.has(baseName) ? `${baseName} Week ${index + 1}` : baseName;
    usedNames.add(name);

    const exercisesSource = Array.isArray(item.exercises) ? item.exercises : [];
    const fallbackExercises = exerciseFallbacks.slice(0, 4).map((exercise, exerciseIndex) => ({
      name: exercise.name,
      sets: 3,
      reps: exercise.focus === "Conditioning" ? "30-45 sec" : "8-12",
      rpe: 7,
      rest_seconds: exercise.focus === "Conditioning" ? 60 : 90,
      notes: exerciseIndex === 0 ? "Controlled tempo" : undefined,
    }));

    const normalizedExercises = (exercisesSource.length > 0 ? exercisesSource : fallbackExercises).map((exercise) => {
      const sourceExercise = exercise as {
        id?: unknown;
        name?: unknown;
        sets?: unknown;
        reps?: unknown;
        rpe?: unknown;
        rest_seconds?: unknown;
        notes?: unknown;
      };

      const parsedSets = typeof sourceExercise.sets === "number" && Number.isFinite(sourceExercise.sets)
        ? Math.max(1, Math.round(sourceExercise.sets))
        : 3;
      const parsedRpe = typeof sourceExercise.rpe === "number" && Number.isFinite(sourceExercise.rpe)
        ? Math.max(1, Math.min(10, sourceExercise.rpe))
        : 7;
      const cappedRpe = isBeginner ? Math.min(parsedRpe, 7) : parsedRpe;
      const restSeconds = typeof sourceExercise.rest_seconds === "number" && Number.isFinite(sourceExercise.rest_seconds)
        ? Math.max(30, Math.round(sourceExercise.rest_seconds))
        : 75;

      const aiName = typeof sourceExercise.name === "string" && sourceExercise.name.trim().length > 0
        ? sourceExercise.name.trim()
        : "";
      const fallbackExercise = exerciseFallbacks[(index + parsedSets) % exerciseFallbacks.length];
      const safeExerciseName = allowedExerciseNames.has(aiName)
        ? aiName
        : fallbackExercise?.name ?? "Goblet Squat";

      return {
        id: makeId("ex", sourceExercise.id),
        name: safeExerciseName,
        sets: parsedSets,
        reps: typeof sourceExercise.reps === "string" && sourceExercise.reps.trim().length > 0
          ? sourceExercise.reps.trim()
          : "8-12",
        rpe: cappedRpe,
        rest_seconds: restSeconds,
        notes: typeof sourceExercise.notes === "string" ? sourceExercise.notes : undefined,
      };
    });

    return {
      id: makeId("wk", item.id),
      week: index + 1,
      name,
      focus: typeof item.focus === "string" && item.focus.trim().length > 0 ? item.focus.trim() : "Full Body Development",
      equipment: typeof item.equipment === "string" ? item.equipment : "Dumbbells / Bodyweight",
      exercises: normalizedExercises,
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userInput?: string; prompt?: string };
    const userInput = body?.prompt?.trim() || body?.userInput?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const {
      age: extractedAge,
      weightLbs: extractedWeight,
      extractedNumbers,
    } = extractPromptDemographics(userInput);
    const extractedExperienceLevel = extractExperienceLevel(userInput);
    console.log("EXTRACTED DATA:", {
      age: extractedAge,
      weight: extractedWeight,
      numbers: extractedNumbers,
      input: userInput,
    });

    const extractedGender = extractGender(userInput);
    const macros = calculateMacros(extractedAge, extractedWeight, extractedExperienceLevel);
    const preferences = extractPreferences(userInput);
    const filteredMealLibrary = filterMealLibraryByPreferences(preferences);
    const filteredExerciseLibrary = filterExerciseLibraryByPreferences(preferences);

    const systemPrompt = buildWorkoutSystemPrompt({
      extractedAge,
      extractedWeight,
      extractedGender,
      extractedExperienceLevel,
      preferences,
      macros,
      foodLibrary: filteredMealLibrary,
      workoutLibrary: filteredExerciseLibrary,
      injectionTemplates: INJECTION_TEMPLATES,
      userPrompt: userInput,
    });

    const prompt = [
      "Build the complete RetroGigz Master AI v3.1 JSON payload exactly as specified.",
      "The response must include meta, user_profile with nested macros, injections, meal_plans, master_workout_library, and master_workout_library_requires_pro=true.",
      "Use unique prefixed IDs for all todos/goals/alarms/workouts/exercises.",
      `Applied user preference filters: ${preferences.length > 0 ? preferences.join(", ") : "none"}.`,
      "Original user input:",
      userInput,
    ].join("\n\n");

    console.log("🚀🚀🚀 RUNNING NEW CODE! KEY STATUS:", process.env.OPENAI_API_KEY ? "KEY FOUND" : "MISSING KEY");
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OPENAI ERROR:", errText);
      return NextResponse.json(
        { error: `OpenAI request failed with status ${aiResponse.status}` },
        { status: 502 },
      );
    }

    const raw = await aiResponse.json();
    let content = raw.choices?.[0]?.message?.content?.trim();

    // ChatGPT sometimes adds markdown block formatting. This safely strips it out so JSON.parse doesn't crash.
    if (content?.startsWith("```json")) {
      content = content.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (content?.startsWith("```")) {
      content = content.replace(/^```/, "").replace(/```$/, "").trim();
    }

    if (!content) {
      return NextResponse.json({ error: "AI returned empty content" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    const aiPayload = (parsed && typeof parsed === "object") ? (parsed as Record<string, unknown>) : {};
    const makeId = createIdGenerator();
    const isBeginner = extractedExperienceLevel === "beginner";
    const normalizedLibrary = normalizeWorkoutLibrary(
      aiPayload.master_workout_library,
      makeId,
      isBeginner,
      filteredExerciseLibrary,
    );

    const libraryWithRpeCap = isBeginner
      ? clampBeginnerRpe({ master_workout_library: normalizedLibrary }).master_workout_library
      : normalizedLibrary;

    const finalPayload = {
      meta: {
        version: "3.1" as const,
        engine: "RetroGigz Master AI" as const,
        program_length_weeks: 4 as const,
        generated_at: new Date().toISOString(),
        model: "gpt-4o-mini",
        source_prompt: userInput,
      },
      user_profile: {
        age: extractedAge,
        weight: extractedWeight,
        gender: extractedGender,
        macros,
      },
      injections: buildInjections(extractedWeight),
      meal_plans: buildMealPlans(macros, filteredMealLibrary),
      master_workout_library: libraryWithRpeCap,
      master_workout_library_requires_pro: true as const,
    };

    const revalidated = RetroGigzWorkoutPlanSchema.safeParse(finalPayload);
    if (!revalidated.success) {
      return NextResponse.json(
        {
          error: "Final workout JSON failed schema validation",
          issues: revalidated.error.issues,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(revalidated.data);
  } catch (error) {
    console.error("POST /api/generate-workout error:", error);
    return NextResponse.json({ error: "Failed to generate workout" }, { status: 500 });
  }
}
