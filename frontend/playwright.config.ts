import { defineConfig, devices } from '@playwright/test';

/**
 * Tests d'intégration du parcours utilisateur.
 *
 * Le backend n'est pas démarré : toutes les requêtes /api/* sont
 * interceptées (route mocking), donc la suite est déterministe et
 * ne requiert ni Supabase ni credentials PayTech.
 *
 * VITE_SUPABASE_* est volontairement vidé : l'app bascule alors sur son
 * mode d'authentification local (useAuth), ce qui évite tout appel réseau
 * vers Supabase pendant les tests. process.env prime sur les fichiers .env
 * chez Vite, y compris via envDir.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  // Les pages sont chargées à la demande (React.lazy) : sur un serveur de dev
  // froid, la transformation Vite du chunk admin + recharts dépasse le
  // timeout par défaut de 5s et rend les assertions d'affichage instables.
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    locale: 'fr-FR',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // --host 127.0.0.1 : sans cela Vite écoute sur "localhost" (::1 sous Windows)
    // alors que Playwright interroge baseURL en IPv4.
    command: 'npm run dev -- --port 5173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    // false et non !process.env.CI : avec reuseExistingServer, un serveur de
    // dev déjà lancé (avec de vraies variables VITE_SUPABASE_*) était réutilisé
    // et le env{} ci-dessous n'était jamais appliqué. La suite passait alors
    // contre un serveur en mode Supabase réel au lieu du mode mock.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
    },
  },
});