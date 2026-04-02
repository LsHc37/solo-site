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

  if (age === null && numbersUnder100.length > 0) {
    age = Math.round(Math.min(...numbersUnder100));
  }

  if (weightLbs === null && numbersOver90.length > 0) {
    weightLbs = Math.round(Math.max(...numbersOver90));
  }

  if (extractedNumbers.length === 1) {
    const onlyNumber = extractedNumbers[0];
    if (age === null && onlyNumber > 0 && onlyNumber < 100) {
      age = Math.round(onlyNumber);
    }
    if (weightLbs === null && onlyNumber > 90 && onlyNumber < 1000) {
      weightLbs = Math.round(onlyNumber);
    }
  }

  if (age === null || age <= 0 || age >= 100) {
    age = 25;
  }
  if (weightLbs === null || weightLbs <= 0 || weightLbs >= 1000) {
    weightLbs = 150;
  }

  return { age, weightLbs, extractedNumbers };
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

export async function generateSoloPlan(userInput: string): Promise<Record<string, unknown>> {
  const { age, weightLbs } = extractPromptDemographics(userInput);
  const experienceLevel = extractExperienceLevel(userInput);
  const macros = calculateMacros(age, weightLbs, experienceLevel);

  const systemPrompt = `You are the RetroGigz Master AI. You build elite, comprehensive 4-week lifestyle and fitness programs.

USER DEMOGRAPHICS:
- Age: ${age}
- Weight: ${weightLbs} lbs
- Experience: ${experienceLevel}
- Macros: ${macros.calories} Cal, ${macros.protein}g Protein, ${macros.carbohydrates}g Carbs, ${macros.fats}g Fat.

INSTRUCTIONS:
1. Generate a full 4-week workout program (3-5 days per week depending on experience).
2. Generate 4 daily meals (Breakfast, Lunch, Dinner, Snack) that roughly equal the user's macros.
3. Inject daily habits (todos), fitness goals, and daily alarms.
4. Generate unique hex IDs for EVERYTHING (e.g., td_1a2b3c4d, wk_9f8e7d6c, ex_5b4a3c2d, ml_11223344).
5. If the user is a beginner, cap RPE at 6-7. Otherwise, use 8-10.

The result will be saved as a .solo file. Return ONLY one valid object.

REQUIRED STRUCTURE:
{
  "meta": {
    "version": "3.1",
    "engine": "RetroGigz Master AI",
    "program_length_weeks": 4
  },
  "user_profile": {
    "age": ${age},
    "weight": ${weightLbs},
    "gender": "unspecified",
    "macros": {
      "calories": ${macros.calories},
      "protein": ${macros.protein},
      "carbohydrates": ${macros.carbohydrates},
      "fats": ${macros.fats}
    }
  },
  "injections": {
    "todos": [ { "id": "td_...", "task": "Drink 96 oz of water", "frequency": "daily" } ],
    "goals": [ { "id": "gl_...", "goal": "Target Weight (lbs)", "target": 170 } ],
    "alarms": [ { "id": "al_...", "time": "06:00", "description": "Morning Fasted Cardio" } ]
  },
  "master_workout_library": [
    {
      "id": "wk_...",
      "program_day": "Week 1 - Day 1",
      "name": "Powerbuilding Full Body Blast",
      "focus": "Powerbuilding",
      "exercises": [
        { "id": "ex_...", "name": "Bench Press", "sets": 4, "reps": "8-12", "rpe": "9-10", "rest_seconds": 180 }
      ]
    }
  ],
  "meal_plans": [
    {
      "id": "ml_...",
      "name": "Protein Coffee & Banana",
      "type": "Breakfast",
      "macros": { "calories": 300, "protein": 30, "carbohydrates": 35, "fats": 5 },
      "ingredients": [ "1 scoop whey", "1 large banana" ]
    }
  ],
  "master_workout_library_requires_pro": true
}`;

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Original user input: ${userInput}. Generate the object for the .solo file.` },
      ],
      temperature: 0.7,
    }),
  });

  if (!aiResponse.ok) {
    const errText = await aiResponse.text();
    throw new Error(`OpenAI request failed (${aiResponse.status}): ${errText}`);
  }

  const raw = await aiResponse.json();
  let content = raw.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Model returned empty output");
  }

  if (content.startsWith("```json")) {
    content = content.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (content.startsWith("```")) {
    content = content.replace(/^```/, "").replace(/```$/, "").trim();
  }

  return JSON.parse(content) as Record<string, unknown>;
}
