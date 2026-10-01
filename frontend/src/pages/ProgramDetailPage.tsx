import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Crown,
  Dumbbell,
  Footprints,
  Gauge,
  HeartPulse,
  Lock,
  MapPin,
  Moon,
  Play,
  Star,
  Timer,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { coaches, programs } from '../data/programs';
import { getExerciseById } from '../data/exercises';
import { ProgramCard } from '../components/features/programs/ProgramCard';
import { ExerciseDetail } from '../components/features/exercises/ExerciseCard';
import { PlanBadge, Tag } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Eyebrow, SectionHeading, container } from '../components/ui/SectionHeading';
import { ErrorState, LockedContent, NotFoundState, Skeleton } from '../components/ui/States';
import type { DayType, Exercise, WorkoutSession } from '../types';

const dayTypeIcon: Record<DayType, LucideIcon> = {
  strength: Dumbbell,
  cardio: HeartPulse,
  hiit: Zap,
  mobility: Footprints,
  rest: Moon,
};

const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted';

function DetailSkeleton() {
  return (
    <div className={cn(container, 'pb-20 pt-28 lg:pt-36')} role="status">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-8 h-6 w-48" />
      <Skeleton className="mt-5 h-20 w-3/4" />
      <Skeleton className="mt-4 h-6 w-1/2" />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export default function ProgramDetailPage() {
  const { id = '' } = useParams();
  const { t, loc, fmtNumber } = useLanguage();
  const { user, tier, startProgram, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const { data: program, loading, error, refetch } = useAsync(() => api.getProgram(id), [id]);
  const [openWeek, setOpenWeek] = useState(1);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  usePageTitle(program ? loc(program.name) : t.nav.programs);

  if (loading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className={cn(container, 'pb-20 pt-32')}>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }
  if (!program) {
    return <NotFoundState title={t.programDetail.notFoundTitle} text={t.programDetail.notFoundText} backTo="/programmes" backLabel={t.programDetail.back} />;
  }

  const premiumLocked = program.plan === 'premium' && tier !== 'premium';
  const hasAccess = program.plan === 'premium' ? tier === 'premium' : tier !== 'free';
  const isCurrent = user?.currentProgramId === program.id;
  const favorite = isFavorite(program.id);
  const coach = coaches.find((c) => c.id === program.coachId);
  const related = programs.filter((p) => p.goal === program.goal && p.id !== program.id).slice(0, 3);
  const weeks = Array.from({ length: program.durationWeeks }, (_, i) => i + 1);
  const phaseFor = (week: number) => program.phases.find((phase) => week >= phase.from && week <= phase.to);

  const handleStart = () => {
    if (isCurrent) {
      navigate('/dashboard/programme');
      return;
    }
    if (hasAccess) {
      startProgram(program.id);
      navigate('/dashboard/programme', { state: { notice: t.programDetail.startedNotice } });
      return;
    }
    if (!user) {
      navigate(`/connexion?mode=register&plan=${program.plan}`);
      return;
    }
    navigate('/tarifs');
  };

  const ctaLabel = isCurrent
    ? t.programDetail.current
    : hasAccess
      ? t.programDetail.start
      : program.plan === 'premium'
        ? t.common.unlockPremium
        : user
          ? t.programDetail.chooseStandard
          : t.programDetail.createAccount;
  const ctaIcon = isCurrent ? <Check /> : hasAccess ? <Play className="fill-current" /> : program.plan === 'premium' ? <Crown /> : undefined;
  const accessText = hasAccess
    ? t.programDetail.accessYours
    : !user
      ? t.programDetail.accessGuest
      : program.plan === 'premium'
        ? t.programDetail.accessPremium
        : t.programDetail.accessStandard;

  const facts = [
    { icon: CalendarDays, label: t.programDetail.facts.duration, value: t.common.weeks(program.durationWeeks) },
    { icon: Gauge, label: t.programDetail.facts.level, value: t.levels[program.level] },
    { icon: Dumbbell, label: t.programDetail.facts.frequency, value: t.common.sessionsWeekShort(program.sessionsPerWeek) },
    { icon: Timer, label: t.programDetail.facts.sessionLength, value: t.common.minutes(program.sessionMinutes) },
    { icon: MapPin, label: t.programDetail.facts.location, value: t.locations[program.location] },
  ];

  const weekDays = (
    <ol className="divide-y divide-edge">
      {program.weekPlan.map((day, index) => {
        const Icon = dayTypeIcon[day.type];
        const rest = day.type === 'rest';
        return (
          <li key={index} className="flex items-center gap-4 py-3">
            <span className="w-14 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{t.programDetail.day(index + 1)}</span>
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', rest ? 'border border-dashed border-edge text-muted' : 'bg-night-700 text-volt')}>
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block font-bold', rest && 'text-muted')}>{loc(day.title)}</span>
              <span className="text-xs text-muted">{rest ? t.programDetail.restDay : t.dayTypes[day.type]}</span>
            </span>
            {!rest && <span className="shrink-0 text-xs font-bold text-ink/80">{t.common.minutes(day.minutes)}</span>}
          </li>
        );
      })}
    </ol>
  );

  const weekItem = (week: number) => {
    const phase = phaseFor(week);
    const open = openWeek === week;
    return (
      <li key={week} className={cn('rounded-xl border bg-night-800 transition-colors', open ? 'border-edge-strong' : 'border-edge')}>
        <h3>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`week-panel-${week}`}
            onClick={() => setOpenWeek(open ? 0 : week)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="flex flex-wrap items-center gap-3">
              <span className="font-display text-2xl uppercase">{t.programDetail.week(week)}</span>
              {phase && <Tag tone={week === 1 ? 'volt' : 'default'}>{loc(phase.title)}</Tag>}
            </span>
            <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')} aria-hidden />
          </button>
        </h3>
        {open && (
          <div id={`week-panel-${week}`} className="animate-fade-in border-t border-edge px-5 pb-2">
            {phase && (
              <p className="pt-4 text-sm text-muted">
                <span className="font-bold text-ink">{t.programDetail.focus} : </span>
                {loc(phase.description)}
              </p>
            )}
            {weekDays}
          </div>
        )}
      </li>
    );
  };

  const sessionCard = (session: WorkoutSession) => (
    <article className="rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl uppercase">{loc(session.title)}</h3>
          <p className="text-sm text-muted">{loc(session.focus)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag icon={<Timer className="h-3 w-3" aria-hidden />}>{t.common.minutes(session.minutes)}</Tag>
          <Tag>{t.common.exercises(session.exercises.length)}</Tag>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="py-2 pr-3">
                {t.programDetail.exercise}
              </th>
              <th scope="col" className="px-3 py-2">
                {t.programDetail.setsReps}
              </th>
              <th scope="col" className="py-2 pl-3 text-right">
                {t.programDetail.rest}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {session.exercises.map((item, index) => {
              const ex = getExerciseById(item.exerciseId);
              return (
                <tr key={`${item.exerciseId}-${index}`}>
                  <td className="py-2.5 pr-3">
                    {ex ? (
                      <button
                        type="button"
                        onClick={() => setExercise(ex)}
                        className="text-left font-semibold text-ink underline-offset-4 transition-colors hover:text-volt hover:underline"
                      >
                        {loc(ex.name)}
                      </button>
                    ) : (
                      item.exerciseId
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-bold">
                    {item.sets} × {loc(item.reps)}
                  </td>
                  <td className="py-2.5 pl-3 text-right text-muted">{item.restSeconds} s</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-edge pt-16 lg:pt-20">
        <div aria-hidden className="absolute inset-0 -z-10">
          <img src={program.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-night-900 via-night-900/80 to-night-900/40" />
          <div className="absolute inset-0 bg-linear-to-r from-night-900/90 via-night-900/40 to-transparent" />
        </div>
        <div className={cn(container, 'pb-12 pt-10 lg:pb-16 lg:pt-16')}>
          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:text-volt"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t.programDetail.back}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <PlanBadge plan={program.plan} />
            <Tag tone="volt" className="bg-night-900/70">
              {t.goals[program.goal]}
            </Tag>
            <Tag tone="light">{t.levels[program.level]}</Tag>
          </div>
          <h1 className="mt-5 max-w-4xl animate-fade-up font-display text-5xl uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
            {loc(program.name)}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/80">{loc(program.tagline)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-ink/85">
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-volt text-volt" aria-hidden />
              {fmtNumber(program.rating, { minimumFractionDigits: 1 })}/5
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted" aria-hidden />
              {fmtNumber(program.enrolled)} {t.programDetail.enrolled}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleStart} icon={ctaIcon}>
              {ctaLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-pressed={favorite}
              onClick={() => toggleFavorite(program.id)}
              icon={favorite ? <BookmarkCheck className="text-volt" /> : <Bookmark />}
            >
              {favorite ? t.common.removeFavorite : t.common.addFavorite}
            </Button>
          </div>
        </div>
        <div className="border-t border-edge bg-night-900/80 backdrop-blur-md">
          <dl className={cn(container, 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5')}>
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={cn(
                  'flex items-center gap-3 py-5 lg:border-l lg:border-edge lg:pl-6 lg:first:border-l-0 lg:first:pl-0',
                  index === facts.length - 1 && 'col-span-2 sm:col-span-1',
                )}
              >
                <fact.icon className="h-5 w-5 shrink-0 text-volt" aria-hidden />
                <div className="flex flex-col-reverse">
                  <dt className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{fact.label}</dt>
                  <dd className="font-display text-xl uppercase">{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 lg:py-16">
        <div className={cn(container, 'grid gap-10 lg:grid-cols-12')}>
          <div className="min-w-0 space-y-14 lg:col-span-8">
            <div>
              <Eyebrow>{t.programDetail.overview}</Eyebrow>
              <p className="mt-4 text-lg leading-relaxed text-ink/90">{loc(program.description)}</p>
            </div>

            <div>
              <h2 className="font-display text-3xl uppercase sm:text-4xl">{t.programDetail.objectives}</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {loc(program.objectives).map((objective) => (
                  <li key={objective} className="flex items-start gap-3 rounded-xl border border-edge bg-night-800 p-4">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt text-night-900">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-3xl uppercase sm:text-4xl">{t.programDetail.phases}</h2>
              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {program.phases.map((phase, index) => (
                  <li key={phase.from} className="rounded-xl border border-edge bg-night-800 p-5">
                    <span aria-hidden className="font-display text-5xl leading-none txt-outline-volt">
                      0{index + 1}
                    </span>
                    <p className={cn(labelClass, 'mt-3')}>
                      {t.programDetail.weeksRange(phase.from === phase.to ? `${phase.from}` : `${phase.from}–${phase.to}`)}
                    </p>
                    <h3 className="mt-1 font-display text-2xl uppercase">{loc(phase.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{loc(phase.description)}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-display text-3xl uppercase sm:text-4xl">{t.programDetail.weeksTitle}</h2>
              <ul className="mt-6 space-y-3">
                {weekItem(1)}
                {!premiumLocked && weeks.slice(1).map((week) => weekItem(week))}
              </ul>
              {premiumLocked && weeks.length > 1 && (
                <LockedContent className="mt-3" title={t.programDetail.lockedWeeks(weeks.length - 1)} text={t.programDetail.lockedText}>
                  <ul className="space-y-3">
                    {weeks.slice(1, 4).map((week) => (
                      <li key={week} className="flex items-center justify-between rounded-xl border border-edge bg-night-800 px-5 py-4">
                        <span className="font-display text-2xl uppercase">{t.programDetail.week(week)}</span>
                        <Lock className="h-4 w-4" />
                      </li>
                    ))}
                  </ul>
                </LockedContent>
              )}
            </div>

            <div>
              <h2 className="font-display text-3xl uppercase sm:text-4xl">{t.programDetail.sessionsTitle}</h2>
              <div className="mt-6 space-y-4">
                {program.sessions.map((session, index) =>
                  premiumLocked && index > 0 ? (
                    <LockedContent key={session.id} title={t.programDetail.lockedTitle}>
                      {sessionCard(session)}
                    </LockedContent>
                  ) : (
                    <div key={session.id}>{sessionCard(session)}</div>
                  ),
                )}
              </div>
            </div>
          </div>

          <aside className="order-first lg:order-none lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className={cn('rounded-2xl border p-6', program.plan === 'premium' ? 'border-volt/50 bg-night-700' : 'border-edge bg-night-800')}>
                <p className={labelClass}>{t.programDetail.access}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PlanBadge plan={program.plan} />
                  {hasAccess && (
                    <Tag tone="volt" icon={<Check className="h-3 w-3" aria-hidden />}>
                      {t.common.included}
                    </Tag>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink/85">{accessText}</p>
                <Button fullWidth size="lg" className="mt-6" onClick={handleStart} icon={ctaIcon}>
                  {ctaLabel}
                </Button>
              </div>

              {coach && (
                <div className="rounded-2xl border border-edge bg-night-800 p-6">
                  <p className={labelClass}>{t.programDetail.coach}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <img src={coach.avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-volt/50" />
                    <div>
                      <p className="font-bold">{coach.name}</p>
                      <p className="text-xs text-muted">{loc(coach.role)}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{loc(coach.bio)}</p>
                </div>
              )}

              <div className="rounded-2xl border border-edge bg-night-800 p-6">
                <p className={labelClass}>{t.programDetail.equipment}</p>
                <ul className="mt-4 space-y-2.5">
                  {loc(program.equipment).map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-volt" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-edge bg-night-800/40 py-16 lg:py-20">
          <div className={container}>
            <SectionHeading title={t.programDetail.related} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProgramCard key={item.id} program={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Modal open={exercise !== null} onClose={() => setExercise(null)} title={exercise ? loc(exercise.name) : ''}>
        {exercise && <ExerciseDetail exercise={exercise} />}
      </Modal>
    </>
  );
}
