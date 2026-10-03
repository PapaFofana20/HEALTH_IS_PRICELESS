import type { Goal, Tier, User } from '../types';

/* ==========================================================
    Appels réels au backend Express (cookie httpOnly auth_token).
    Le même mécanisme est utilisé par services/paytech.ts :
    on suit « credentials: 'include' » pour que le cookie de
    session accompagne la requête.
    ========================================================== */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

const toTier = (value: unknown, fallback: Tier): Tier =>
  value === 'free' || value === 'standard' || value === 'premium' ? value : fallback;
const toGoal = (value: unknown, fallback: Goal): Goal =>
  value === 'weight-loss' || value === 'muscle-gain' ? value : fallback;

/**
 * GET /api/auth/me — session courante d'après le cookie auth_token.
 * Retourne null si non authentifié (401) ou si le backend est injoignable :
 * l'appel ne doit jamais faire échouer le boot de l'application.
 */
export async function fetchSessionUser(fallback: User): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as { user?: Record<string, unknown> } | null;
    const row = data?.user;
    if (!row) return null;

    return {
      ...fallback,
      id: typeof row.id === 'string' ? row.id : fallback.id,
      firstName: typeof row.firstName === 'string' && row.firstName ? row.firstName : fallback.firstName,
      lastName: typeof row.lastName === 'string' ? row.lastName : fallback.lastName,
      email: typeof row.email === 'string' ? row.email : fallback.email,
      role: row.role === 'admin' ? 'admin' : fallback.role,
      // Le serveur fait foi pour le plan : c'est lui qui active l'abonnement (IPN PayTech).
      tier: toTier(row.tier, fallback.tier),
      goal: toGoal(row.goal, fallback.goal),
      currentProgramId:
        typeof row.currentProgramId === 'string' ? row.currentProgramId : fallback.currentProgramId,
      currentWeek:
        typeof row.currentWeek === 'number' && row.currentWeek > 0 ? row.currentWeek : fallback.currentWeek,
      weightGoal: typeof row.weightGoal === 'number' && row.weightGoal > 0 ? row.weightGoal : fallback.weightGoal,
      memberSince:
        typeof row.memberSince === 'string' && row.memberSince ? row.memberSince : fallback.memberSince,
    };
  } catch {
    return null;
  }
}