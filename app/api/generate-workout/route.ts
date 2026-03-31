import { NextResponse } from "next/server";
import { buildWorkoutSystemPrompt } from "@/lib/workout-system-prompt";
import { FinalWorkoutPlanSchema, MasterWorkoutLibraryOnlySchema } from "@/lib/validations/workoutPlanSchema";

interface OllamaGenerateResponse {
  response?: string;
}

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

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

    console.log("🚀🚀🚀 RUNNING NEW CODE! KEY STATUS:", process.env.OPENAI_API_KEY ? "KEY FOUND" : "MISSING KEY");
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Lightning fast model!
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
