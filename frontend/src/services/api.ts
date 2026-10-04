import { getProgramById, programs } from '../data/programs';
import { exercises } from '../data/exercises';
import { recipes } from '../data/nutrition';
import { articles } from '../data/articles';
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
  return [];
}

export const api = {
  getPrograms: (): Promise<Program[]> => respond(programs),
  getProgram: (id: string): Promise<Program | null> => respond(getProgramById(id)),
  getExercises: (): Promise<Exercise[]> => respond(exercises),
  getRecipes: (): Promise<Recipe[]> => respond(recipes),
  getArticles: (): Promise<Article[]> => respond(articles),
  getArticle: (id: string): Promise<Article | null> => respond(articles.find((a) => a.id === id) ?? null),

  getWeeklyProgress: (_userId: string): Promise<WeeklyProgress[]> =>
    respond([], 350),
  getWorkoutLogs: (_userId: string): Promise<WorkoutLog[]> => respond([], 350),
  getMuscleVolume: (_userId: string): Promise<MuscleVolume[]> => respond([], 350),

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
