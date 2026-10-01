import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Goal, Tier, User } from '../types';
import { demoUser } from '../data/user';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { fetchProfile, isRemoteProfile, saveProfile } from '../lib/supabaseProfiles';

/* ==========================================================
   Authentication: Supabase Auth when configured
   (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY), otherwise
   local mock. App profile (tier, goal, program…) stays in
   localStorage keyed by account id in both modes.
   ========================================================== */

interface RegisterInput {
  firstName: string;
  email: string;
  password: string;
  goal: Goal;
  tier: Tier;
}

interface AuthContextValue {
  user: User | null;
  tier: Tier;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  setTier: (tier: Tier) => void;
  startProgram: (programId: string) => void;
  favorites: string[];
  toggleFavorite: (programId: string) => void;
  isFavorite: (programId: string) => boolean;
}

const USER_KEY = 'forge-user';
const FAV_KEY = 'forge-favorites';
const profileKey = (id: string) => `forge-profile-${id}`;

/**
 * Back-office accounts: these emails are granted role 'admin' (tier 'premium')
 * and are the only ones allowed to open /admin.
 * Override or extend via VITE_ADMIN_EMAILS (comma-separated) in .env.
 */
const ADMIN_EMAILS = ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (ADMIN_EMAILS.length === 0) ADMIN_EMAILS.push('admin@hip.app', 'papafofana200@gmail.com');

/** Display string for the admin guest hint (never a credential). */
export const ADMIN_EMAIL = ADMIN_EMAILS.join(' · ');

export const isAdminEmail = (email: string): boolean => ADMIN_EMAILS.includes(email.trim().toLowerCase());

/**
 * Admin access is decided by email ONLY. Stored/local and remote profiles
 * can carry a stale role 'user' (from an earlier registration) — they must
 * never downgrade an admin email, otherwise /admin stays locked forever.
 */
function enforceAdmin<T extends User>(user: T): T {
  if (!isAdminEmail(user.email)) return user;
  return { ...user, role: 'admin', tier: 'premium' };
}

const AuthContext = createContext<AuthContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const prefixOf = (email: string) => email.split('@')[0]?.split(/[._-]/)[0] ?? '';
const toGoal = (value: unknown): Goal => (value === 'weight-loss' || value === 'muscle-gain' ? value : 'weight-loss');

/** Postgres profile wins over locally built defaults (best effort). */
async function withRemoteProfile(base: User): Promise<User> {
  try {
    const remote = await fetchProfile(base.id, base);
    return remote ? { ...base, ...remote } : base;
  } catch {
    return base;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = read<User | null>(USER_KEY, null);
    return stored ? enforceAdmin(stored) : null;
  });
  const [favorites, setFavorites] = useState<string[]>(() => read<string[]>(FAV_KEY, ['muscle-builder', 'hiit-shred']));

  useEffect(() => {
    write(USER_KEY, user);
    if (user) write(profileKey(user.id), user);
    // Mirror the profile to Supabase Postgres (fire-and-forget).
    if (isRemoteProfile(user)) void saveProfile(user).catch(() => {});
  }, [user]);
  useEffect(() => write(FAV_KEY, favorites), [favorites]);

  // Restore a Supabase session on reload (mock mode already hydrates from USER_KEY).
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const sbUser = data.session?.user;
      if (!alive || !sbUser) return;
      const stored = read<User | null>(profileKey(sbUser.id), null);
      if (stored) {
        setUser(enforceAdmin(stored));
        return;
      }
      const normalized = (sbUser.email ?? '').toLowerCase();
      const base: User = {
        ...demoUser,
        id: sbUser.id,
        firstName: capitalize((sbUser.user_metadata?.firstName as string) || prefixOf(sbUser.email ?? '')) || demoUser.firstName,
        lastName: '',
        email: sbUser.email ?? '',
        role: isAdminEmail(normalized) ? 'admin' : 'user',
        tier: isAdminEmail(normalized) ? 'premium' : 'free',
        goal: toGoal(sbUser.user_metadata?.goal),
        currentProgramId: null,
        currentWeek: 1,
        weightGoal: 76,
        memberSince: new Date().toISOString().slice(0, 10),
      };
      if (!alive) return;
      setUser(enforceAdmin(await withRemoteProfile(base)));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email) || password.length < 6) throw new Error('invalid-credentials');
    const normalized = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error('invalid-credentials');
      const stored = read<User | null>(profileKey(data.user.id), null);
      const base: User = stored ?? {
        ...demoUser,
        id: data.user.id,
        firstName: capitalize((data.user.user_metadata?.firstName as string) || prefixOf(email)) || demoUser.firstName,
        lastName: '',
        email: data.user.email ?? email.trim(),
        role: isAdminEmail(normalized) ? 'admin' : 'user',
        tier: isAdminEmail(normalized) ? 'premium' : 'free',
        goal: toGoal(data.user.user_metadata?.goal),
        currentProgramId: null,
        currentWeek: 1,
        weightGoal: 76,
        memberSince: new Date().toISOString().slice(0, 10),
      };
      const next = enforceAdmin(await withRemoteProfile(base));
      setUser(next);
      return next;
    }
    await wait(700);
    const isDemo = normalized === demoUser.email;
    const next: User = {
      ...demoUser,
      email: email.trim(),
      firstName: isDemo ? demoUser.firstName : capitalize(prefixOf(email)) || demoUser.firstName,
      lastName: isDemo ? demoUser.lastName : '',
      role: isAdminEmail(normalized) ? 'admin' : 'user',
      tier: isAdminEmail(normalized) ? 'premium' : demoUser.tier,
    };
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    if (!isValidEmail(input.email) || input.password.length < 6 || !input.firstName.trim()) {
      throw new Error('invalid-input');
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: { data: { firstName: input.firstName.trim(), goal: input.goal } },
      });
      if (error) throw new Error('invalid-input');
      if (!data.session) throw new Error('confirm-email');
      const sbUser = data.user;
      const base: User = {
        ...demoUser,
        id: sbUser?.id ?? `user-${Date.now()}`,
        firstName: capitalize(input.firstName.trim()),
        lastName: '',
        email: input.email.trim(),
        role: 'user',
        goal: input.goal,
        tier: input.tier,
        currentProgramId: null,
        currentWeek: 1,
        weightGoal: input.goal === 'weight-loss' ? 72 : 80,
        memberSince: new Date().toISOString().slice(0, 10),
      };
      // Signup intent wins over the trigger-created empty row: persist first.
      const created = enforceAdmin(base);
      setUser(created);
      void saveProfile(base).catch(() => {});
      return created;
    }
    await wait(800);
    const next: User = {
      ...demoUser,
      id: `user-${Date.now()}`,
      firstName: capitalize(input.firstName.trim()),
      lastName: '',
      email: input.email.trim(),
      role: 'user',
      goal: input.goal,
      tier: input.tier,
      currentProgramId: null,
      currentWeek: 1,
      weightGoal: input.goal === 'weight-loss' ? 72 : 80,
      memberSince: new Date().toISOString().slice(0, 10),
    };
    const created = enforceAdmin(next);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(() => {
    if (isSupabaseConfigured && supabase) void supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const setTier = useCallback((tier: Tier) => {
    setUser((current) => (current ? { ...current, tier } : current));
  }, []);

  const startProgram = useCallback((programId: string) => {
    setUser((current) => (current ? { ...current, currentProgramId: programId, currentWeek: 1 } : current));
  }, []);

  const toggleFavorite = useCallback((programId: string) => {
    setFavorites((list) => (list.includes(programId) ? list.filter((id) => id !== programId) : [...list, programId]));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tier: user?.tier ?? 'free',
      login,
      register,
      logout,
      updateUser,
      setTier,
      startProgram,
      favorites,
      toggleFavorite,
      isFavorite: (programId: string) => favorites.includes(programId),
    }),
    [user, favorites, login, register, logout, updateUser, setTier, startProgram, toggleFavorite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
