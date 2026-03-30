import { NextResponse } from "next/server";
import { buildWorkoutSystemPrompt } from "@/lib/workout-system-prompt";
import { WorkoutPlanSchema } from "@/lib/validations/workoutPlanSchema";

interface OllamaGenerateResponse {
  response?: string;
}

function extractAge(text: string): number | null {
  const explicitAge = text.match(/\b(\d{1,2})\s*(?:years?\s*old|yo|y\/o)\b/i);
  if (explicitAge) return Number(explicitAge[1]);

  const iAmAge = text.match(/\bi\s*am\s*(\d{1,2})\b/i);
  if (iAmAge) return Number(iAmAge[1]);

  return null;
}

function extractWeight(text: string): number | null {
  const lbs = text.match(/\b(\d{2,3})\s*(?:lbs?|pounds?)\b/i);
  if (lbs) return Number(lbs[1]);

  const kg = text.match(/\b(\d{2,3})\s*(?:kg|kgs|kilograms?)\b/i);
  if (kg) {
    const kgValue = Number(kg[1]);
    return Math.round(kgValue * 2.20462);
  }

  return null;
}

function extractExperienceLevel(text: string): "beginner" | "intermediate" | "advanced" | "unknown" {
  if (/\b(beginner|new to lifting|just starting|never been to the gym|don't really workout|do not really workout)\b/i.test(text)) {
    return "beginner";
  }
  if (/\b(advanced|elite|powerlifting|competitive|high volume|heavy barbell)\b/i.test(text)) {
    return "advanced";
  }
  if (/\b(intermediate|some experience|trained for|lifting for)\b/i.test(text)) {
    return "intermediate";
  }
  return "unknown";
}

function clampBeginnerRpe(output: unknown): unknown {
  if (!output || typeof output !== "object") return output;
  const root = output as { program?: { workouts?: Array<{ exercises?: Array<{ rpe?: number }> }> } };
  if (!root.program?.workouts) return output;

  for (const workout of root.program.workouts) {
    if (!workout.exercises) continue;
    for (const exercise of workout.exercises) {
      if (typeof exercise.rpe === "number" && exercise.rpe > 7) {
        exercise.rpe = 7;
      }
    }
  }

  return root;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userInput?: string };
    const userInput = body?.userInput?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing userInput" }, { status: 400 });
    }

    const extractedAge = extractAge(userInput);
    const extractedWeight = extractWeight(userInput);
    const extractedExperienceLevel = extractExperienceLevel(userInput);

    const systemPrompt = buildWorkoutSystemPrompt({
      extractedAge,
      extractedWeight,
      extractedExperienceLevel,
    });

    const prompt = [
      "Generate a personalized workout plan JSON that matches the required structure.",
      `You are generating for a ${extractedAge ?? "unknown"} year old user at approximately ${extractedWeight ?? "unknown"} lbs with experience level ${extractedExperienceLevel}.`,
      "Infer and output user_profile.age, user_profile.weight, user_profile.gender, and user_profile.experience_level directly from the user input.",
      "Respect beginner safeguards and dynamic macro calculations.",
      "User input:",
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

    const validated = WorkoutPlanSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "AI JSON failed schema validation",
          issues: validated.error.issues,
        },
        { status: 422 },
      );
    }

    const forcedUserProfile = {
      ...validated.data.user_profile,
      age: extractedAge ?? validated.data.user_profile.age,
      weight: extractedWeight ?? validated.data.user_profile.weight,
      experience_level:
        extractedExperienceLevel === "unknown"
          ? validated.data.user_profile.experience_level
          : extractedExperienceLevel,
    };

    const merged = {
      ...validated.data,
      user_profile: forcedUserProfile,
    };

    const normalized =
      merged.user_profile.experience_level === "beginner"
        ? (clampBeginnerRpe(merged) as typeof merged)
        : merged;

    const revalidated = WorkoutPlanSchema.safeParse(normalized);
    if (!revalidated.success) {
      return NextResponse.json(
        {
          error: "Normalized workout JSON failed schema validation",
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
