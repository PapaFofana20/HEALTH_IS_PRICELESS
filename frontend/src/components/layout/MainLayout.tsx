import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout() {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // HashRouter-safe skip link (no href="#…")
  const skipToContent = () => {
    const main = document.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  };

  return (
    <div className="flex min-h-screen flex-col bg-night-900">
      <button
        type="button"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-volt focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-night-900"
      >
        {t.nav.skip}
      </button>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      {pathname !== '/connexion' && <Footer />}
    </div>
  );
}
