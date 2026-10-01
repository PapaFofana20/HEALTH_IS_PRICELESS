import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Bookmark,
  Calculator,
  CalendarDays,
  Crown,
  Dumbbell,
  House,
  LayoutGrid,
  Lightbulb,
  LogOut,
  Salad,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../ui/Logo';
import { ButtonLink } from '../../ui/Button';
import { LanguageSwitcher } from '../../layout/LanguageSwitcher';

export type DashboardSection =
  | 'accueil'
  | 'exercices'
  | 'nutrition'
  | 'calculators'
  | 'conseils'
  | 'programmes'
  | 'progression'
  | 'profil'
  | 'parametres'
  | 'services'
  | 'programme'
  | 'seances'
  | 'favoris';

interface NavItem {
  key: DashboardSection;
  to: string;
  icon: LucideIcon;
}

/** Main navigation (drives the sidebar on desktop and the chips on mobile). */
export const DASHBOARD_SECTIONS: NavItem[] = [
  { key: 'accueil', to: '/dashboard', icon: House },
  { key: 'exercices', to: '/dashboard/exercices', icon: Dumbbell },
  { key: 'nutrition', to: '/dashboard/nutrition', icon: Salad },
  { key: 'calculators', to: '/dashboard/calculators', icon: Calculator },
  { key: 'conseils', to: '/dashboard/conseils', icon: Lightbulb },
  { key: 'programmes', to: '/dashboard/programmes', icon: Target },
  { key: 'progression', to: '/dashboard/progression', icon: TrendingUp },
  { key: 'profil', to: '/dashboard/profil', icon: User },
  { key: 'parametres', to: '/dashboard/parametres', icon: Settings },
];

/** Sections that exist as routes but are not listed in the main navigation. */
export const EXTRA_DASHBOARD_SECTIONS: NavItem[] = [
  { key: 'services', to: '/dashboard/services', icon: LayoutGrid },
  { key: 'programme', to: '/dashboard/programme', icon: CalendarDays },
  { key: 'seances', to: '/dashboard/seances', icon: CalendarDays },
  { key: 'favoris', to: '/dashboard/favoris', icon: Bookmark },
];

export const ALL_DASHBOARD_SECTIONS: DashboardSection[] = [...DASHBOARD_SECTIONS, ...EXTRA_DASHBOARD_SECTIONS].map((item) => item.key);

export function DashboardSidebar({ active }: { active: DashboardSection }) {
  const { t } = useLanguage();
  const { user, tier, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const extra = EXTRA_DASHBOARD_SECTIONS.find((item) => item.key === active);
  const items = extra ? [...DASHBOARD_SECTIONS, extra] : DASHBOARD_SECTIONS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-edge bg-night-950 lg:flex">
        <div className="flex h-20 items-center border-b border-edge px-6">
          <Logo />
        </div>
        <div className="flex items-center gap-3 border-b border-edge px-6 py-5">
          <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-volt/60" />
          <div className="min-w-0">
            <p className="truncate font-bold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              {t.dashboard.tierLabel} · <span className={tier === 'premium' ? 'text-volt' : 'text-ink'}>{t.tiers[tier]}</span>
            </p>
          </div>
        </div>
        <nav aria-label={t.dashboard.navLabel} className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {items.map(({ key, to, icon: Icon }) => {
              const isActive = active === key;
              return (
                <li key={key}>
                  <Link
                    to={to}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-colors duration-200',
                      isActive ? 'bg-volt text-night-900' : 'text-muted hover:bg-night-800 hover:text-ink',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                    {t.dashboard.nav[key]}
                  </Link>
                </li>
              );
            })}
            {user.role === 'admin' && (
              <li className="mt-4 border-t border-edge pt-4">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-muted transition-colors duration-200 hover:bg-night-800 hover:text-volt"
                >
                  <ShieldCheck className="h-[18px] w-[18px]" aria-hidden />
                  {t.nav.admin}
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="space-y-4 border-t border-edge p-5">
          {tier !== 'premium' ? (
            <div className="relative overflow-hidden rounded-xl border border-volt/30 bg-night-800 p-4">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rotate-12 pattern-stripes opacity-15" />
              <p className="relative flex items-center gap-2 font-display text-lg uppercase">
                <Crown className="h-4 w-4 text-volt" aria-hidden />
                {t.dashboard.upgrade.title}
              </p>
              <p className="relative mt-1 text-xs leading-relaxed text-muted">{t.dashboard.upgrade.text}</p>
              <ButtonLink to="/tarifs" size="sm" fullWidth className="relative mt-3">
                {t.dashboard.upgrade.cta}
              </ButtonLink>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-lg border border-volt/30 bg-volt/10 px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">
              <Crown className="h-4 w-4" aria-hidden />
              {t.dashboard.premiumActive}
            </p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {t.dashboard.backToSite}
            </Link>
            <LanguageSwitcher />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:bg-night-800 hover:text-danger"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t.dashboard.logout}
          </button>
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-40 border-b border-edge bg-night-950/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/"
              aria-label={t.dashboard.backToSite}
              className="grid h-11 w-11 place-items-center rounded-full border border-edge text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t.dashboard.logout}
              className="grid h-11 w-11 place-items-center rounded-full border border-edge text-muted transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <nav aria-label={t.dashboard.navLabel} className="scrollbar-none overflow-x-auto px-4 pb-3 sm:px-6">
          <ul className="flex w-max gap-2">
            {items.map(({ key, to, icon: Icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  aria-current={active === key ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full border px-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                    active === key ? 'border-volt bg-volt text-night-900' : 'border-edge text-muted hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {t.dashboard.nav[key]}
                </Link>
              </li>
            ))}
            {user.role === 'admin' && (
              <li>
                <Link
                  to="/admin"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-edge px-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors duration-200 hover:border-volt hover:text-volt"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  {t.nav.admin}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
