import { chromium, type FullConfig } from '@playwright/test';

/**
 * Réchauffage du serveur de dev.
 *
 * Les pages sont chargées via React.lazy. Au premier hit, Vite transforme
 * DashboardPage et AdminPage (avec recharts) de façon synchrone et bloque son
 * event loop : deux tests qui chargent ces routes en parallèle restent coincés
 * sur le fallback Suspense, sans erreur réseau ni requête en vol.
 *
 * On force donc ces transformations une fois, en série, avant tout test.
 * Le webServer de playwright.config.ts est déjà démarré à ce stade.
 */
export default async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const route of ['/#/dashboard', '/#/admin', '/#/connexion', '/#/paiement?plan=premium']) {
      await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle');
    }
  } finally {
    await browser.close();
  }
}
