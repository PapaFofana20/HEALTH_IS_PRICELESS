import type { DashboardStats, DayStatus, MuscleVolume, User, WeeklyProgress, WeightEntry, WorkoutLog } from '../types';
import { avatar } from './media';

export const DEMO_USER_ID = 'demo-alex';

export const demoUser: User = {
  id: DEMO_USER_ID,
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'alex@hip.app',
  avatar: avatar('men', 36),
  role: 'user',
  tier: 'standard',
  goal: 'weight-loss',
  currentProgramId: 'lean-and-strong',
  currentWeek: 6,
  weightGoal: 76,
  memberSince: '2025-11-03',
};

export const seedWeightEntries: WeightEntry[] = [
  { date: '2026-01-05', weight: 85.0 },
  { date: '2026-01-12', weight: 84.6 },
  { date: '2026-01-19', weight: 84.0 },
  { date: '2026-01-26', weight: 83.6 },
  { date: '2026-02-02', weight: 83.2 },
  { date: '2026-02-09', weight: 82.8 },
  { date: '2026-02-16', weight: 82.4 },
];

export const weeklyProgress: WeeklyProgress[] = [
  { week: 1, sessions: 3, sessionsTarget: 4, minutes: 130, minutesTarget: 180, calories: 1150, caloriesTarget: 1500 },
  { week: 2, sessions: 4, sessionsTarget: 4, minutes: 175, minutesTarget: 180, calories: 1490, caloriesTarget: 1500 },
  { week: 3, sessions: 4, sessionsTarget: 4, minutes: 182, minutesTarget: 180, calories: 1560, caloriesTarget: 1500 },
  { week: 4, sessions: 3, sessionsTarget: 4, minutes: 140, minutesTarget: 180, calories: 1210, caloriesTarget: 1500 },
  { week: 5, sessions: 4, sessionsTarget: 4, minutes: 186, minutesTarget: 180, calories: 1620, caloriesTarget: 1500 },
  { week: 6, sessions: 4, sessionsTarget: 4, minutes: 190, minutesTarget: 180, calories: 1650, caloriesTarget: 1500 },
  { week: 7, sessions: null, sessionsTarget: 4, minutes: null, minutesTarget: 180, calories: null, caloriesTarget: 1500 },
  { week: 8, sessions: null, sessionsTarget: 4, minutes: null, minutesTarget: 180, calories: null, caloriesTarget: 1500 },
];

export const workoutLogs: WorkoutLog[] = [
  { id: 'w1', date: '2026-02-16', title: { fr: 'Upper Body', en: 'Upper Body' }, type: 'strength', minutes: 45, calories: 360, completed: true },
  { id: 'w2', date: '2026-02-14', title: { fr: 'HIIT Express', en: 'HIIT Express' }, type: 'hiit', minutes: 30, calories: 390, completed: true },
  { id: 'w3', date: '2026-02-12', title: { fr: 'Lower Body', en: 'Lower Body' }, type: 'strength', minutes: 50, calories: 420, completed: true },
  { id: 'w4', date: '2026-02-10', title: { fr: 'Full Body', en: 'Full Body' }, type: 'strength', minutes: 40, calories: 380, completed: true },
  { id: 'w5', date: '2026-02-08', title: { fr: 'Mobilité & marche', en: 'Mobility & walk' }, type: 'mobility', minutes: 20, calories: 90, completed: false },
  { id: 'w6', date: '2026-02-07', title: { fr: 'Upper Body', en: 'Upper Body' }, type: 'strength', minutes: 45, calories: 350, completed: true },
  { id: 'w7', date: '2026-02-05', title: { fr: 'HIIT Express', en: 'HIIT Express' }, type: 'hiit', minutes: 30, calories: 400, completed: true },
  { id: 'w8', date: '2026-02-03', title: { fr: 'Lower Body', en: 'Lower Body' }, type: 'strength', minutes: 50, calories: 410, completed: true },
];

export const demoStats: DashboardStats = {
  sessionsDone: 22,
  sessionsTotal: 32,
  streakDays: 9,
  calories: 8680,
  currentWeek: 6,
  totalWeeks: 8,
};

export const demoWeekStatus: DayStatus[] = ['done', 'done', 'rest', 'today', 'planned', 'planned', 'rest'];

export const muscleVolume: MuscleVolume[] = [
  { muscle: 'legs', sets: 18 },
  { muscle: 'back', sets: 14 },
  { muscle: 'chest', sets: 12 },
  { muscle: 'core', sets: 10 },
  { muscle: 'shoulders', sets: 9 },
  { muscle: 'arms', sets: 8 },
];

/** Profile used for the dashboard nutrition targets (mock). */
export const nutritionProfile = { sex: 'male', age: 32, heightCm: 180, activity: 'moderate' } as const;
