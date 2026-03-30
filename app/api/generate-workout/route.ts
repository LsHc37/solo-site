import { NextResponse } from "next/server";
import { buildWorkoutSystemPrompt } from "@/lib/workout-system-prompt";
import { FinalWorkoutPlanSchema, MasterWorkoutLibraryOnlySchema } from "@/lib/validations/workoutPlanSchema";

interface OllamaGenerateResponse {
  response?: string;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

function extractPromptDemographics(prompt: string): { age: number | null; weightLbs: number | null } {
  const ageMatch =
    prompt.match(/\bi\s*am\s*(\d{1,2})\b/i) ||
    prompt.match(/\b(\d{1,2})\s*(?:years?\s*old|yo|y\/o)\b/i);

  const lbsMatch = prompt.match(/\b(\d{2,3})\s*(?:lbs?|pounds?)\b/i);
  const kgMatch = prompt.match(/\b(\d{2,3})\s*(?:kg|kgs|kilograms?)\b/i);

  const age = ageMatch ? Number(ageMatch[1]) : null;
  const weightLbs = lbsMatch
    ? Number(lbsMatch[1])
    : kgMatch
      ? Math.round(Number(kgMatch[1]) * 2.20462)
      : null;

  return { age, weightLbs };
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userInput?: string; prompt?: string };
    const userInput = body?.prompt?.trim() || body?.userInput?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const { age: extractedAge, weightLbs: extractedWeight } = extractPromptDemographics(userInput);
    const extractedExperienceLevel = extractExperienceLevel(userInput);

    if (extractedWeight === null) {
      return NextResponse.json(
        { error: "Could not extract weight from prompt. Include values like '120 lbs'." },
        { status: 422 },
      );
    }

    if (extractedAge === null) {
      return NextResponse.json(
        { error: "Could not extract age from prompt. Include values like '14 years old'." },
        { status: 422 },
      );
    }

    const extractedGender = extractGender(userInput);
    const macros = calculateMacros(extractedAge, extractedWeight, extractedExperienceLevel);

    const systemPrompt = buildWorkoutSystemPrompt({
      extractedAge,
      extractedWeight,
      extractedExperienceLevel,
      userPrompt: userInput,
    });

    const prompt = [
      `You are generating a workout for a ${extractedAge} year old who weighs ${extractedWeight} lbs. Their experience level is: ${userInput}. Because they are young/beginner, you MUST limit RPE to 6-7 and use foundational exercises.`,
      "Return only a JSON object containing master_workout_library.",
      "Do not include meta, user_profile, or macros.",
      "Original user input:",
      userInput,
    ].join("\n\n");

    const aiResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5-coder",
        system: systemPrompt,
        prompt,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: `AI request failed with status ${aiResponse.status}` },
        { status: 502 },
      );
    }

    const raw = (await aiResponse.json()) as OllamaGenerateResponse;
    const content = raw.response?.trim();

    if (!content) {
      return NextResponse.json({ error: "AI returned empty content" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 502 });
    }

    const aiPayload = Array.isArray(parsed) ? { master_workout_library: parsed } : parsed;

    const validatedLibrary = MasterWorkoutLibraryOnlySchema.safeParse(aiPayload);
    if (!validatedLibrary.success) {
      return NextResponse.json(
        {
          error: "AI workout library failed schema validation",
          issues: validatedLibrary.error.issues,
        },
        { status: 422 },
      );
    }

    const normalizedLibrary =
      extractedExperienceLevel === "beginner"
        ? clampBeginnerRpe(validatedLibrary.data)
        : validatedLibrary.data;

    const finalPayload = {
      meta: {
        generated_at: new Date().toISOString(),
        model: "qwen2.5-coder",
        source_prompt: userInput,
      },
      user_profile: {
        age: extractedAge,
        weight: extractedWeight,
        gender: extractedGender,
        experience_level: extractedExperienceLevel,
      },
      macros,
      master_workout_library: normalizedLibrary.master_workout_library,
    };

    const revalidated = FinalWorkoutPlanSchema.safeParse(finalPayload);
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
