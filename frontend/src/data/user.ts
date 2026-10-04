import type { Goal, MuscleVolume, Tier, User } from '../types';

/* Profil neutre pour un compte créé localement (mode sans Supabase).
   Aucune donnée pré-remplie : tout part de zéro. */
export interface NewLocalUserInput {
  id: string;
  firstName: string;
  email: string;
  goal: Goal;
  tier?: Tier;
}

export function buildNewUser({ id, firstName, email, goal, tier = 'free' }: NewLocalUserInput): User {
  return {
    id,
    firstName,
    lastName: '',
    email,
    avatar: '',
    role: 'user',
    tier,
    goal,
    currentProgramId: null,
    currentWeek: 1,
    weightGoal: goal === 'weight-loss' ? 72 : 80,
    memberSince: new Date().toISOString().slice(0, 10),
  };
}

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
