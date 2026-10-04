import { ArrowRight, Dumbbell } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useLanguage } from '../../../../hooks/useLanguage';
import { PlanBadge, Tag } from '../../../ui/Badge';
import { ButtonLink } from '../../../ui/Button';
import { EmptyState } from '../../../ui/States';
import { NextSessionCard, ProgressBar } from '../Widgets';
import { ViewHeader } from '../DashboardLayout';
import { typeIcons } from '../constants';
import type { DayStatus, Program, WorkoutSession } from '../../../../types';

interface ProgramViewProps {
  program: Program | null;
  currentWeek: number;
  weekStatus: DayStatus[];
  onComplete: (session: WorkoutSession) => void;
}

export function ProgramView({ program, currentWeek, weekStatus, onComplete }: ProgramViewProps) {
  const { t, loc } = useLanguage();

  if (!program) {
    return (
      <>
        <ViewHeader title={t.dashboard.program.title} subtitle={t.dashboard.program.subtitle} />
        <EmptyState
          icon={<Dumbbell aria-hidden />}
          title={t.dashboard.noProgramTitle}
          text={t.dashboard.noProgramText}
          action={
            <>
              <ButtonLink to="/quiz">{t.dashboard.takeQuiz}</ButtonLink>
              <ButtonLink to="/programmes" variant="outline">
                {t.dashboard.browsePrograms}
              </ButtonLink>
            </>
          }
        />
      </>
    );
  }

  const percent = Math.round((Math.min(currentWeek, program.durationWeeks) / program.durationWeeks) * 100);

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <ViewHeader
        title={t.dashboard.program.title}
        subtitle={t.dashboard.program.subtitle}
        action={
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/dashboard/seances" variant="outline" size="sm">
              {t.dashboard.nav.seances}
            </ButtonLink>
            <ButtonLink to="/programmes" variant="outline" size="sm">
              {t.dashboard.program.change}
            </ButtonLink>
          </div>
        }
      />
      <article className="relative overflow-hidden rounded-2xl border border-edge/70 bg-night-800/70 transition-colors duration-300 hover:border-edge-strong">
        <img src={program.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-night-800 via-night-800/90 to-night-800/40" />
        <div className="relative p-6 sm:p-10">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <PlanBadge plan={program.plan} />
            <Tag tone="volt" className="bg-night-900/60">
              {t.goals[program.goal]}
            </Tag>
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">{loc(program.name)}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{loc(program.tagline)}</p>
          <div className="mt-6 max-w-md sm:mt-8">
            <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-[0.18em]">
              <span className="text-muted">{t.dashboard.program.weekOf(currentWeek, program.durationWeeks)}</span>
              <span className="text-volt">{percent}%</span>
            </div>
            <ProgressBar value={percent} label={t.dashboard.program.progress} className="mt-3 h-2" />
          </div>
          <ButtonLink to={`/programmes/${program.id}`} className="mt-8" iconRight={<ArrowRight />}>
            {t.dashboard.program.details}
          </ButtonLink>
        </div>
      </article>

      <NextSessionCard program={program} session={program.sessions[0] ?? null} onComplete={onComplete} />

      <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-all duration-300 hover:border-edge-strong sm:p-8">
          <h2 className="font-display text-2xl uppercase tracking-tight">{t.dashboard.program.thisWeek}</h2>
          <ol className="mt-6 divide-y divide-edge">
            {program.weekPlan.map((day, index) => {
              const status = weekStatus[index] ?? 'planned';
              const Icon = typeIcons[day.type];
              return (
                <li key={index} className="flex min-w-0 items-center gap-3 py-3.5 sm:gap-4 sm:py-4">
                  <span className="w-6 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.dashboard.days[index]}</span>
                  <Icon className={cn('h-4 w-4 shrink-0', day.type === 'rest' ? 'text-muted' : 'text-volt')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate font-bold tracking-tight', day.type === 'rest' && 'text-muted')}>{loc(day.title)}</span>
                    <span className="mt-0.5 block text-xs text-muted">{day.type === 'rest' ? t.dayTypes.rest : t.common.minutes(day.minutes)}</span>
                  </span>
                  <Tag tone={status === 'done' || status === 'today' ? 'volt' : 'default'}>{t.dashboard.dayStates[status]}</Tag>
                </li>
              );
            })}
          </ol>
        </article>
        <article className="min-w-0 rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-all duration-300 hover:border-edge-strong sm:p-8">
          <h2 className="font-display text-2xl uppercase tracking-tight">{t.dashboard.program.sessions}</h2>
          <ul className="mt-6 space-y-3 sm:space-y-4">
            {program.sessions.map((session) => (
              <li key={session.id} className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-edge/70 bg-night-900/60 p-4 transition-colors duration-300 hover:border-edge-strong sm:p-5">
                <div className="min-w-0">
                  <p className="truncate font-bold tracking-tight">{loc(session.title)}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{loc(session.focus)}</p>
                </div>
                <div className="shrink-0 text-right text-xs font-bold text-ink/80">
                  <p>{t.common.minutes(session.minutes)}</p>
                  <p className="mt-0.5 text-muted">{t.common.exercises(session.exercises.length)}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}
