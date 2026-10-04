import type { Page, Route } from '@playwright/test';

/**
 * Utilitaires partagés par les tests d'intégration.
 *
 * L'app tourne en mode d'authentification local (VITE_SUPABASE_* vidé par
 * playwright.config.ts) : l'état de session vit dans localStorage sous
 * la clé `forge-user` (cf. hooks/useAuth.tsx).
 */

export const USER_STORAGE_KEY = 'forge-user';
export const PENDING_PAYMENT_KEY = 'pending-payment';

export interface TestUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  tier: 'free' | 'standard' | 'premium';
  goal: 'weight-loss' | 'muscle-gain';
  currentProgramId: string | null;
  currentWeek: number;
  weightGoal: number;
  memberSince: string;
}

export const memberUser: TestUser = {
  id: 'test-member',
  firstName: 'Alex',
  lastName: 'Martin',
  email: 'test-member@hip.app',
  avatar: '',
  role: 'user',
  tier: 'free',
  goal: 'weight-loss',
  currentProgramId: null,
  currentWeek: 1,
  weightGoal: 76,
  memberSince: '2026-01-15',
};

/** Simule une session backend existante (cookie auth_token). */
export const backendSession = (overrides: Partial<TestUser> = {}): TestUser => ({
  ...memberUser,
  ...overrides,
});

/**
 * Injecte l'utilisateur en localStorage avant le boot de l'app.
 * Passe par addInitScript pour être en place avant AuthProvider.
 */
export async function seedSession(page: Page, user: TestUser | null): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.removeItem('forge-user');
      if (value) window.localStorage.setItem(key, value);
    },
    [USER_STORAGE_KEY, user ? JSON.stringify(user) : null] as const,
  );
}

/** Dépose un paiement en attente, consommé par /#/paiement/retour. */
export async function seedPendingPayment(
  page: Page,
  payment: { plan: string; goal: string; sessionId: string },
): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [PENDING_PAYMENT_KEY, JSON.stringify(payment)] as const,
  );
}

/**
 * GET /api/auth/me — 401 par défaut (aucune session backend).
 * Surcharger `handler` pour simuler un utilisateur authentifié.
 */
export async function mockAuthMe(page: Page, handler?: (route: Route) => Promise<void>): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    if (handler) return handler(route);
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Non authentifié' }),
    });
  });
}

/** GET /api/saspay/status/:sessionId — interception du statut de paiement. */
export async function mockPaymentStatus(
  page: Page,
  body: Record<string, unknown>,
  status = 200,
): Promise<void> {
  await page.route('**/api/saspay/status/**', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

/**
 * Attrape-tout : empêche toute requête /api/* non interceptée d'atteindre
 * le réseau (le backend n'est pas démarré pendant les tests).
 */
export async function blockOtherApiCalls(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    // eslint-disable-next-line no-console
    console.warn(`[test] Requête API non mockée : ${url}`);
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'NOT_MOCKED' }),
    });
  });
}