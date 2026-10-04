import { expect, test } from '@playwright/test';
import {
  blockOtherApiCalls,
  memberUser,
  mockAuthMe,
  mockPaymentStatus,
  seedPendingPayment,
  seedSession,
} from './helpers';

/**
 * Retour de paiement SasPay : /#/paiement/retour lit le sessionId dans
 * localStorage puis appelle GET /api/saspay/status/:sessionId.
 * Succès (PAID / SUCCESS) -> redirection vers l'espace du plan payé.
 * Échec  -> écran « Paiement non confirmé ».
 */
test.describe('statut de paiement', () => {
  test.beforeEach(async ({ page }) => {
    await blockOtherApiCalls(page);
    await mockAuthMe(page);
  });

  test('un paiement confirmé redirige vers l\'espace payé et met le plan à jour', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await seedPendingPayment(page, { plan: 'premium', goal: 'weight-loss', sessionId: 'sess_ok' });
    await mockPaymentStatus(page, {
      status: 'PAID',
      transactionStatus: 'SUCCESS',
      plan: 'premium',
      goal: 'weight-loss',
    });

    await page.goto('/#/paiement/retour');

    await expect(page).toHaveURL(/#\/espace\/premium-perte-de-poids/);
    await expect
      .poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('forge-user') ?? '{}').tier ?? null))
      .toBe('premium');
    // Le paiement en attente est consommé.
    await expect
      .poll(async () => page.evaluate(() => window.localStorage.getItem('pending-payment')))
      .toBeNull();
  });

  test('le statut transaction SUCCESS seul suffit à valider le paiement', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await seedPendingPayment(page, { plan: 'standard', goal: 'muscle-gain', sessionId: 'sess_tx' });
    await mockPaymentStatus(page, { status: 'PENDING', transactionStatus: 'SUCCESS', plan: 'standard', goal: 'muscle-gain' });

    await page.goto('/#/paiement/retour');

    await expect(page).toHaveURL(/#\/espace\/standard-prise-de-masse/);
  });

  test('un paiement non confirmé affiche l\'écran d\'erreur', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await seedPendingPayment(page, { plan: 'premium', goal: 'weight-loss', sessionId: 'sess_pending' });
    await mockPaymentStatus(page, { status: 'PENDING' });

    await page.goto('/#/paiement/retour');

    await expect(page.getByText('Paiement non confirmé')).toBeVisible();
    await expect(page).toHaveURL(/#\/paiement\/retour/);
    // Le plan local n'est pas promu.
    await expect
      .poll(async () => page.evaluate(() => JSON.parse(window.localStorage.getItem('forge-user') ?? '{}').tier ?? null))
      .toBe('free');
  });

  test('un statut PAID sans transactionStatus valide aussi le paiement', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await seedPendingPayment(page, { plan: 'premium', goal: 'muscle-gain', sessionId: 'sess_paid' });
    await mockPaymentStatus(page, { status: 'PAID', plan: 'premium', goal: 'muscle-gain' });

    await page.goto('/#/paiement/retour');

    await expect(page).toHaveURL(/#\/espace\/premium-prise-de-masse/);
  });

  test('une erreur HTTP du backend affiche l\'écran d\'erreur', async ({ page }) => {
    await seedSession(page, { ...memberUser, tier: 'free' });
    await seedPendingPayment(page, { plan: 'premium', goal: 'weight-loss', sessionId: 'sess_500' });
    await mockPaymentStatus(page, { message: 'INTERNAL_ERROR' }, 500);

    await page.goto('/#/paiement/retour');

    await expect(page.getByText('Paiement non confirmé')).toBeVisible();
  });

  test('sans paiement en attente, l\'écran d\'erreur s\'affiche sans appel API', async ({ page }) => {
    await seedSession(page, memberUser);
    let called = false;
    await page.route('**/api/saspay/status/**', async (route) => {
      called = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/#/paiement/retour');

    await expect(page.getByText('Paiement non confirmé')).toBeVisible();
    expect(called).toBe(false);
  });
});