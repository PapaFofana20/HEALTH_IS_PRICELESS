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
    <div className="space-y-6">
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
      <article className="relative overflow-hidden rounded-2xl border border-edge bg-night-800">
        <img src={program.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-night-800 via-night-800/90 to-night-800/40" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <PlanBadge plan={program.plan} />
            <Tag tone="volt" className="bg-night-900/60">
              {t.goals[program.goal]}
            </Tag>
          </div>
          <h2 className="mt-4 font-display text-5xl uppercase leading-none sm:text-6xl">{loc(program.name)}</h2>
          <p className="mt-2 max-w-xl text-muted">{loc(program.tagline)}</p>
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-[0.14em]">
              <span className="text-muted">{t.dashboard.program.weekOf(currentWeek, program.durationWeeks)}</span>
              <span className="text-volt">{percent}%</span>
            </div>
            <ProgressBar value={percent} label={t.dashboard.program.progress} className="mt-2 h-2" />
          </div>
          <ButtonLink to={`/programmes/${program.id}`} className="mt-8" iconRight={<ArrowRight />}>
            {t.dashboard.program.details}
          </ButtonLink>
        </div>
      </article>

      <NextSessionCard program={program} session={program.sessions[0] ?? null} onComplete={onComplete} />

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-edge bg-night-800 p-6">
          <h2 className="font-display text-2xl uppercase">{t.dashboard.program.thisWeek}</h2>
          <ol className="mt-4 divide-y divide-edge">
            {program.weekPlan.map((day, index) => {
              const status = weekStatus[index] ?? 'planned';
              const Icon = typeIcons[day.type];
              return (
                <li key={index} className="flex items-center gap-4 py-3">
                  <span className="w-6 text-[11px] font-extrabold uppercase text-muted">{t.dashboard.days[index]}</span>
                  <Icon className={cn('h-4 w-4 shrink-0', day.type === 'rest' ? 'text-muted' : 'text-volt')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block font-bold', day.type === 'rest' && 'text-muted')}>{loc(day.title)}</span>
                    <span className="text-xs text-muted">{day.type === 'rest' ? t.dayTypes.rest : t.common.minutes(day.minutes)}</span>
                  </span>
                  <Tag tone={status === 'done' || status === 'today' ? 'volt' : 'default'}>{t.dashboard.dayStates[status]}</Tag>
                </li>
              );
            })}
          </ol>
        </article>
        <article className="rounded-xl border border-edge bg-night-800 p-6">
          <h2 className="font-display text-2xl uppercase">{t.dashboard.program.sessions}</h2>
          <ul className="mt-4 space-y-3">
            {program.sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-4 rounded-lg border border-edge bg-night-900 p-4">
                <div className="min-w-0">
                  <p className="font-bold">{loc(session.title)}</p>
                  <p className="truncate text-xs text-muted">{loc(session.focus)}</p>
                </div>
                <div className="shrink-0 text-right text-xs font-bold text-ink/80">
                  <p>{t.common.minutes(session.minutes)}</p>
                  <p className="text-muted">{t.common.exercises(session.exercises.length)}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}