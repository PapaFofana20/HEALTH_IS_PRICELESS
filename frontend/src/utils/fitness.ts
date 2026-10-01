import type { Level, Program, ProgramMatch, QuizAnswers, TrainingLocation } from '../types';

/* ==========================================================
   Fitness calculators + quiz recommendation engine.
   Pure functions: easy to test and to move server-side.
   ========================================================== */

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type CalorieGoal = 'lose' | 'maintain' | 'gain';
export type BmiCategory = 'under' | 'normal' | 'over' | 'obese';

export const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'athlete'];

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* ---------- BMI ---------- */
export function calculateBmi(weightKg: number, heightCm: number) {
  const meters = heightCm / 100;
  const value = weightKg / (meters * meters);
  let category: BmiCategory = 'normal';
  if (value < 18.5) category = 'under';
  else if (value < 25) category = 'normal';
  else if (value < 30) category = 'over';
  else category = 'obese';
  return { value: Math.round(value * 10) / 10, category };
}

/** Position (0–100 %) of a BMI value on a 15 → 40 scale. */
export const bmiGaugePosition = (value: number) => clamp(((value - 15) / 25) * 100, 0, 100);

/* ---------- Calories (Mifflin-St Jeor) ---------- */
export interface CalorieInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: CalorieGoal;
}

export function calculateCalories({ sex, age, heightCm, weightKg, activity, goal }: CalorieInput) {
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTORS[activity];
  const factor = goal === 'lose' ? 0.85 : goal === 'gain' ? 1.1 : 1;
  const target = tdee * factor;
  const proteinPerKg = goal === 'lose' ? 2 : goal === 'gain' ? 1.8 : 1.6;
  const protein = weightKg * proteinPerKg;
  const fat = (target * 0.27) / 9;
  const carbs = Math.max(0, (target - protein * 4 - fat * 9) / 4);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
}

/* ---------- Protein ---------- */
export function calculateProtein(weightKg: number, goal: CalorieGoal, activity: ActivityLevel) {
  let minPerKg = 1.6;
  let maxPerKg = 2.2;
  if (goal === 'maintain') {
    if (activity === 'sedentary') {
      minPerKg = 0.8;
      maxPerKg = 1.2;
    } else {
      minPerKg = 1.2;
      maxPerKg = 1.6;
    }
  }
  const recommendedPerKg = (minPerKg + maxPerKg) / 2;
  const daily = Math.round(weightKg * recommendedPerKg);
  return {
    minPerKg,
    maxPerKg,
    min: Math.round(weightKg * minPerKg),
    max: Math.round(weightKg * maxPerKg),
    daily,
    perMeal: Math.round(daily / 4),
  };
}

/* ---------- Quiz recommendation ---------- */
const LEVEL_INDEX: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function locationScore(programLocation: TrainingLocation, wanted: TrainingLocation) {
  if (programLocation === wanted) return 15;
  if (programLocation === 'both') return 12;
  if (wanted === 'both') return 8;
  return 0;
}

/** Scores every program out of 100 and returns the best matches. */
export function recommendPrograms(answers: QuizAnswers, programs: Program[], limit = 3): ProgramMatch[] {
  const scored = programs.map((program) => {
    let score = 0;
    if (answers.goal) score += program.goal === answers.goal ? 40 : 0;
    if (answers.level) {
      const diff = Math.abs(LEVEL_INDEX[program.level] - LEVEL_INDEX[answers.level]);
      score += diff === 0 ? 20 : diff === 1 ? 8 : 0;
    }
    if (answers.sessions) {
      const diff = Math.abs(program.sessionsPerWeek - answers.sessions);
      score += Math.max(0, 15 - diff * 6);
    }
    if (answers.location) score += locationScore(program.location, answers.location);
    if (answers.duration) {
      const diff = Math.abs(program.sessionMinutes - answers.duration);
      score += Math.max(0, 10 - diff / 3);
    }
    return { program, score: Math.round(clamp(score, 0, 100)) };
  });
  return scored
    .sort((a, b) => b.score - a.score || b.program.rating - a.program.rating)
    .slice(0, limit);
}
