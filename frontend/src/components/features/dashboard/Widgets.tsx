import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Check, CircleCheck, Crown, Dumbbell, ListChecks, Moon, Play, Timer, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { clamp } from '../../../utils/fitness';
import { useLanguage } from '../../../hooks/useLanguage';
import { getExerciseById } from '../../../data/exercises';
import { Tag } from '../../ui/Badge';
import { Button, ButtonLink } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmptyState } from '../../ui/States';
import type { DayStatus, Program, WorkoutSession } from '../../../types';

/* ---------- Animated progress bar ---------- */
export function ProgressBar({ value, label, className, tone = 'volt' }: { value: number; label: string; className?: string; tone?: 'volt' | 'success' }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(clamp(value, 0, 100)));
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamp(value, 0, 100))}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 overflow-hidden rounded-full bg-night-700', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-1000 ease-out', tone === 'volt' ? 'bg-volt' : 'bg-success')}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/* ---------- Stat card ---------- */
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  progress?: number;
  accent?: boolean;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, suffix, progress, accent, className }: StatCardProps) {
  return (
    <article className={cn('relative overflow-hidden rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-xl hover:shadow-black/20', className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-extrabold uppercase leading-relaxed tracking-[0.18em] text-muted">{label}</p>
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-lg shadow-black/20', accent ? 'bg-volt text-night-900' : 'bg-night-700 text-volt')}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-5 font-display text-4xl leading-[0.95] tracking-tight">
        {value}
        {suffix && <span className="ml-1.5 font-sans text-sm font-bold text-muted">{suffix}</span>}
      </p>
      {progress !== undefined && <ProgressBar value={progress} label={label} className="mt-5" />}
    </article>
  );
}

/* ---------- Next session + session player ---------- */
interface NextSessionCardProps {
  program: Program | null;
  session: WorkoutSession | null;
  onComplete: (session: WorkoutSession) => void;
}

export function NextSessionCard({ program, session, onComplete }: NextSessionCardProps) {
  const { t, loc } = useLanguage();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  if (!program || !session) {
    return (
      <EmptyState
        className="h-full"
        icon={<Dumbbell aria-hidden />}
        title={t.dashboard.noProgramTitle}
        text={t.dashboard.noProgramText}
        action={
          <>
            <ButtonLink to="/quiz" size="sm">
              {t.dashboard.takeQuiz}
            </ButtonLink>
            <ButtonLink to="/programmes" size="sm" variant="outline">
              {t.dashboard.browsePrograms}
            </ButtonLink>
          </>
        }
      />
    );
  }

  const total = session.exercises.length;
  const percent = total ? (checked.length / total) * 100 : 0;
  const toggle = (key: string) => setChecked((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
  const finish = () => {
    onComplete(session);
    setFinished(true);
    setOpen(false);
    setChecked([]);
  };

  return (
    <article className="relative h-full overflow-hidden rounded-2xl border border-edge/70 bg-night-800/70 shadow-xl shadow-black/20">
      <img src={program.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-night-800 via-night-800/85 to-night-800/20" />
      <div className="relative flex h-full flex-col p-6 sm:p-10">
        <Tag tone="volt" className="w-fit">
          {t.dashboard.nextSession}
        </Tag>
        <h2 className="mt-5 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">{loc(session.title)}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{loc(session.focus)}</p>
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
          <li className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-volt" aria-hidden />
            {t.common.minutes(session.minutes)}
          </li>
          <li className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-volt" aria-hidden />
            {t.common.exercises(total)}
          </li>
          <li className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-volt" aria-hidden />
            {loc(program.name)}
          </li>
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
          <Button size="lg" icon={<Play className="fill-current" />} onClick={() => setOpen(true)}>
            {t.dashboard.startSession}
          </Button>
          <ButtonLink to={`/programmes/${program.id}`} variant="outline" size="lg">
            {t.dashboard.viewProgram}
          </ButtonLink>
        </div>
        {finished && (
          <p role="status" className="mt-5 flex items-center gap-2 text-sm font-bold text-success">
            <CircleCheck className="h-4 w-4" aria-hidden />
            {t.dashboard.player.done}
          </p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={loc(session.title)} description={t.dashboard.player.hint}>
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.18em]">
          <span className="text-muted">{t.dashboard.player.progress(checked.length, total)}</span>
          <span className="text-volt">{Math.round(percent)}%</span>
        </div>
        <ProgressBar value={percent} label={t.dashboard.player.progress(checked.length, total)} className="mt-3" />
        <ul className="mt-6 space-y-2.5">
          {session.exercises.map((item, index) => {
            const exercise = getExerciseById(item.exerciseId);
            const key = `${item.exerciseId}-${index}`;
            const isChecked = checked.includes(key);
            return (
              <li key={key}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors duration-200 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-volt',
                    isChecked ? 'border-volt/60 bg-volt/10' : 'border-edge/70 hover:border-edge-strong',
                  )}
                >
                  <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggle(key)} />
                  <span
                    aria-hidden
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors duration-200',
                      isChecked ? 'border-volt bg-volt text-night-900' : 'border-edge-strong',
                    )}
                  >
                    {isChecked && <Check className="h-4 w-4" />}
                  </span>
                  {exercise && <img src={exercise.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
                  <span className="min-w-0 flex-1">
                    <span className={cn('block font-bold', isChecked && 'line-through decoration-volt/70')}>
                      {exercise ? loc(exercise.name) : item.exerciseId}
                    </span>
                    <span className="text-xs text-muted">
                      {item.sets} × {loc(item.reps)} · {t.dashboard.player.rest} {item.restSeconds} s
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={finish} disabled={checked.length === 0} icon={<CircleCheck />}>
            {t.dashboard.player.finish}
          </Button>
        </div>
      </Modal>
    </article>
  );
}

/* ---------- Week strip ---------- */
const dayIcons: Record<DayStatus, LucideIcon> = { done: Check, planned: Dumbbell, rest: Moon, today: Play, missed: X };
const dayStyles: Record<DayStatus, string> = {
  done: 'border-volt bg-volt text-night-900',
  today: 'border-volt text-volt ring-2 ring-volt/25',
  planned: 'border-edge-strong text-ink',
  rest: 'border-dashed border-edge text-muted',
  missed: 'border-danger/50 text-danger',
};
const legendColors: Record<DayStatus, string> = {
  done: 'bg-volt',
  today: 'border border-volt',
  planned: 'border border-edge-strong',
  rest: 'border border-dashed border-edge',
  missed: 'bg-danger',
};

export function WeekStrip({ statuses }: { statuses: DayStatus[] }) {
  const { t } = useLanguage();
  const done = statuses.filter((status) => status === 'done').length;
  const planned = statuses.filter((status) => status !== 'rest').length;
  return (
    <article className="h-full rounded-2xl border border-edge/70 bg-night-800/70 p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl uppercase leading-tight tracking-tight">{t.dashboard.weekTitle}</h2>
        <span className="rounded-full bg-volt/10 px-3 py-1 text-xs font-extrabold text-volt">
          {done}/{planned}
        </span>
      </div>
      <ol className="mt-7 grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {statuses.map((status, index) => {
          const Icon = dayIcons[status];
          return (
            <li key={index} className="flex min-w-0 flex-col items-center gap-2">
              <span aria-hidden className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">
                {t.dashboard.days[index]}
              </span>
              <span
                title={t.dashboard.dayStates[status]}
                className={cn('grid aspect-square w-full max-w-12 place-items-center rounded-xl border transition-all duration-200', dayStyles[status])}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="sr-only">
                {t.dashboard.days[index]} : {t.dashboard.dayStates[status]}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-7 grid grid-cols-2 gap-2.5 text-[11px] font-semibold text-muted/80">
        {(['done', 'today', 'planned', 'rest'] as DayStatus[]).map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full', legendColors[status])} />
            {t.dashboard.dayStates[status]}
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ---------- Banners ---------- */
export function UpgradeBanner() {
  const { t } = useLanguage();
  return (
    <article className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-volt/25 bg-night-800/70 p-6 shadow-xl shadow-black/20 sm:p-8 sm:flex-row sm:items-center sm:justify-between">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/3 pattern-stripes opacity-[0.07] fade-mask-left" />
      <div className="relative flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-volt text-night-900 shadow-lg shadow-black/20">
          <Crown className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-display text-2xl uppercase leading-tight tracking-tight">{t.dashboard.upgrade.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.dashboard.upgrade.text}</p>
        </div>
      </div>
      <ButtonLink to="/tarifs" className="relative shrink-0" iconRight={<ArrowRight />}>
        {t.dashboard.upgrade.cta}
      </ButtonLink>
    </article>
  );
}

export function NoticeBanner({ message, onClose }: { message: string; onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div role="status" className="mb-8 flex animate-fade-up items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4 text-sm font-semibold text-ink shadow-lg shadow-black/20">
      <CircleCheck className="h-5 w-5 shrink-0 text-success" aria-hidden />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t.common.close}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
