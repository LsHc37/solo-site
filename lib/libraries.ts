export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface LibraryMeal {
  id: string;
  name: string;
  mealType: MealType;
  ingredients: string[];
  macros: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  tags: string[];
}

export interface LibraryExercise {
  id: string;
  name: string;
  equipment: string;
  focus: string;
  tags: string[];
}

export interface InjectionTemplateItem {
  id: string;
  name: string;
  frequency?: string;
  target?: string;
  metric?: string;
  time?: string;
  note?: string;
}

export const MEAL_LIBRARY: LibraryMeal[] = [
  {
    id: "ml_01",
    name: "Tofu Oat Power Bowl",
    mealType: "Breakfast",
    ingredients: ["Tofu scramble", "Oats", "Blueberries", "Chia seeds"],
    macros: { calories: 520, protein: 34, carbohydrates: 58, fats: 18 },
    tags: ["vegan", "bulk"],
  },
  {
    id: "ml_02",
    name: "Egg White Avocado Plate",
    mealType: "Breakfast",
    ingredients: ["Egg whites", "Avocado", "Whole grain toast", "Spinach"],
    macros: { calories: 430, protein: 32, carbohydrates: 28, fats: 19 },
    tags: ["cut"],
  },
  {
    id: "ml_03",
    name: "Keto Greek Yogurt Crunch",
    mealType: "Snack",
    ingredients: ["Greek yogurt", "Walnuts", "Flax seed", "Cinnamon"],
    macros: { calories: 360, protein: 28, carbohydrates: 16, fats: 20 },
    tags: ["keto", "cut"],
  },
  {
    id: "ml_04",
    name: "Chicken Rice Builder Bowl",
    mealType: "Lunch",
    ingredients: ["Chicken breast", "Jasmine rice", "Broccoli", "Olive oil"],
    macros: { calories: 640, protein: 52, carbohydrates: 62, fats: 18 },
    tags: ["bulk"],
  },
  {
    id: "ml_05",
    name: "Tempeh Quinoa Greens",
    mealType: "Lunch",
    ingredients: ["Tempeh", "Quinoa", "Mixed greens", "Tahini lemon dressing"],
    macros: { calories: 590, protein: 36, carbohydrates: 56, fats: 22 },
    tags: ["vegan", "cut"],
  },
  {
    id: "ml_06",
    name: "Keto Salmon Power Salad",
    mealType: "Lunch",
    ingredients: ["Salmon", "Romaine", "Cucumber", "Olive oil"],
    macros: { calories: 560, protein: 44, carbohydrates: 14, fats: 34 },
    tags: ["keto"],
  },
  {
    id: "ml_07",
    name: "Lean Beef Sweet Potato Stack",
    mealType: "Dinner",
    ingredients: ["Lean beef", "Sweet potato", "Green beans", "Avocado"],
    macros: { calories: 690, protein: 54, carbohydrates: 58, fats: 24 },
    tags: ["bulk"],
  },
  {
    id: "ml_08",
    name: "Seitan Stir Fry",
    mealType: "Dinner",
    ingredients: ["Seitan", "Brown rice", "Bell peppers", "Sesame oil"],
    macros: { calories: 610, protein: 48, carbohydrates: 64, fats: 16 },
    tags: ["vegan", "bulk"],
  },
  {
    id: "ml_09",
    name: "Keto Turkey Zoodle Bowl",
    mealType: "Dinner",
    ingredients: ["Ground turkey", "Zucchini noodles", "Parmesan", "Pesto"],
    macros: { calories: 520, protein: 46, carbohydrates: 15, fats: 28 },
    tags: ["keto", "cut"],
  },
  {
    id: "ml_10",
    name: "Protein Berry Shake",
    mealType: "Snack",
    ingredients: ["Whey isolate", "Mixed berries", "Almond milk", "Peanut butter"],
    macros: { calories: 390, protein: 34, carbohydrates: 26, fats: 14 },
    tags: ["bulk"],
  },
  {
    id: "ml_11",
    name: "Vegan Recovery Smoothie",
    mealType: "Snack",
    ingredients: ["Pea protein", "Banana", "Oat milk", "Hemp hearts"],
    macros: { calories: 370, protein: 30, carbohydrates: 34, fats: 12 },
    tags: ["vegan", "cut"],
  },
  {
    id: "ml_12",
    name: "Keto Egg Bite Snack",
    mealType: "Snack",
    ingredients: ["Egg bites", "Cheddar", "Turkey slices", "Almonds"],
    macros: { calories: 340, protein: 30, carbohydrates: 10, fats: 20 },
    tags: ["keto"],
  },
];

export const WORKOUT_EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: "wx_01", name: "Goblet Squat", equipment: "Dumbbell", focus: "Legs", tags: ["beginner", "bulk", "cut"] },
  { id: "wx_02", name: "Incline Push-Up", equipment: "Bodyweight", focus: "Chest", tags: ["beginner", "cut"] },
  { id: "wx_03", name: "Dumbbell Row", equipment: "Dumbbell", focus: "Back", tags: ["beginner", "bulk", "cut"] },
  { id: "wx_04", name: "Romanian Deadlift", equipment: "Barbell", focus: "Posterior Chain", tags: ["intermediate", "advanced", "bulk"] },
  { id: "wx_05", name: "Walking Lunge", equipment: "Dumbbell", focus: "Legs", tags: ["beginner", "cut"] },
  { id: "wx_06", name: "Overhead Press", equipment: "Barbell", focus: "Shoulders", tags: ["intermediate", "advanced", "bulk"] },
  { id: "wx_07", name: "Lat Pulldown", equipment: "Cable", focus: "Back", tags: ["beginner", "intermediate", "cut"] },
  { id: "wx_08", name: "Glute Bridge", equipment: "Bodyweight", focus: "Glutes", tags: ["beginner", "cut"] },
  { id: "wx_09", name: "Bench Press", equipment: "Barbell", focus: "Chest", tags: ["intermediate", "advanced", "bulk"] },
  { id: "wx_10", name: "Plank", equipment: "Bodyweight", focus: "Core", tags: ["beginner", "cut"] },
  { id: "wx_11", name: "Leg Press", equipment: "Machine", focus: "Legs", tags: ["intermediate", "advanced", "bulk"] },
  { id: "wx_12", name: "Seated Cable Row", equipment: "Cable", focus: "Back", tags: ["intermediate", "cut"] },
  { id: "wx_13", name: "Bulgarian Split Squat", equipment: "Dumbbell", focus: "Legs", tags: ["intermediate", "cut"] },
  { id: "wx_14", name: "Hip Thrust", equipment: "Barbell", focus: "Glutes", tags: ["intermediate", "advanced", "bulk"] },
  { id: "wx_15", name: "Assault Bike Intervals", equipment: "Cardio Machine", focus: "Conditioning", tags: ["beginner", "cut"] },
  { id: "wx_16", name: "Farmer Carry", equipment: "Dumbbell", focus: "Grip & Core", tags: ["beginner", "intermediate", "advanced", "bulk"] },
];

export const FOOD_LIBRARY = MEAL_LIBRARY;
export const WORKOUT_LIBRARY = WORKOUT_EXERCISE_LIBRARY;

export const INJECTION_TEMPLATES: {
  todos: InjectionTemplateItem[];
  goals: InjectionTemplateItem[];
  alarms: InjectionTemplateItem[];
} = {
  todos: [
    { id: "td_c9f2a1b4", name: "Water", frequency: "daily", target: "Drink 100 oz water" },
    { id: "td_a8e4d3f1", name: "Protein", frequency: "daily", target: "Hit daily protein target" },
    { id: "td_b6d1e9c2", name: "Steps", frequency: "daily", target: "Reach 8,000+ steps" },
  ],
  goals: [
    { id: "gl_9f2a6d1c", name: "Target Weight", metric: "lbs", target: "{weight_lbs}" },
    { id: "gl_3e7b1a9d", name: "Completion %", metric: "percent", target: "90" },
  ],
  alarms: [
    { id: "al_5d2b8f1e", name: "Morning Cardio", time: "06:30", note: "20-30 minutes low intensity" },
    { id: "al_1c7e4a9b", name: "Evening Meal Prep", time: "19:00", note: "Prep next day meals" },
  ],
};
