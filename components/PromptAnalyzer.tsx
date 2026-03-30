interface PromptAnalyzerProps {
  text: string;
}

interface PromptAnalysis {
  score: number;
  demographics: boolean;
  goals: boolean;
  diet: boolean;
  logistics: boolean;
  missing: string[];
}

const demographicsPattern = /\b(age|years? old|yo|weight|lbs?|lb|kg|kilos?)\b/i;
const goalsPattern = /\b(lean|bulk|bulking|cut|cutting|maintain|maintenance|recomp|recomposition|fat loss|muscle gain)\b/i;
const dietPattern = /\b(calories?|calorie|kcal|macros?|protein|carbs?|fats?)\b/i;
const logisticsPattern = /\b(gym|home|equipment|dumbbells?|barbell|bodyweight|days?|week|schedule|available|time)\b/i;

export function analyzePrompt(text: string): PromptAnalysis {
  const demographics = demographicsPattern.test(text);
  const goals = goalsPattern.test(text);
  const diet = dietPattern.test(text);
  const logistics = logisticsPattern.test(text);

  const score = [demographics, goals, diet, logistics].filter(Boolean).length * 25;

  const missing: string[] = [];
  if (!demographics) missing.push("demographics (age/weight)");
  if (!goals) missing.push("specific goals (lean/bulk)");
  if (!diet) missing.push("diet info (calories/macros)");
  if (!logistics) missing.push("logistics (gym/home/days)");

  return { score, demographics, goals, diet, logistics, missing };
}

function getScoreColor(score: number) {
  if (score < 50) {
    return {
      bar: "#FF4444",
      track: "#FF444422",
      border: "#FF444455",
    };
  }

  if (score < 75) {
    return {
      bar: "#FACC15",
      track: "#FACC1522",
      border: "#FACC1555",
    };
  }

  return {
    bar: "#22C55E",
    track: "#22C55E22",
    border: "#22C55E55",
  };
}

export default function PromptAnalyzer({ text }: PromptAnalyzerProps) {
  const analysis = analyzePrompt(text);
  const colors = getScoreColor(analysis.score);

  const coachingText =
    analysis.missing.length === 0
      ? "Great prompt. You included all key details for a strong fitness plan."
      : `Add ${analysis.missing.join(", ")} to improve your plan quality.`;

  return (
    <div
      className="mt-4 rounded-xl border p-4"
      style={{
        backgroundColor: "#0D1117",
        borderColor: colors.border,
      }}
      aria-live="polite"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: "#E6EDF3" }}>
          Prompt Strength
        </p>
        <p className="text-sm font-bold" style={{ color: colors.bar }}>
          {analysis.score}%
        </p>
      </div>

      <div
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: colors.track }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={analysis.score}
        aria-label="Prompt strength score"
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${analysis.score}%`, backgroundColor: colors.bar }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed" style={{ color: "#8B949E" }}>
        {coachingText}
      </p>
    </div>
  );
}