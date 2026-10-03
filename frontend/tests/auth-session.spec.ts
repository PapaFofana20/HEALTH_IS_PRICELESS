import { expect, test } from '@playwright/test';
import { backendSession, blockOtherApiCalls, memberUser, mockAuthMe, seedSession } from './helpers';

/**
 * GET /api/auth/me est consommé au boot pour réconcilier la session
 * backend (cookie httpOnly auth_token) avec l'état local.
 *
 * On vérifie deux contrats : la réponse serveur fait foi (rôle, plan),
 * et une absence de session (401 / backend injoignable) ne déconnect pas.
 *
 * Assertions volontairement indépendantes de la langue : le back-office
 * rendu expose une <nav>, alors que les écrans invité/refusé n'en ont pas.
 */
test.describe('GET /api/auth/me', () => {
  test.beforeEach(async ({ page }) => {
    await blockOtherApiCalls(page);
  });

  test('le rôle admin renvoyé par le backend ouvre le back-office', async ({ page }) => {
    await seedSession(page, memberUser); // localement : simple member
    await mockAuthMe(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: backendSession({ role: 'admin', email: 'staff@hip.app' }) }),
      });
    });

    await page.goto('/#/admin');

    // La réconciliation est asynchrone : on attend son effet avant d'affirmer
    // que le back-office s'ouvre (sinon assertion pendante sur le Suspense).
    await expect
      .poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('forge-user') ?? '{}').role ?? null))
      .toBe('admin');
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('un rôle user renvoyé par le backend verrouille le back-office', async ({ page }) => {
    await seedSession(page, memberUser);
    await mockAuthMe(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: backendSession({ role: 'user' }) }),
      });
    });

    await page.goto('/#/admin');

    // Écran d'accès refusé : aucune navigation back-office.
    await expect(page.locator('nav')).toHaveCount(0);
  });

  test('le plan renvoyé par le backend est appliqué', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await mockAuthMe(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: backendSession({ tier: 'premium' }) }),
      });
    });

    await page.goto('/#/dashboard');

    await expect
      .poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('forge-user') ?? '{}').tier ?? null))
      .toBe('premium');
  });

  test('un 401 conserve la session locale et ne déconnect pas', async ({ page }) => {
    await seedSession(page, memberUser);
    await mockAuthMe(page); // 401

    await page.goto('/#/dashboard');

    await expect(page.locator('a[href="#/connexion"]')).toHaveCount(0);
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('forge-user') !== null))
      .toBe(true);
  });

  test('un backend injoignable ne casse pas le boot', async ({ page }) => {
    await seedSession(page, memberUser);
    await page.route('**/api/auth/me', (route) => route.abort('failed'));

    await page.goto('/#/dashboard');

    // L'écran invité ne doit pas apparaître : on reste sur l'app connectée.
    await expect(page.locator('a[href="#/connexion"]')).toHaveCount(0);
  });
});