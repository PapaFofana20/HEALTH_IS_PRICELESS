import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../ui/Logo';
import { ButtonLink } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { to: '/', label: t.nav.home, end: true },
    { to: '/programmes', label: t.nav.programs, end: false },
    { to: '/exercices', label: t.nav.exercises, end: false },
    { to: '/nutrition', label: t.nav.nutrition, end: false },
    { to: '/conseils', label: t.nav.advice, end: false },
    { to: '/a-propos', label: t.nav.about, end: false },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + Escape key while the drawer is open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open || pathname !== '/';

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
          solid ? 'border-edge/70 bg-night-900/88 backdrop-blur-md' : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Logo compact />

          <nav aria-label={t.nav.main} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {user?.role === 'admin' && (
                <li key="/admin">
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'group relative block px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
                        isActive ? 'text-volt' : 'text-volt/70 hover:text-volt',
                      )
                    }
                  >
                    {t.nav.admin}
                    <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-volt transition-transform duration-300" />
                  </NavLink>
                </li>
              )}
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      cn(
                        'group relative block px-3 py-2 text-[12px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
                        isActive ? 'text-ink' : 'text-muted hover:text-ink',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        <span
                          aria-hidden
                          className={cn(
                            'absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-volt transition-transform duration-300',
                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ButtonLink to="/connexion" size="sm" className="hidden md:inline-flex" iconRight={<ArrowRight />}>
              {t.nav.login}
            </ButtonLink>
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full border border-edge py-1 pl-1 pr-3 text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink transition-colors hover:border-volt lg:inline-flex"
              >
                <img
                  src={user.avatar}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                {t.nav.dashboard}
              </Link>
            ) : (
              <ButtonLink to="/connexion" size="sm" className="lg:hidden">
                {t.nav.login}
              </ButtonLink>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              className="grid h-10 w-10 place-items-center rounded-full border border-edge text-ink transition-colors hover:border-volt hover:text-volt lg:hidden"
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — rendered outside the header so backdrop-filter doesn't trap fixed positioning */}
      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-night-900 transition-all duration-300 lg:hidden',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-3 opacity-0',
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-grid fade-mask-radial" />
        <nav aria-label={t.nav.mobile} className="relative mx-auto flex min-h-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6">
          <ul className="divide-y divide-edge border-y border-edge">
            {[...links, { to: '/tarifs', label: t.nav.pricing, end: false }, ...(user?.role === 'admin' ? [{ to: '/admin', label: t.nav.admin, end: false }] : [])].map((link, index) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between py-4 font-display text-3xl uppercase tracking-wide transition-colors sm:text-4xl',
                      isActive ? 'text-volt' : 'text-ink hover:text-volt',
                    )
                  }
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-sans text-xs font-bold text-muted">{String(index + 1).padStart(2, '0')}</span>
                    {link.label}
                  </span>
                  <ArrowRight className="h-5 w-5 opacity-60" aria-hidden />
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink to="/quiz" size="lg" fullWidth iconRight={<ArrowRight />}>
              {t.nav.start}
            </ButtonLink>
            <ButtonLink to={user ? '/dashboard' : '/connexion'} variant="outline" size="lg" fullWidth>
              {user ? t.nav.dashboard : t.nav.login}
            </ButtonLink>
          </div>
          <div className="mt-auto flex items-center justify-between pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{t.brand.tagline}</p>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </>
  );
}
