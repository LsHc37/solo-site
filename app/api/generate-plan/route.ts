import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a strict, data-driven Life OS compiler. Read the user input and output ONLY valid JSON. 
CRITICAL RULES:
1. TO-DOS: No vague advice. To-dos MUST have exact numbers or times (e.g., 'Drink 128oz water', 'Eat 50g protein before noon').
2. GOALS: The 'target' must be a specific, trackable number.
3. Output strict JSON matching the schema (user_profile with macros, and injections with todos, goals, and alarms). No markdown.`;

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json();

    if (!userInput) {
      return NextResponse.json(
        { error: "userInput is required" },
        { status: 400 }
      );
    }

    const message = await openai.messages.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    // Extract the response text
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response from the AI
    const aiResponse = JSON.parse(responseText);

    // Add master_workout_library to injections
    const mergedResponse = {
      ...aiResponse,
      injections: {
        ...aiResponse.injections,
        master_workout_library: [],
      },
    };

    return NextResponse.json(mergedResponse);
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}
