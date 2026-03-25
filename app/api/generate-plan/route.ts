import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an elite sports nutritionist. You must calculate macros (1g protein/lb, 0.4g fat/lb, rest carbs, 300-500 cal deficit). 

CRITICAL PAYWALL RULES:
- Generate 5 'todos', 2 'goals', and 2 'alarms' and set their "requiresPro" to false. 
- If you generate any additional todos (6+) or goals (3+), set their "requiresPro" to true.
- Generate 3 'master_workout_library' routines and set their "requiresPro" to true.
- Set "master_workout_library_requires_pro" to true.`;

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "solo_fitness_plan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              user_profile: {
                type: "object",
                properties: {
                  age: { type: "number" },
                  weight: { type: "number" },
                  gender: { type: "string" },
                  macros: {
                    type: "object",
                    properties: {
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbohydrates: { type: "number" },
                      fats: { type: "number" }
                    },
                    required: ["calories", "protein", "carbohydrates", "fats"],
                    additionalProperties: false
                  }
                },
                required: ["age", "weight", "gender", "macros"],
                additionalProperties: false
              },
              injections: {
                type: "object",
                properties: {
                  todos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task: { type: "string" },
                        frequency: { type: "string" },
                        requiresPro: { type: "boolean" }
                      },
                      required: ["task", "frequency", "requiresPro"],
                      additionalProperties: false
                    }
                  },
                  goals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        goal: { type: "string" },
                        target: { type: "number" },
                        requiresPro: { type: "boolean" }
                      },
                      required: ["goal", "target", "requiresPro"],
                      additionalProperties: false
                    }
                  },
                  alarms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string" },
                        description: { type: "string" },
                        requiresPro: { type: "boolean" }
                      },
                      required: ["time", "description", "requiresPro"],
                      additionalProperties: false
                    }
                  },
                  master_workout_library: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        focus: { type: "string" },
                        requiresPro: { type: "boolean" }
                      },
                      required: ["name", "focus", "requiresPro"],
                      additionalProperties: false
                    }
                  },
                  master_workout_library_requires_pro: { type: "boolean" }
                },
                required: ["todos", "goals", "alarms", "master_workout_library", "master_workout_library_requires_pro"],
                additionalProperties: false
              }
            },
            required: ["user_profile", "injections"],
            additionalProperties: false
          }
        }
      }
    });

    const rawJson = completion.choices[0].message.content;
    if (!rawJson) throw new Error("No response from AI");

    return NextResponse.json(JSON.parse(rawJson));
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
