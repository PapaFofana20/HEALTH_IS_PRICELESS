import { cn } from '../../utils/cn';
import { AdminSidebar } from '../../components/features/admin/AdminSidebar';
import type { AdminSection } from '../../components/features/admin/AdminSidebar';
import { useLanguage } from '../../hooks/useLanguage';
import type { ReactNode } from 'react';

interface AdminShellProps {
  section: AdminSection;
  view: ReactNode;
}

export function AdminShell({ section, view }: AdminShellProps) {
  const { t } = useLanguage();
  const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';

  return (
    <div className="min-h-screen bg-night-900">
      <AdminSidebar active={section} />
      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          <div>
            <p className={cn(labelClass, 'flex items-center gap-3')}>
              <span aria-hidden className="font-display text-base tracking-[-0.04em] text-volt">
                ///
              </span>
              {t.admin.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
              {t.admin.nav[section]}
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">{t.admin.subtitle}</p>
          </div>
          <div className="mt-8 sm:mt-10">
            {view}
          </div>
        </main>
      </div>
    </div>
  );
}