import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Goal, Tier } from '../types';

/* ==========================================================
   Back-office data layer (real data, Supabase).
   - members  → public.profiles   (requires migration 0002_admin.sql)
   - orders   → public.orders     (requires migration 0002_admin.sql)
   Without Supabase configured, everything resolves to empty lists
   so the UI shows honest empty states instead of fake rows.
   ========================================================== */

export type MemberStatus = 'active' | 'trial' | 'expired';
export type OrderStatus = 'paid' | 'pending' | 'failed';
export type PayMethod = 'wave' | 'orange' | 'mtn' | 'card';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: Tier;
  goal: Goal;
  /** Derived from the plan until a subscription table exists. */
  status: MemberStatus;
  programId: string | null;
  currentWeek: number;
  weightGoal: number | null;
  favorites: string[];
  joined: string; // ISO date
}

export interface AdminOrder {
  id: string;
  reference: string;
  member: string;
  plan: Exclude<Tier, 'free'>;
  amount: number; // XOF
  method: PayMethod;
  status: OrderStatus;
  date: string; // ISO date
}

const toTier = (value: unknown): Tier =>
  value === 'free' || value === 'standard' || value === 'premium' ? value : 'free';
const toGoal = (value: unknown): Goal => (value === 'muscle-gain' ? 'muscle-gain' : 'weight-loss');
const toPlan = (value: unknown): Exclude<Tier, 'free'> => (value === 'premium' ? 'premium' : 'standard');
const toMethod = (value: unknown): PayMethod =>
  value === 'wave' || value === 'orange' || value === 'mtn' || value === 'card' ? value : 'card';
const toOrderStatus = (value: unknown): OrderStatus =>
  value === 'paid' || value === 'failed' ? value : 'pending';
const displayName = (first: unknown, last: unknown, email: unknown): string => {
  const name = `${typeof first === 'string' ? first : ''} ${typeof last === 'string' ? last : ''}`.trim();
  return name || (typeof email === 'string' ? email : '');
};

/** All member profiles. Requires the admin RLS policy from 0002_admin.sql. */
export async function fetchAdminMembers(): Promise<AdminMember[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, avatar, tier, goal, current_program_id, current_week, weight_goal, favorites, member_since')
    .order('member_since', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[] | null ?? []).map((row) => ({
    id: String(row.id ?? ''),
    name: displayName(row.first_name, row.last_name, row.email),
    email: typeof row.email === 'string' ? row.email : '',
    avatar: typeof row.avatar === 'string' ? row.avatar : '',
    tier: toTier(row.tier),
    goal: toGoal(row.goal),
    status: toTier(row.tier) === 'free' ? 'trial' : 'active',
    programId: typeof row.current_program_id === 'string' && row.current_program_id ? row.current_program_id : null,
    currentWeek: typeof row.current_week === 'number' ? row.current_week : 1,
    weightGoal: typeof row.weight_goal === 'number' ? row.weight_goal : null,
    favorites: Array.isArray(row.favorites) ? row.favorites.map(String) : [],
    joined: typeof row.member_since === 'string' && row.member_since ? row.member_since : '',
  }));
}

/** All orders, newest first, with the member display name resolved. */
export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, user_id, reference, plan, amount, method, status, created_at')
    .order('created_at', { ascending: false });
  // PGRST205 = table missing (migration 0002_admin.sql not run yet): show an empty list instead of breaking the page.
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw new Error(error.message);
  }
  const rows = (data as Record<string, unknown>[] | null ?? []) as Record<string, unknown>[];

  const userIds = [...new Set(rows.map((row) => String(row.user_id ?? '')).filter(Boolean))];
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('id', userIds);
    for (const profile of (profiles as Record<string, unknown>[] | null) ?? []) {
      names.set(String(profile.id), displayName(profile.first_name, profile.last_name, profile.email));
    }
  }

  return rows.map((row) => ({
    id: String(row.id ?? ''),
    reference: String(row.reference ?? ''),
    member: names.get(String(row.user_id ?? '')) ?? '—',
    plan: toPlan(row.plan),
    amount: typeof row.amount === 'number' ? row.amount : 0,
    method: toMethod(row.method),
    status: toOrderStatus(row.status),
    date: typeof row.created_at === 'string' ? row.created_at : '',
  }));
}

export interface MonthBucket {
  key: string; // 'YYYY-MM'
  value: number;
}

/** Bucket dated values into the last `months` calendar months, oldest first. */
export function monthlyBuckets(rows: { date: string; value: number }[], months = 6, now = new Date()): MonthBucket[] {
  const keys: string[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let index = 0; index < months; index += 1) {
    keys.unshift(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  const totals = new Map<string, number>(keys.map((key) => [key, 0]));
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + row.value);
  }
  return keys.map((key) => ({ key, value: totals.get(key) ?? 0 }));
}

/* ---------- Admin emails (whitelist back-office) ---------- */

export async function fetchAdminEmails(): Promise<string[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('admin_emails').select('email').order('email');
  if (error) {
    if (error.code === 'PGRST205') return [];
    throw new Error(error.message);
  }
  return (data as Record<string, unknown>[] | null ?? []).map((row) => String(row.email ?? ''));
}

export async function addAdminEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('admin_emails').insert({ email: email.trim().toLowerCase() });
  if (error) throw new Error(error.message);
}

export async function removeAdminEmail(email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('admin_emails').delete().eq('email', email);
  if (error) throw new Error(error.message);
}

const BACKEND_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

/**
 * Token d'accès admin, rafraîchi si proche de l'expiration (les access
 * tokens Supabase vivent ~1 h : sans ça, le backend répond 401
 * « Session invalide ou expirée »).
 */
async function adminAccessToken(): Promise<string> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase non configuré');
  const { data } = await supabase.auth.getSession();
  let token = data.session?.access_token ?? null;
  const expiresAt = data.session?.expires_at ?? null;
  if (token && expiresAt && expiresAt * 1000 - Date.now() < 60_000) {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (!error && refreshed.session?.access_token) token = refreshed.session.access_token;
  }
  if (!token) throw new Error('Session administrateur requise — reconnecte-toi');
  return token;
}

export interface CreatedAdmin {
  created?: boolean;
  promoted?: boolean;
  email?: string;
}

/**
 * Supprime définitivement un membre (compte Auth + profil + commandes).
 * Refuse l'auto-suppression et les comptes admin côté serveur.
 */
export async function deleteBackendMember(userId: string): Promise<{ email?: string }> {
  const token = await adminAccessToken();
  const res = await fetch(`${BACKEND_URL}/api/auth/members/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((payload as { message?: string }).message ?? 'Suppression impossible');
  return payload as { email?: string };
}

/**
 * Crée un administrateur complet (compte Auth + profil + whitelist) via le
 * backend (clé service-role). Le demandeur prouve son rôle avec son token
 * d'accès Supabase : sa session n'est pas touchée.
 */
export async function createBackendAdmin(input: { email: string; password: string; firstName: string }): Promise<CreatedAdmin> {
  const token = await adminAccessToken();
  const res = await fetch(`${BACKEND_URL}/api/auth/create-admin`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((payload as { message?: string }).message ?? 'Création impossible');
  return payload as CreatedAdmin;
}
