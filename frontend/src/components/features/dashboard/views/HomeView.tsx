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
    <div className="min-w-0">
      <header className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{today}</p>
          <h1 className="mt-3  font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            {t.dashboard.greeting(user.firstName)}
          </h1>
          <p className="mt-3 max-w-xl  text-sm leading-relaxed text-muted sm:text-base">{t.dashboard.home.question}</p>
        </div>
        <div className="shrink-0">
          <TierPill />
        </div>
      </header>

      {program && (
        <div className="mt-10 sm:mt-12">
          <Reveal>
            <Link
              to="/dashboard/programme"
              className="group relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-2xl border border-volt/30 bg-night-800/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-volt/50 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rotate-12 pattern-stripes opacity-10" />
              <div className="relative min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-volt">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  {t.dashboard.home.activeTitle}
                </p>
                <p className="mt-2 truncate font-display text-2xl uppercase leading-none tracking-tight sm:text-3xl">{loc(program.name)}</p>
              </div>
              <span className="relative inline-flex min-h-[44px] w-fit shrink-0 items-center gap-2 rounded-full border border-volt bg-volt px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-night-900 transition-colors group-hover:bg-volt-dark">
                {t.dashboard.home.activeCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </Reveal>
        </div>
      )}

      <section aria-labelledby="home-services-title" className="mt-10 sm:mt-12">
        <Reveal className="mb-6 sm:mb-8">
          <SectionHeading
            id="home-services-title"
            title={t.dashboard.home.freeTitle}
            subtitle={t.dashboard.home.freeSubtitle}
            action={
              <Link
                to="/dashboard/services"
                className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt transition-colors hover:text-volt-dark"
              >
                {t.dashboard.home.seeAll}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {freeServices.map((service, index) => (
            <Reveal key={service.key} delay={Math.min(index * 50, 200)} className="h-full min-w-0">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-programs-title" className="mt-10 sm:mt-12">
        <Reveal className="mb-6 sm:mb-8">
          <SectionHeading
            id="home-programs-title"
            title={t.dashboard.home.programsTitle}
            subtitle={t.dashboard.home.programsSubtitle}
            action={
              <Link
                to="/dashboard/programmes"
                className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt transition-colors hover:text-volt-dark"
              >
                {t.dashboard.home.seePrograms}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <Reveal className="h-full min-w-0">
            <PlanShowcaseCard plan="standard" />
          </Reveal>
          <Reveal delay={100} className="h-full min-w-0">
            <PlanShowcaseCard plan="premium" />
          </Reveal>
        </div>
        <p className="mt-6 px-4 text-center text-xs font-medium leading-relaxed text-muted">{t.plans.note}</p>
      </section>
    </div>
  );
}
