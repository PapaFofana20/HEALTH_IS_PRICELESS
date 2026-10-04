import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import type { DashboardService } from '../../../data/services';

/** Free tool card used on the dashboard home and /dashboard/services. */
export function ServiceCard({ service }: { service: DashboardService }) {
  const { t } = useLanguage();
  const copy = t.dashboard.services.cards[service.key];
  const Icon = service.icon;

  return (
    <Link
      to={service.to}
      className="group flex h-full min-w-0 flex-col rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-xl hover:shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt sm:p-8"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-volt/10 text-volt ring-1 ring-volt/20 transition-colors duration-300 group-hover:bg-volt group-hover:text-night-900">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-6 font-display text-2xl uppercase leading-none tracking-tight">{copy.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{copy.text}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink transition-colors duration-200 group-hover:text-volt">
        {copy.cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
