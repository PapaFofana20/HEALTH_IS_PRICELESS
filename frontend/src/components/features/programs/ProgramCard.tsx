import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkCheck, CalendarDays, Dumbbell, Gauge, Lock, Timer } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { PlanBadge } from '../../ui/Badge';
import type { Program } from '../../../types';

interface ProgramCardProps {
  program: Program;
  /** Quiz compatibility score (0100) */
  matchScore?: number;
  /** Optional ribbon label (e.g. "Best match") */
  highlight?: string;
  className?: string;
}

export function ProgramCard({ program, matchScore, highlight, className }: ProgramCardProps) {
  const { t, loc } = useLanguage();
  const { isFavorite, toggleFavorite } = useAuth();
  const premium = program.plan === 'premium';
  const favorite = isFavorite(program.id);
  const name = loc(program.name);

  const facts = [
    { icon: Gauge, label: t.levels[program.level] },
    { icon: CalendarDays, label: t.common.weeks(program.durationWeeks) },
    { icon: Dumbbell, label: t.common.sessionsWeekShort(program.sessionsPerWeek) },
    { icon: Timer, label: t.common.minutes(program.sessionMinutes) },
  ];

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-night-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-volt',
        premium ? 'border-volt/35 hover:border-volt/80' : 'border-edge hover:border-edge-strong',
        highlight && 'border-volt',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={program.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <PlanBadge plan={program.plan} />
          {highlight && (
            <span className="rounded-sm bg-ink px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-night-900">{highlight}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(program.id)}
          aria-pressed={favorite}
          aria-label={`${favorite ? t.common.removeFavorite : t.common.addFavorite}  ${name}`}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-ink/15 bg-night-900/70 text-ink backdrop-blur transition-colors duration-200 hover:border-volt hover:text-volt"
        >
          {favorite ? <BookmarkCheck className="h-4 w-4 text-volt" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        </button>
        {matchScore !== undefined && (
          <span className="absolute bottom-3 left-3 rounded-full bg-night-900/85 px-3 py-1 text-xs font-extrabold text-volt backdrop-blur">
            {t.quiz.match(matchScore)}
          </span>
        )}
        {premium && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-sm bg-night-900/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-volt backdrop-blur">
            <Lock className="h-3 w-3" aria-hidden />
            {t.common.premiumContent}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-volt">{t.goals[program.goal]}</p>
        <h3 className="mt-2 font-display text-[1.65rem] uppercase leading-[1.05] tracking-wide">
          <Link to={`/programmes/${program.id}`} className="outline-none after:absolute after:inset-0 after:content-['']">
            {name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{loc(program.tagline)}</p>
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-edge pt-4 text-xs font-semibold text-ink/85">
          {facts.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink transition-colors duration-200 group-hover:text-volt">
          {t.common.viewProgram}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </article>
  );
}
