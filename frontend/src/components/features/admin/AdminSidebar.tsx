import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Receipt,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../ui/Logo';
import { LanguageSwitcher } from '../../layout/LanguageSwitcher';

export type AdminSection = 'overview' | 'members' | 'orders' | 'content' | 'admins';

export const ADMIN_SECTIONS: { key: AdminSection; to: string; icon: LucideIcon }[] = [
  { key: 'overview', to: '/admin', icon: LayoutDashboard },
  { key: 'members', to: '/admin/members', icon: Users },
  { key: 'orders', to: '/admin/orders', icon: Receipt },
  { key: 'content', to: '/admin/content', icon: BookOpen },
  { key: 'admins', to: '/admin/admins', icon: ShieldCheck },
];

type NavGroupKey = 'pilotage' | 'catalog';

/** Grouped navigation — labels come from `t.admin.navGroups`. */
const ADMIN_NAV_GROUPS: { label: NavGroupKey; keys: AdminSection[] }[] = [
  { label: 'pilotage', keys: ['overview', 'members', 'orders', 'admins'] },
  { label: 'catalog', keys: ['content'] },
];

const NAV_GROUP_LABEL = 'px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';

export function AdminSidebar({ active }: { active: AdminSection }) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const byKey = new Map(ADMIN_SECTIONS.map((item) => [item.key, item]));
  const groups = ADMIN_NAV_GROUPS.map((group) => ({
    label: group.label,
    items: group.keys.flatMap((key) => {
      const item = byKey.get(key);
      return item ? [item] : [];
    }),
  }));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden border-r border-edge bg-night-950 lg:flex">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-volt/10 blur-3xl" />
        <div className="relative flex h-20 items-center border-b border-edge px-6">
          <Logo />
        </div>

        {/* Admin card */}
        <div className="relative border-b border-edge px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-edge/70 bg-night-800/70 p-3.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-volt to-volt-dark font-display text-xl text-night-900"
            >
              {user.firstName.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-volt">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {t.admin.role}
              </p>
            </div>
            <Link
              to="/dashboard"
              aria-label={t.dashboard.nav.accueil}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-edge text-muted transition-colors hover:border-volt/50 hover:text-volt"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Grouped navigation */}
        <nav aria-label={t.admin.navLabel} className="scrollbar-slim relative flex-1 overflow-y-auto px-4 py-5">
          {groups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className={NAV_GROUP_LABEL}>{t.admin.navGroups[group.label]}</p>
              <ul className="mt-1 space-y-1">
                {group.items.map(({ key, to, icon: Icon }) => {
                  const isActive = active === key;
                  return (
                    <li key={key}>
                      <Link
                        to={to}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-150',
                          isActive ? 'bg-volt/10 text-ink' : 'text-muted hover:bg-night-800/60 hover:text-ink',
                        )}
                      >
                        {isActive && (
                          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt" />
                        )}
                        <Icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0 transition-colors',
                            isActive ? 'text-volt' : 'text-muted group-hover:text-ink',
                          )}
                          aria-hidden
                        />
                        <span className="truncate">{t.admin.nav[key]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative border-t border-edge px-4 py-4">
          <div className="divide-y divide-edge overflow-hidden rounded-2xl border border-edge/70 bg-night-800/70">
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
      <div className="sticky top-0 z-40 border-b border-edge bg-night-950/95 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo compact />
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-volt/40 bg-volt/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-volt sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t.admin.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-edge text-muted transition-colors hover:border-danger/50 hover:text-danger"
            >
              <LogOut className="h-[18px] w-[18px]" aria-hidden />
              <span className="sr-only">{t.dashboard.logout}</span>
            </button>
          </div>
        </div>
        <nav aria-label={t.admin.navLabel} className="scrollbar-none overflow-x-auto px-4 pb-4 pt-1 sm:px-6">
          <ul className="flex w-max gap-2.5">
            {ADMIN_SECTIONS.map(({ key, to, icon: Icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  aria-current={active === key ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                    active === key ? 'border-volt bg-volt text-night-900' : 'border-edge text-muted hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {t.admin.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
