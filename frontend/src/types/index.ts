/* ==========================================================
   Domain types — shared by mock data, services and UI.
   Shapes are API-ready (REST / Supabase friendly).
   ========================================================== */

export type Lang = 'fr' | 'en';
export type Localized<T = string> = Record<Lang, T>;

export type Goal = 'weight-loss' | 'muscle-gain';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Plan = 'standard' | 'premium';
export type Tier = 'free' | Plan;
export type TrainingLocation = 'home' | 'gym' | 'both';
export type DayType = 'strength' | 'cardio' | 'hiit' | 'mobility' | 'rest';

/* ---------- Programs ---------- */
export interface ProgramDay {
  type: DayType;
  title: Localized;
  minutes: number;
}

export interface SessionExercise {
  exerciseId: string;
  sets: number;
  reps: Localized;
  restSeconds: number;
}

export interface WorkoutSession {
  id: string;
  title: Localized;
  focus: Localized;
  minutes: number;
  exercises: SessionExercise[];
}

export interface ProgramPhase {
  from: number;
  to: number;
  title: Localized;
  description: Localized;
}

export interface Coach {
  id: string;
  name: string;
  role: Localized;
  bio: Localized;
  avatar: string;
}

export interface Program {
  id: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  goal: Goal;
  level: Level;
  plan: Plan;
  location: TrainingLocation;
  durationWeeks: number;
  sessionsPerWeek: number;
  sessionMinutes: number;
  image: string;
  coachId: string;
  rating: number;
  enrolled: number;
  popular: boolean;
  objectives: Localized<string[]>;
  equipment: Localized<string[]>;
  weekPlan: ProgramDay[];
  phases: ProgramPhase[];
  sessions: WorkoutSession[];
}

export type FeatureAvailability = boolean | 'limited';

export interface PricingFeature {
  label: Localized;
  free: FeatureAvailability;
  standard: FeatureAvailability;
  premium: FeatureAvailability;
}

export interface PlanPrice {
  monthly: number;
  yearlyMonthly: number;
}

/* ---------- Exercises ---------- */
export type MuscleGroup = 'legs' | 'glutes' | 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'full-body';
export type Equipment = 'bodyweight' | 'dumbbells' | 'barbell' | 'pull-up-bar' | 'kettlebell';
export type TrainingType = 'strength' | 'hiit' | 'cardio' | 'core';

export interface Exercise {
  id: string;
  name: Localized;
  image: string;
  /** YouTube video ID used as the how-to explanation. */
  videoId: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  level: Level;
  equipment: Equipment;
  type: TrainingType;
  prescription: Localized;
  description: Localized;
  steps: Localized<string[]>;
  tips: Localized<string[]>;
  mistakes: Localized<string[]>;
}

/* ---------- Nutrition ---------- */
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe extends Macros {
  id: string;
  name: Localized;
  image: string;
  goal: Goal | 'both';
  category: MealCategory;
  prepMinutes: number;
  description: Localized;
  ingredients: Localized<string[]>;
  steps: Localized<string[]>;
  premium: boolean;
}

export type TipIcon = 'droplets' | 'beef' | 'salad' | 'moon' | 'chef' | 'scale';

export interface NutritionTip {
  id: string;
  icon: TipIcon;
  title: Localized;
  text: Localized;
}

export interface MealPlan {
  goal: Goal;
  items: { category: MealCategory; recipeId: string }[];
}

/* ---------- Articles ---------- */
export type ArticleCategory = 'weight-loss' | 'muscle-gain' | 'nutrition' | 'training' | 'recovery';

export interface ArticleSection {
  heading: Localized;
  body: Localized;
}

export interface Article {
  id: string;
  title: Localized;
  excerpt: Localized;
  category: ArticleCategory;
  image: string;
  readMinutes: number;
  date: string;
  author: string;
  featured: boolean;
  sections: ArticleSection[];
}

/* ---------- Community ---------- */
export interface Testimonial {
  id: string;
  name: string;
  age: number;
  goal: Goal;
  avatar?: string;
  programId: string;
  quote: Localized;
  rating: number;
  duration: Localized;
}

export interface Challenge {
  title: Localized;
  description: Localized;
  participants: number;
  daysLeft: number;
  progress: number;
}

/* ---------- User & tracking ---------- */
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: Role;
  tier: Tier;
  goal: Goal;
  currentProgramId: string | null;
  currentWeek: number;
  weightGoal: number;
  memberSince: string;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface WeeklyProgress {
  week: number;
  sessions: number | null;
  sessionsTarget: number;
  minutes: number | null;
  minutesTarget: number;
  calories: number | null;
  caloriesTarget: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: Localized;
  type: DayType;
  minutes: number;
  calories: number;
  completed: boolean;
}

export type DayStatus = 'done' | 'planned' | 'rest' | 'today' | 'missed';

export interface DashboardStats {
  sessionsDone: number;
  sessionsTotal: number;
  streakDays: number;
  calories: number;
  currentWeek: number;
  totalWeeks: number;
}

export interface MuscleVolume {
  muscle: MuscleGroup;
  sets: number;
}

/* ---------- Quiz ---------- */
export interface QuizAnswers {
  goal?: Goal;
  level?: Level;
  sessions?: number;
  location?: TrainingLocation;
  duration?: number;
  height?: number;
  weight?: number;
}

export interface ProgramMatch {
  program: Program;
  score: number;
}
