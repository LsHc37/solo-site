import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an elite sports nutritionist. You must output a JSON object that EXACTLY matches the template below. 
DO NOT change key names. DO NOT move blocks. DO NOT omit the requiresPro booleans.

CRITICAL PAYWALL RULES:
- The first 5 'todos' MUST have "requiresPro": false. Any additional todos must have "requiresPro": true.
- The first 2 'goals' MUST have "requiresPro": false. Any additional goals must have "requiresPro": true.
- ALL 'alarms' MUST have "requiresPro": false.
- ALL 'master_workout_library' items MUST have "requiresPro": true.

COPY THIS EXACT TEMPLATE AND FILL IN THE VALUES:
{
  "user_profile": {
    "age": <number>,
    "weight": <number>,
    "gender": "<string>",
    "macros": {
      "calories": <number>,
      "protein": <number>,
      "carbohydrates": <number>,
      "fats": <number>
    }
  },
  "injections": {
    "todos": [
      { "task": "<string>", "frequency": "<string>", "requiresPro": <boolean> }
    ],
    "goals": [
      { "goal": "<string>", "target": <number>, "requiresPro": <boolean> }
    ],
    "alarms": [
      { "time": "<HH:MM>", "description": "<string>", "requiresPro": <boolean> }
    ],
    "master_workout_library": [
      { "name": "<string>", "focus": "<string>", "requiresPro": true }
    ],
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
      temperature: 0.2 // Lowered temperature forces the AI to be less creative and stick to the schema
    });

    const rawJson = completion.choices[0].message.content;
    if (!rawJson) throw new Error("No response from AI");
    
    let parsedData = JSON.parse(rawJson);
    
    // Server-Side Safety Net: If the AI still forgets the bottom flag, we inject it manually before sending to the app.
    if (parsedData.injections && parsedData.injections.master_workout_library_requires_pro === undefined) {
      parsedData.injections.master_workout_library_requires_pro = true;
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
