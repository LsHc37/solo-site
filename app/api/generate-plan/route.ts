import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a strict, data-driven Life OS compiler. Read the user input and output ONLY valid JSON. 
CRITICAL RULES:
1. TO-DOS: No vague advice. To-dos MUST have exact numbers or times (e.g., 'Drink 128oz water').
2. GOALS: The 'target' must be a specific, trackable number.
3. Output strict JSON matching the schema (user_profile with macros, and injections with todos, goals, and alarms). No markdown.`;

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
    });

    const rawJson = completion.choices[0].message.content;
    if (!rawJson) throw new Error("No response from AI");
    
    const parsedData = JSON.parse(rawJson);
    
    // Inject the default workout library as requested
    if (!parsedData.injections) parsedData.injections = {};
    parsedData.injections.master_workout_library = [
      { name: "Upper Body Strength A", duration_minutes: 45, focus: "push_pull" },
      { name: "Lower Body Power B", duration_minutes: 50, focus: "legs_glutes" },
      { name: "Conditioning Circuit C", duration_minutes: 30, focus: "cardio_core" }
    ];

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
