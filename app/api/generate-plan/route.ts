import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a strict, elite sports nutritionist and Life OS compiler. Read the user input and output ONLY valid JSON. 
CRITICAL BIOLOGICAL & MATH RULES:
1. CALORIES & TDEE: NEVER recommend starvation crash diets. For active teenagers/athletes, baseline TDEE is high. A safe fat-loss deficit is strictly 300-500 calories below TDEE (e.g., ~2400+ kcal for an active 160lb male).
2. MACROS: 
   - Protein: Exactly 1g per lb of body weight to protect muscle.
   - Fats: Minimum 0.4g per lb of body weight for hormone health (never drop below 60g for adult/teen males).
   - Carbs: Fill the remaining calories to fuel intense training.
3. TRAINING & RECOVERY: Maximum 5 heavy lifting days. Limit cardio to 2x/week LISS (Low-Intensity Steady State) to avoid overtraining. Mandate 9 hours of sleep.
4. LIFESTYLE: Alarms and schedules must be realistic for someone with school, work, and a social life. Do not schedule arbitrary mid-day tasks.
5. Output strict JSON matching the schema (user_profile with macros, and injections with todos, goals, and alarms). No markdown.`;

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
