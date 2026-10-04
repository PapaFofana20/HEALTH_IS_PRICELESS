import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Bookmark,
  Calculator,
  CalendarDays,
  ChevronRight,
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

type NavGroupKey = 'main' | 'training' | 'account';

/** Grouped navigation — labels come from `t.dashboard.navGroups`. */
const NAV_GROUPS: { label: NavGroupKey; keys: DashboardSection[] }[] = [
  { label: 'main', keys: ['accueil', 'exercices', 'nutrition', 'calculators', 'conseils', 'services', 'favoris'] },
  { label: 'training', keys: ['programmes', 'programme', 'seances', 'progression'] },
  { label: 'account', keys: ['profil', 'parametres'] },
];

const NAV_GROUP_LABEL = 'px-3 pb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';

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
  const byKey = new Map(items.map((item) => [item.key, item]));
  const groups = NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.keys.flatMap((key) => {
      const item = byKey.get(key);
      return item ? [item] : [];
    }),
  }));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden border-r border-edge/70 bg-night-950 shadow-2xl shadow-black/30 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-volt/10 blur-3xl" />
        <div className="relative flex h-20 items-center border-b border-edge/70 px-5">
          <Logo />
        </div>

        {/* User card */}
        <div className="relative border-b border-edge/70 p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-edge/70 bg-night-800/70 p-3 shadow-lg shadow-black/20">
            <img src={user.avatar} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-volt/40" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-1 truncate text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
                {t.dashboard.tierLabel} ·{' '}
                <span className={tier === 'premium' ? 'text-volt' : 'text-ink'}>{t.tiers[tier]}</span>
              </p>
            </div>
            <Link
              to="/dashboard/profil"
              aria-label={t.dashboard.nav.profil}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-edge/70 bg-night-900/60 text-muted transition-colors hover:border-volt/50 hover:text-volt"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Grouped navigation */}
        <nav aria-label={t.dashboard.navLabel} className="scrollbar-slim relative flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className={NAV_GROUP_LABEL}>{t.dashboard.navGroups[group.label]}</p>
              <ul className="space-y-1">
                {group.items.map(({ key, to, icon: Icon }) => {
                  const isActive = active === key;
                  return (
                    <li key={key}>
                      <Link
                        to={to}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150',
                          isActive ? 'bg-volt/10 text-ink' : 'text-muted hover:bg-night-800/60 hover:text-ink',
                        )}
                      >
                        {isActive && (
                          <span aria-hidden className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-volt" />
                        )}
                        <Icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-volt' : 'text-muted group-hover:text-ink',
                          )}
                          aria-hidden
                        />
                        <span className="truncate">{t.dashboard.nav[key]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {user.role === 'admin' && (
            <div>
              <p className={NAV_GROUP_LABEL}>{t.dashboard.navGroups.admin}</p>
              <ul>
                <li>
                  <Link
                    to="/admin"
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-night-800/60 hover:text-ink"
                  >
                    <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-muted transition-colors group-hover:text-volt" aria-hidden />
                    <span className="truncate">{t.nav.admin}</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="relative space-y-3 border-t border-edge/70 p-3">
          {tier !== 'premium' ? (
            <div className="relative overflow-hidden rounded-2xl border border-volt/20 bg-gradient-to-b from-night-800/80 to-night-900 p-4 shadow-lg shadow-black/20">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-12 pattern-stripes opacity-[0.07]" />
              <p className="relative flex items-center gap-2 font-display text-lg uppercase leading-tight tracking-tight">
                <Crown className="h-4 w-4 text-volt" aria-hidden />
                {t.dashboard.upgrade.title}
              </p>
              <p className="relative mt-2 text-xs leading-relaxed text-muted">{t.dashboard.upgrade.text}</p>
              <ButtonLink to="/tarifs" size="sm" fullWidth className="relative mt-4">
                {t.dashboard.upgrade.cta}
              </ButtonLink>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-2xl border border-volt/25 bg-volt/10 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">
              <Crown className="h-4 w-4 shrink-0" aria-hidden />
              {t.dashboard.premiumActive}
            </p>
          )}
          <div className="divide-y divide-edge/70 overflow-hidden rounded-2xl border border-edge/70 bg-night-800/60">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t.dashboard.backToSite}
              </Link>
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {t.dashboard.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-40 border-b border-edge/70 bg-night-950/95 shadow-lg shadow-black/20 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-2.5">
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
        <nav aria-label={t.dashboard.navLabel} className="scrollbar-none overflow-x-auto px-4 pb-4 sm:px-6">
          <ul className="flex w-max gap-2.5">
            {items.map(({ key, to, icon: Icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  aria-current={active === key ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-all duration-200',
                    active === key ? 'border-volt bg-volt text-night-900 shadow-lg shadow-black/20' : 'border-edge/70 text-muted hover:text-ink',
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
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-edge/70 px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted transition-colors duration-200 hover:border-volt hover:text-volt"
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
