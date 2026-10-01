import type { Goal, Tier, User } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

/* ==========================================================
   App profiles mirrored in Supabase Postgres (public.profiles).
   RLS: each authenticated user reads/writes only their own row.
   A DB trigger pre-creates the row at signup.
   ========================================================== */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isRemoteProfile = (user: User | null): user is User =>
  Boolean(user && isSupabaseConfigured && supabase && UUID.test(user.id));

const toTier = (value: unknown, fallback: Tier): Tier =>
  value === 'free' || value === 'standard' || value === 'premium' ? value : fallback;
const toGoal = (value: unknown, fallback: Goal): Goal =>
  value === 'weight-loss' || value === 'muscle-gain' ? value : fallback;

export interface RemoteProfile {
  tier: Tier;
  goal: Goal;
  firstName: string;
  lastName: string;
  avatar: string;
  currentProgramId: string | null;
  currentWeek: number;
  weightGoal: number;
  memberSince: string;
}

/** Load the Postgres profile and keep only sane fields. */
export async function fetchProfile(userId: string, fallback: User): Promise<Partial<User> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  const patch: Partial<User> = {
    tier: toTier(row.tier, fallback.tier),
    goal: toGoal(row.goal, fallback.goal),
    currentProgramId: typeof row.current_program_id === 'string' ? (row.current_program_id as string) : fallback.currentProgramId,
    currentWeek:
      typeof row.current_week === 'number' && Number.isInteger(row.current_week) && row.current_week > 0 ? row.current_week : fallback.currentWeek,
    weightGoal: typeof row.weight_goal === 'number' && row.weight_goal > 0 ? row.weight_goal : fallback.weightGoal,
    memberSince: typeof row.member_since === 'string' && row.member_since ? row.member_since : fallback.memberSince,
  };
  if (typeof row.first_name === 'string' && row.first_name.trim()) patch.firstName = row.first_name;
  if (typeof row.last_name === 'string') patch.lastName = row.last_name;
  if (typeof row.avatar === 'string' && row.avatar) patch.avatar = row.avatar;
  return patch;
}

/** Persist the app profile (fire-and-forget from callers). */
export async function saveProfile(user: User): Promise<void> {
  if (!isRemoteProfile(user) || !supabase) return;
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar: user.avatar,
      tier: user.tier,
      goal: user.goal,
      current_program_id: user.currentProgramId,
      current_week: user.currentWeek,
      weight_goal: user.weightGoal,
      member_since: user.memberSince,
    },
    { onConflict: 'id' },
  );
  if (error) console.warn('[profiles] save failed:', error.message);
}
