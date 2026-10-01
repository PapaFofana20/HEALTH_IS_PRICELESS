import { programs } from '../data/programs';
import { exercises } from '../data/exercises';
import { recipes } from '../data/nutrition';
import { articles } from '../data/articles';
import { DEMO_USER_ID, muscleVolume, seedWeightEntries, weeklyProgress, workoutLogs } from '../data/user';
import type { Article, Exercise, MuscleVolume, Program, Recipe, WeeklyProgress, WeightEntry, WorkoutLog } from '../types';

/* ==========================================================
   Mock API layer.
   Every function returns a Promise with simulated latency so the
   UI handles loading / error states exactly as with a real backend.
   Replace the bodies with fetch() or Supabase queries later.
   Tip: add `?simulate=error` to any URL to test error states.
   ========================================================== */

const LATENCY = 420;

function shouldFail() {
  return typeof window !== 'undefined' && window.location.href.includes('simulate=error');
}

function respond<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFail()) reject(new Error('Network error (simulated)'));
      else resolve(value);
    }, ms);
  });
}

const weightKey = (userId: string) => `forge-weights-${userId}`;

function readWeights(userId: string): WeightEntry[] {
  try {
    const raw = localStorage.getItem(weightKey(userId));
    if (raw) return JSON.parse(raw) as WeightEntry[];
  } catch {
    /* ignore */
  }
  return userId === DEMO_USER_ID ? seedWeightEntries : [];
}

export const api = {
  getPrograms: (): Promise<Program[]> => respond(programs),
  getProgram: (id: string): Promise<Program | null> => respond(programs.find((p) => p.id === id) ?? null),
  getExercises: (): Promise<Exercise[]> => respond(exercises),
  getRecipes: (): Promise<Recipe[]> => respond(recipes),
  getArticles: (): Promise<Article[]> => respond(articles),
  getArticle: (id: string): Promise<Article | null> => respond(articles.find((a) => a.id === id) ?? null),

  getWeeklyProgress: (userId: string): Promise<WeeklyProgress[]> =>
    respond(userId === DEMO_USER_ID ? weeklyProgress : [], 350),
  getWorkoutLogs: (userId: string): Promise<WorkoutLog[]> => respond(userId === DEMO_USER_ID ? workoutLogs : [], 350),
  getMuscleVolume: (userId: string): Promise<MuscleVolume[]> => respond(userId === DEMO_USER_ID ? muscleVolume : [], 350),

  getWeightEntries: (userId: string): Promise<WeightEntry[]> => respond(readWeights(userId), 300),
  addWeightEntry: (userId: string, entry: WeightEntry): Promise<WeightEntry[]> => {
    const next = [...readWeights(userId).filter((e) => e.date !== entry.date), entry].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    try {
      localStorage.setItem(weightKey(userId), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    return respond(next, 250);
  },
};
