import { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { MainLayout } from './components/layout/MainLayout';
import { NotFoundState, Spinner } from './components/ui/States';
import { isSupabaseConfigured } from './lib/supabase';
import { syncProgramCatalog } from './data/programs';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticlesPage').then((module) => ({ default: module.ArticleDetailPage })));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const EspacePage = lazy(() => import('./pages/EspacePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Spinner />
    </div>
  );
}

/** Full-screen boot screen while the admin program catalogue syncs. */
function BootScreen() {
  return (
    <div className="min-h-screen bg-night-900 flex items-center justify-center">
      <Spinner />
    </div>
  );
}

const CATALOG_SYNC_TIMEOUT = 5000;

/**
 * HEALTH IS PRICELESS — fitness coaching platform.
 * HashRouter keeps deep links working when the app is served as a single static file.
 * Pages are code-split: each route loads its own chunk on demand.
 */
export default function App() {
  // Block the first render until Supabase program edits are merged over the built-in
  // catalogue (instant when Supabase is not configured, capped at 5s on slow networks).
  const [catalogReady, setCatalogReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (catalogReady) return;
    let alive = true;
    const timeout = new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), CATALOG_SYNC_TIMEOUT));
    Promise.race([syncProgramCatalog(), timeout]).finally(() => {
      if (alive) setCatalogReady(true);
    });
    return () => {
      alive = false;
    };
  }, [catalogReady]);

  return (
    <LanguageProvider>
      {!catalogReady ? (
        <BootScreen />
      ) : (
        <AuthProvider>
          <HashRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="programmes" element={<ProgramsPage />} />
                  <Route path="programmes/:id" element={<ProgramDetailPage />} />
                  <Route path="quiz" element={<QuizPage />} />
                  <Route path="exercices" element={<ExercisesPage />} />
                  <Route path="nutrition" element={<NutritionPage />} />
                  <Route path="conseils" element={<ArticlesPage />} />
                  <Route path="conseils/:id" element={<ArticleDetailPage />} />
                  <Route path="tarifs" element={<PricingPage />} />
                  <Route path="espace/:spaceId" element={<EspacePage />} />
                  <Route path="a-propos" element={<AboutPage />} />
                  <Route path="connexion" element={<AuthPage />} />
                  <Route path="*" element={<NotFoundState />} />
                </Route>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="dashboard/:section" element={<DashboardPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/:section" element={<AdminPage />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      )}
    </LanguageProvider>
  );
}
