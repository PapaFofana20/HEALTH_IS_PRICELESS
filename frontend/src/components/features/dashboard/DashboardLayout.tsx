import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { DashboardSidebar } from './Sidebar';
import type { DashboardSection } from './Sidebar';
import { NoticeBanner } from './Widgets';

interface DashboardLayoutProps {
  active: DashboardSection;
  notice: string | null;
  onNoticeClose: () => void;
  children: ReactNode;
}

/** Shell shared by every dashboard section: sidebar + responsive main column. */
export function DashboardLayout({ active, notice, onNoticeClose, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-night-900 text-ink">
      <DashboardSidebar active={active} />
      <div className="lg:pl-72">
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          {notice && <NoticeBanner message={notice} onClose={onNoticeClose} />}
          {children}
        </main>
      </div>
    </div>
  );
}

/** Page heading used across the dashboard views. */
export function ViewHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div aria-hidden className="mb-4 h-1 w-12 rounded-full bg-volt" />
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

/** Current membership pill shown on the dashboard home. */
export function TierPill() {
  const { t } = useLanguage();
  const { tier } = useAuth();
  return (
    <Link
      to={tier === 'premium' ? '/dashboard/parametres' : '/tarifs'}
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors',
        tier === 'premium' ? 'border-volt/40 bg-volt/10 text-volt' : 'border-edge text-ink hover:border-volt hover:text-volt',
      )}
    >
      <Crown className="h-4 w-4" aria-hidden />
      {t.dashboard.tierLabel} · {t.tiers[tier]}
    </Link>
  );
}
