import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a strict, elite sports nutritionist and Life OS compiler. Read the user input and output ONLY valid JSON matching the exact schema provided.

CRITICAL BIOLOGICAL & MATH RULES:
1. CALORIES & TDEE: For active teenagers/athletes, baseline TDEE is high. A safe fat-loss deficit is strictly 300-500 calories below TDEE.
2. MACROS: Protein: 1g per lb of body weight. Fats: Minimum 0.4g per lb. Carbs: Fill the rest.
3. TRAINING: Max 5 heavy lifting days. Limit cardio to 2x/week LISS. Mandate 9 hours sleep.

CRITICAL PAYWALL & ORDERING RULES:
1. ORDER MATTERS: Put the 5 most important 'todos' FIRST. Put the 2 most important 'goals' FIRST. 
2. FREE TIER: Set "requiresPro": false for the first 5 todos, first 2 goals, and ALL alarms.
3. PRO TIER: Set "requiresPro": true for any additional todos (6+) and goals (3+), and ALL workouts.
4. Set "master_workout_library_requires_pro": true at the injections level.

EXACT JSON SCHEMA REQUIRED:
{
  "user_profile": {
    "age": (number), "weight": (number), "gender": (string),
    "macros": { "calories": (number), "protein": (number), "carbohydrates": (number), "fats": (number) }
  },
  "injections": {
    "todos": [ { "task": (string), "frequency": (string), "requiresPro": (boolean) } ],
    "goals": [ { "goal": (string), "target": (number), "requiresPro": (boolean) } ],
    "alarms": [ { "time": "HH:MM", "description": (string), "requiresPro": (boolean) } ],
    "master_workout_library": [ { "name": (string), "focus": (string), "requiresPro": true } ],
    "master_workout_library_requires_pro": true
  }
}`;

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
    
    // Safety Fallback: Ensure the workout library exists and is locked
    if (!parsedData.injections) parsedData.injections = {};
    if (!parsedData.injections.master_workout_library) {
      parsedData.injections.master_workout_library = [
        { name: "Upper Body Strength A", focus: "Push / Pull", requiresPro: true },
        { name: "Lower Body Power B", focus: "Legs / Glutes", requiresPro: true }
      ];
      parsedData.injections.master_workout_library_requires_pro = true;
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
