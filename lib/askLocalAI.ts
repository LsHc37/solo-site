// Helper to query local Ollama server for Puck editor JSON
export async function askLocalAI(prompt: string): Promise<any> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen2.5-coder',
      prompt: prompt,
      system: 'You are a website builder. Output ONLY valid JSON for the Puck editor.',
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();
  // Ollama returns generated text in 'response' field
  let aiResponse;
  try {
    aiResponse = JSON.parse(data.response);
  } catch (e) {
    throw new Error('AI did not return valid JSON for Puck editor.');
  }

  // Secure validation
  // Import schema
  const { PuckDataSchema } = await import("./validations/puckSchema");
  const result = PuckDataSchema.safeParse(aiResponse);
  if (!result.success) {
    console.warn("SECURITY WARNING: AI response failed schema validation. Site update aborted.", result.error);
    return null;
  }
  // If valid, return parsed data
  return aiResponse;
}
