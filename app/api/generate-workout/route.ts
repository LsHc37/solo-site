import { NextResponse } from "next/server";
import { WORKOUT_SYSTEM_PROMPT } from "@/lib/workout-system-prompt";
import { WorkoutPlanSchema } from "@/lib/validations/workoutPlanSchema";

interface OllamaGenerateResponse {
  response?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userInput?: string };
    const userInput = body?.userInput?.trim();

    if (!userInput) {
      return NextResponse.json({ error: "Missing userInput" }, { status: 400 });
    }

    const prompt = [
      "Generate a personalized workout plan JSON that matches the required structure.",
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
        system: WORKOUT_SYSTEM_PROMPT,
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

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error("POST /api/generate-workout error:", error);
    return NextResponse.json({ error: "Failed to generate workout" }, { status: 500 });
  }
}
