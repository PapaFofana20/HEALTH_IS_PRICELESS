import { expect, test } from '@playwright/test';
import { blockOtherApiCalls, memberUser, mockAuthMe, seedSession } from './helpers';

/**
 * Parcours login -> routes protégées.
 *
 * En mode local (Supabase désactivé), useAuth.login() valide l'email et
 * une longueur de mot de passe >= 8, puis persiste la session.
 * AuthPage redirige ensuite vers /admin pour un compte admin, /dashboard sinon.
 */
test.describe('login -> routes protégées', () => {
  test.beforeEach(async ({ page }) => {
    await blockOtherApiCalls(page);
    await mockAuthMe(page); // aucune session backend
  });

  test('un visiteur non connecté est bloqué sur /dashboard', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/dashboard');

    // Écran invité : pas de contenu applicatif, un appel à la connexion.
    await expect(page.locator('a[href="/connexion"]').first()).toBeVisible();
    await expect(page.locator('text=Connexion')).toHaveCount(0); // pas de contenu dashboard
  });

  test('un visiteur non connecté est bloqué sur /admin', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/admin');

    await expect(page.locator('a[href="/connexion"]').first()).toBeVisible();
    await expect(page.locator('nav')).toHaveCount(0);
  });

  test('un email valide ouvre le dashboard', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/connexion');
    await page.locator('#auth-email').fill(memberUser.email);
    await page.locator('#auth-password').fill('motdepasse123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/#\/dashboard/);
    // Le tableau de bord est rendu : la sidebar applicative est présente.
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('un email court est refusé sans appel réseau', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/connexion');
    await page.locator('#auth-email').fill('pas-un-email');
    await page.locator('#auth-password').fill('motdepasse123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#auth-email-error')).toBeVisible();
    await expect(page).toHaveURL(/#\/connexion/);
  });

  test('un mot de passe trop court est refusé', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/connexion');
    await page.locator('#auth-email').fill(memberUser.email);
    await page.locator('#auth-password').fill('court');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#auth-password-error')).toBeVisible();
  });

  test('un email admin est redirigé vers le back-office', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/connexion');
    await page.locator('#auth-email').fill('admin@hip.app');
    await page.locator('#auth-password').fill('motdepasse123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/#\/admin/);
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('un ?plan=premium en URL n’accorde pas la formule, il redirige vers le paiement', async ({ page }) => {
    await seedSession(page, null);

    await page.goto('/connexion?plan=premium');
    await page.locator('#auth-email').fill('membre@hip.app');
    await page.locator('#auth-password').fill('motdepasse123');
    await page.locator('button[type="submit"]').click();

    // Redirection vers le tunnel de paiement, pas vers un espace déjà premium.
    await expect(page).toHaveURL(/#\/paiement\?plan=premium/);
    const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('forge-user') ?? '{}'));
    expect(stored.tier).not.toBe('premium');
  });

  test('un admin ne peut pas ouvrir l\'espace client', async ({ page }) => {
    await seedSession(page, { ...memberUser, email: 'admin@hip.app', role: 'admin' });

    await page.goto('/dashboard');

    // DashboardPage redirige un admin vers /admin.
    await expect(page).toHaveURL(/#\/admin/);
  });

  test('la session survit à un rechargement', async ({ page }) => {
    await seedSession(page, memberUser);

    await page.goto('/dashboard');
    await page.reload();

    await expect(page.locator('a[href="/connexion"]')).toHaveCount(0);
  });

  test('les sections du dashboard restent accessibles une fois connecté', async ({ page }) => {
    await seedSession(page, { ...memberUser, currentProgramId: 'muscle-builder' });

    for (const section of ['seances', 'progression', 'parametres', 'favoris']) {
      await page.goto(`/dashboard/${section}`);
      await expect(page.locator('a[href="/connexion"]')).toHaveCount(0);
    }
  });

  test('la déconnexion vide la session et rebloque les routes', async ({ page }) => {
    await seedSession(page, memberUser);

    await page.goto('/dashboard/parametres');
    await page.locator('#main').getByRole('button', { name: /déconnexion/i }).click();

    await expect(page).toHaveURL(/#\/$/);
    await page.goto('/dashboard');
    await expect(page.locator('a[href="/connexion"]').first()).toBeVisible();
  });
});