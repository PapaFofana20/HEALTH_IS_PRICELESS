import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage';
import { freeServices } from '../../../../data/services';
import type { Program, User } from '../../../../types';
import { SectionHeading } from '../../../ui/SectionHeading';
import { Reveal } from '../../../ui/Reveal';
import { ServiceCard } from '../ServiceCard';
import { PlanShowcaseCard } from '../PlanShowcaseCard';
import { TierPill } from '../DashboardLayout';

interface HomeViewProps {
  user: User;
  program: Program | null;
}

export function HomeView({ user, program }: HomeViewProps) {
  const { t, loc, fmtDate } = useLanguage();
  const today = fmtDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-12 lg:space-y-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted">{today}</p>
          <h1 className="mt-2 animate-fade-up font-display text-4xl uppercase leading-none sm:text-5xl">
            {t.dashboard.greeting(user.firstName)}
          </h1>
          <p className="mt-2 animate-fade-up text-muted [animation-delay:80ms]">{t.dashboard.home.question}</p>
        </div>
        <TierPill />
      </header>

      {program && (
        <Reveal>
          <Link
            to="/dashboard/programme"
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-volt/30 bg-night-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rotate-12 pattern-stripes opacity-10" />
            <div className="relative min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">
                <CalendarDays className="h-4 w-4" aria-hidden />
                {t.dashboard.home.activeTitle}
              </p>
              <p className="mt-1.5 truncate font-display text-2xl uppercase leading-none">{loc(program.name)}</p>
            </div>
            <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-volt bg-volt px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-night-900 transition-colors group-hover:bg-volt-dark">
              {t.dashboard.home.activeCta}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        </Reveal>
      )}

      <section aria-labelledby="home-services-title">
        <Reveal>
          <SectionHeading
            id="home-services-title"
            title={t.dashboard.home.freeTitle}
            subtitle={t.dashboard.home.freeSubtitle}
            action={
              <Link
                to="/dashboard/services"
                className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt transition-colors hover:text-volt-dark"
              >
                {t.dashboard.home.seeAll}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {freeServices.map((service, index) => (
            <Reveal key={service.key} delay={Math.min(index * 50, 200)} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-programs-title">
        <Reveal>
          <SectionHeading
            id="home-programs-title"
            title={t.dashboard.home.programsTitle}
            subtitle={t.dashboard.home.programsSubtitle}
            action={
              <Link
                to="/dashboard/programmes"
                className="group inline-flex shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt transition-colors hover:text-volt-dark"
              >
                {t.dashboard.home.seePrograms}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <PlanShowcaseCard plan="standard" />
          </Reveal>
          <Reveal delay={100} className="h-full">
            <PlanShowcaseCard plan="premium" />
          </Reveal>
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-muted">{t.plans.note}</p>
      </section>
    </div>
  );
}
