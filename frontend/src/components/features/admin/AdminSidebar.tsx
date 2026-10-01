import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
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

export type AdminSection = 'overview' | 'members' | 'orders' | 'programs' | 'content';

export const ADMIN_SECTIONS: { key: AdminSection; to: string; icon: LucideIcon }[] = [
  { key: 'overview', to: '/admin', icon: LayoutDashboard },
  { key: 'members', to: '/admin/members', icon: Users },
  { key: 'orders', to: '/admin/orders', icon: Receipt },
  { key: 'programs', to: '/admin/programs', icon: Dumbbell },
  { key: 'content', to: '/admin/content', icon: BookOpen },
];

export function AdminSidebar({ active }: { active: AdminSection }) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-edge bg-night-950 lg:flex">
        <div className="flex h-20 items-center border-b border-edge px-6">
          <Logo />
        </div>
        <div className="flex items-center gap-3 border-b border-edge px-6 py-5">
          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-volt font-display text-lg text-night-900">
            {user.firstName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">
              {user.firstName} {user.lastName}
            </p>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-volt">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {t.admin.role}
            </p>
          </div>
        </div>
        <nav aria-label={t.admin.navLabel} className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1">
            {ADMIN_SECTIONS.map(({ key, to, icon: Icon }) => {
              const isActive = active === key;
              return (
                <li key={key}>
                  <Link
                    to={to}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200',
                      isActive ? 'bg-volt text-night-900' : 'text-muted hover:bg-night-800 hover:text-ink',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden />
                    {t.admin.nav[key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-4 border-t border-edge p-5">
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
        <nav aria-label={t.admin.navLabel} className="scrollbar-none overflow-x-auto px-4 pb-3 sm:px-6">
          <ul className="flex w-max gap-2">
            {ADMIN_SECTIONS.map(({ key, to, icon: Icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  aria-current={active === key ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
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
