import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  Crown,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Lock,
  LogIn,
  LogOut,
  Moon,
  Timer,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { calculateCalories } from '../utils/fitness';
import type { CalorieGoal } from '../utils/fitness';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth, isValidEmail } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import type { AsyncState } from '../hooks/useAsync';
import { api } from '../services/api';
import { getProgramById, programs } from '../data/programs';
import { getRecipeById, mealPlans } from '../data/nutrition';
import { DEMO_USER_ID, demoStats, demoWeekStatus, nutritionProfile } from '../data/user';
import { DASHBOARD_SECTIONS, DashboardSidebar } from '../components/features/dashboard/Sidebar';
import type { DashboardSection } from '../components/features/dashboard/Sidebar';
import { NextSessionCard, NoticeBanner, ProgressBar, StatCard, UpgradeBanner, WeekStrip } from '../components/features/dashboard/Widgets';
import { AdvancedStats, ProgressChart } from '../components/features/dashboard/Charts';
import { WeightTracker } from '../components/features/dashboard/WeightTracker';
import { ProgramCard } from '../components/features/programs/ProgramCard';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import { PlanBadge, Tag } from '../components/ui/Badge';
import { Button, ButtonLink } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { EmptyState, ErrorState, LockedContent, Skeleton } from '../components/ui/States';
import type { DashboardStats, DayStatus, DayType, MuscleVolume, Program, Tier, User, WeeklyProgress, WorkoutSession } from '../types';

const VALID_SECTIONS = DASHBOARD_SECTIONS.map((item) => item.key);
const typeIcons: Record<DayType, LucideIcon> = { strength: Dumbbell, cardio: HeartPulse, hiit: Zap, mobility: Footprints, rest: Moon };
const labelClass = 'text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted';

export default function DashboardPage() {
  const { section: rawSection } = useParams();
  const section: DashboardSection = VALID_SECTIONS.includes(rawSection as DashboardSection) ? (rawSection as DashboardSection) : 'overview';
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [notice, setNotice] = useState<string | null>(() => (location.state as { notice?: string } | null)?.notice ?? null);
  usePageTitle(t.dashboard.nav[section]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(id);
  }, [notice]);

  if (!user) return <GuestScreen />;
  return <DashboardShell user={user} section={section} notice={notice} setNotice={setNotice} />;
}

/* ---------- Guest state (not logged in) ---------- */
function GuestScreen() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge bg-night-800 p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-full border border-volt/40 bg-volt/10 text-volt">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase">{t.dashboard.guest.title}</h1>
        <p className="mt-3 text-muted">{t.dashboard.guest.text}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/connexion" icon={<LogIn />}>
            {t.dashboard.guest.login}
          </ButtonLink>
        </div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.dashboard.guest.back}
        </Link>
      </div>
    </section>
  );
}

/* ---------- Shell ---------- */
interface ShellProps {
  user: User;
  section: DashboardSection;
  notice: string | null;
  setNotice: (message: string | null) => void;
}

function DashboardShell({ user, section, notice, setNotice }: ShellProps) {
  const { t } = useLanguage();
  const { tier } = useAuth();
  const isDemo = user.id === DEMO_USER_ID;
  const program = getProgramById(user.currentProgramId);

  const [stats, setStats] = useState<DashboardStats>(() =>
    isDemo
      ? demoStats
      : {
          sessionsDone: 0,
          sessionsTotal: program ? program.sessionsPerWeek * program.durationWeeks : 0,
          streakDays: 0,
          calories: 0,
          currentWeek: user.currentWeek,
          totalWeeks: program?.durationWeeks ?? 0,
        },
  );
  const [weekStatus, setWeekStatus] = useState<DayStatus[]>(() =>
    isDemo
      ? demoWeekStatus
      : program
        ? program.weekPlan.map((day, index): DayStatus => (day.type === 'rest' ? 'rest' : index === 0 ? 'today' : 'planned'))
        : ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
  );

  const progressQuery = useAsync(() => api.getWeeklyProgress(user.id), [user.id]);
  const volumeQuery = useAsync(() => api.getMuscleVolume(user.id), [user.id]);

  const completeSession = (session: WorkoutSession) => {
    setStats((current) => ({
      ...current,
      sessionsDone: current.sessionsDone + 1,
      streakDays: current.streakDays + 1,
      calories: current.calories + Math.round(session.minutes * 8.5),
    }));
    setWeekStatus((days) => {
      const index = days.indexOf('today');
      if (index === -1) return days;
      const next = [...days];
      next[index] = 'done';
      return next;
    });
    setNotice(t.dashboard.player.done);
  };

  return (
    <div className="min-h-screen bg-night-900 text-ink">
      <DashboardSidebar active={section} />
      <div className="lg:pl-72">
        <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {notice && <NoticeBanner message={notice} onClose={() => setNotice(null)} />}
          {section === 'overview' && (
            <OverviewView
              user={user}
              stats={stats}
              program={program}
              weekStatus={weekStatus}
              onComplete={completeSession}
              progressQuery={progressQuery}
              volumeQuery={volumeQuery}
            />
          )}
          {section === 'programme' && <ProgramView program={program} currentWeek={stats.currentWeek} weekStatus={weekStatus} />}
          {section === 'seances' && <SessionsView userId={user.id} />}
          {section === 'progression' && <ProgressView progressQuery={progressQuery} volumeQuery={volumeQuery} locked={tier !== 'premium'} />}
          {section === 'nutrition' && <NutritionView user={user} />}
          {section === 'favoris' && <FavoritesView />}
          {section === 'parametres' && <SettingsView user={user} onNotice={setNotice} />}
        </main>
      </div>
    </div>
  );
}

function ViewHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl uppercase leading-none sm:text-5xl">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function TierPill() {
  const { t } = useLanguage();
  const { tier } = useAuth();
  return (
    <Link
      to={tier === 'premium' ? '/dashboard/parametres' : '/tarifs'}
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors',
        tier === 'premium' ? 'border-volt/40 bg-volt/10 text-volt' : 'border-edge text-ink hover:border-volt hover:text-volt',
      )}
    >
      <Crown className="h-4 w-4" aria-hidden />
      {t.dashboard.tierLabel} � {t.tiers[tier]}
    </Link>
  );
}

/* ---------- Overview ---------- */
interface OverviewProps {
  user: User;
  stats: DashboardStats;
  program: Program | null;
  weekStatus: DayStatus[];
  onComplete: (session: WorkoutSession) => void;
  progressQuery: AsyncState<WeeklyProgress[]>;
  volumeQuery: AsyncState<MuscleVolume[]>;
}

function OverviewView({ user, stats, program, weekStatus, onComplete, progressQuery, volumeQuery }: OverviewProps) {
  const { t, fmtNumber, fmtDate } = useLanguage();
  const { tier } = useAuth();
  const progress = stats.sessionsTotal ? Math.round((stats.sessionsDone / stats.sessionsTotal) * 100) : 0;
  const nextSession = program?.sessions[0] ?? null;
  const today = fmtDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted">{today}</p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-5xl">{t.dashboard.greeting(user.firstName)}</h1>
          <p className="mt-2 text-muted">{t.dashboard.subtitle}</p>
        </div>
        <TierPill />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          icon={Dumbbell}
          label={t.dashboard.stats.sessions}
          value={fmtNumber(stats.sessionsDone)}
          suffix={stats.sessionsTotal ? `/ ${stats.sessionsTotal}` : undefined}
        />
        <StatCard icon={Flame} label={t.dashboard.stats.streak} value={t.dashboard.daysCount(stats.streakDays)} accent />
        <StatCard icon={Zap} label={t.dashboard.stats.calories} value={fmtNumber(stats.calories)} suffix="kcal" />
        <StatCard icon={TrendingUp} label={t.dashboard.stats.progress} value={`${progress}%`} progress={progress} />
        <StatCard
          icon={CalendarDays}
          label={t.dashboard.stats.week}
          value={`${stats.currentWeek}`}
          suffix={stats.totalWeeks ? `/ ${stats.totalWeeks}` : undefined}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <NextSessionCard program={program} session={nextSession} onComplete={onComplete} />
        </div>
        <WeekStrip statuses={weekStatus} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="min-w-0 xl:col-span-3">
          <ProgressChart data={progressQuery.data} loading={progressQuery.loading} error={progressQuery.error} onRetry={progressQuery.refetch} />
        </div>
        <div className="min-w-0 xl:col-span-2">
          <WeightTracker compact />
        </div>
      </div>

      <AdvancedStats locked={tier !== 'premium'} data={volumeQuery.data} loading={volumeQuery.loading} />
      {tier !== 'premium' && <UpgradeBanner />}
    </div>
  );
}

/* ---------- My program ---------- */
function ProgramView({ program, currentWeek, weekStatus }: { program: Program | null; currentWeek: number; weekStatus: DayStatus[] }) {
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
          <ButtonLink to="/programmes" variant="outline" size="sm">
            {t.dashboard.program.change}
          </ButtonLink>
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

/* ---------- Sessions history ---------- */
function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse rounded-xl border border-edge bg-night-800 p-4">
      <dt className={labelClass}>{label}</dt>
      <dd className="mb-2 font-display text-3xl leading-none">{value}</dd>
    </div>
  );
}

function SessionsView({ userId }: { userId: string }) {
  const { t, loc, fmtDate, fmtNumber } = useLanguage();
  const { data, loading, error, refetch } = useAsync(() => api.getWorkoutLogs(userId), [userId]);
  const logs = data ?? [];
  const completed = logs.filter((log) => log.completed);
  const totalMinutes = completed.reduce((sum, log) => sum + log.minutes, 0);
  const totalCalories = completed.reduce((sum, log) => sum + log.calories, 0);

  return (
    <div>
      <ViewHeader title={t.dashboard.sessions.title} subtitle={t.dashboard.sessions.subtitle} />
      {loading ? (
        <div className="space-y-3" role="status">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState title={t.dashboard.sessions.errorTitle} onRetry={refetch} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<CalendarDays aria-hidden />}
          title={t.dashboard.sessions.emptyTitle}
          text={t.dashboard.sessions.emptyText}
          action={<ButtonLink to="/dashboard">{t.dashboard.nav.overview}</ButtonLink>}
        />
      ) : (
        <>
          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            <SummaryStat label={t.dashboard.sessions.count} value={fmtNumber(completed.length)} />
            <SummaryStat label={t.dashboard.sessions.totalTime} value={`${Math.floor(totalMinutes / 60)}h${String(totalMinutes % 60).padStart(2, '0')}`} />
            <SummaryStat label={t.dashboard.sessions.totalCalories} value={fmtNumber(totalCalories)} />
          </dl>
          <ul className="mt-6 space-y-3">
            {logs.map((log) => {
              const Icon = typeIcons[log.type];
              return (
                <li key={log.id} className="flex items-center gap-4 rounded-xl border border-edge bg-night-800 p-4 transition-colors hover:border-edge-strong">
                  <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-lg', log.completed ? 'bg-volt/10 text-volt' : 'bg-danger/10 text-danger')}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{loc(log.title)}</p>
                    <p className="text-xs text-muted">
                      <time dateTime={log.date}>{fmtDate(log.date, { weekday: 'short', day: 'numeric', month: 'short' })}</time> � {t.dayTypes[log.type]}
                    </p>
                  </div>
                  <div className="hidden text-right text-xs font-semibold text-ink/80 sm:block">
                    <p className="flex items-center justify-end gap-1.5">
                      <Timer className="h-3.5 w-3.5 text-muted" aria-hidden />
                      {t.common.minutes(log.minutes)}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-muted" aria-hidden />
                      {fmtNumber(log.calories)} kcal
                    </p>
                  </div>
                  <Tag
                    tone={log.completed ? 'volt' : 'default'}
                    icon={log.completed ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
                    className={cn(!log.completed && 'border-danger/40 text-danger')}
                  >
                    {log.completed ? t.dashboard.sessions.completed : t.dashboard.sessions.missed}
                  </Tag>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ---------- Progress ---------- */
function ProgressView({
  progressQuery,
  volumeQuery,
  locked,
}: {
  progressQuery: AsyncState<WeeklyProgress[]>;
  volumeQuery: AsyncState<MuscleVolume[]>;
  locked: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <ViewHeader title={t.dashboard.progress.title} subtitle={t.dashboard.progress.subtitle} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <ProgressChart data={progressQuery.data} loading={progressQuery.loading} error={progressQuery.error} onRetry={progressQuery.refetch} />
        </div>
        <div className="min-w-0">
          <WeightTracker />
        </div>
      </div>
      <AdvancedStats locked={locked} data={volumeQuery.data} loading={volumeQuery.loading} />
    </div>
  );
}

/* ---------- Nutrition ---------- */
function NutritionView({ user }: { user: User }) {
  const { t, loc, fmtNumber } = useLanguage();
  const { tier } = useAuth();
  const { data: weights } = useAsync(() => api.getWeightEntries(user.id), [user.id]);
  const latest = weights && weights.length ? weights[weights.length - 1].weight : 80;
  const goal: CalorieGoal = user.goal === 'weight-loss' ? 'lose' : 'gain';
  const targets = calculateCalories({
    sex: nutritionProfile.sex,
    age: nutritionProfile.age,
    heightCm: nutritionProfile.heightCm,
    weightKg: latest,
    activity: nutritionProfile.activity,
    goal,
  });
  const macros = [
    { label: t.calc.calories.target, value: targets.target, unit: 'kcal', ratio: 0.64 },
    { label: t.calc.calories.protein, value: targets.protein, unit: 'g', ratio: 0.7 },
    { label: t.calc.calories.carbs, value: targets.carbs, unit: 'g', ratio: 0.55 },
    { label: t.calc.calories.fat, value: targets.fat, unit: 'g', ratio: 0.6 },
  ];
  const plan = mealPlans.find((item) => item.goal === user.goal);
  const items = (plan?.items ?? []).flatMap((item) => {
    const recipe = getRecipeById(item.recipeId);
    return recipe ? [{ item, recipe }] : [];
  });

  const mealList = (
    <ul className="space-y-3">
      {items.map(({ item, recipe }) => (
        <li key={item.recipeId} className="flex items-center gap-4 rounded-lg border border-edge bg-night-900 p-3">
          <img src={recipe.image} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-volt">{t.meals[item.category]}</p>
            <p className="truncate font-bold">{loc(recipe.name)}</p>
          </div>
          <p className="shrink-0 text-right text-xs font-bold">
            {recipe.calories} kcal
            <span className="block text-muted">
              {recipe.protein} g � {t.nutritionPage.protein}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t.dashboard.nutrition.title}
        subtitle={t.dashboard.nutrition.subtitle}
        action={
          <ButtonLink to="/nutrition?section=calculators" variant="outline" size="sm">
            {t.dashboard.nutrition.tools}
          </ButtonLink>
        }
      />
      <article className="rounded-xl border border-edge bg-night-800 p-6">
        <h2 className="font-display text-2xl uppercase">{t.dashboard.nutrition.targets}</h2>
        <p className="text-sm text-muted">{t.dashboard.nutrition.profileHint}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {macros.map((macro) => (
            <div key={macro.label} className="rounded-lg bg-night-900 p-4">
              <p className={labelClass}>{macro.label}</p>
              <p className="mt-2 font-display text-3xl leading-none">
                {fmtNumber(Math.round(macro.value * macro.ratio))}
                <span className="ml-1 font-sans text-xs font-bold text-muted">
                  / {fmtNumber(macro.value)} {macro.unit}
                </span>
              </p>
              <ProgressBar value={macro.ratio * 100} label={macro.label} className="mt-3" />
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-xl border border-edge bg-night-800 p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
          {t.dashboard.nutrition.mealPlan}
          {tier !== 'premium' && <Lock className="h-4 w-4 text-volt" aria-hidden />}
        </h2>
        <div className="mt-5">
          {tier === 'premium' ? (
            mealList
          ) : (
            <LockedContent title={t.dashboard.nutrition.lockedTitle} text={t.dashboard.nutrition.lockedText}>
              {mealList}
            </LockedContent>
          )}
        </div>
      </article>
    </div>
  );
}

/* ---------- Favourites ---------- */
function FavoritesView() {
  const { t } = useLanguage();
  const { favorites } = useAuth();
  const list = programs.filter((program) => favorites.includes(program.id));
  return (
    <div>
      <ViewHeader title={t.dashboard.favorites.title} subtitle={t.dashboard.favorites.subtitle} />
      {list.length === 0 ? (
        <EmptyState
          icon={<Bookmark aria-hidden />}
          title={t.dashboard.favorites.emptyTitle}
          text={t.dashboard.favorites.emptyText}
          action={<ButtonLink to="/programmes">{t.dashboard.favorites.browse}</ButtonLink>}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */
interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}

function Field({ id, label, value, onChange, type = 'text', autoComplete, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-edge bg-night-900 px-3.5 text-sm font-semibold text-ink transition-colors focus:border-volt focus:outline-none"
      />
    </div>
  );
}

function SettingsView({ user, onNotice }: { user: User; onNotice: (message: string) => void }) {
  const { t } = useLanguage();
  const { tier, setTier, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  const [error, setError] = useState<string | null>(null);

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setError(t.auth.errors.firstName);
      return;
    }
    if (!isValidEmail(form.email)) {
      setError(t.auth.errors.email);
      return;
    }
    setError(null);
    updateUser({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() });
    onNotice(t.dashboard.settings.saved);
  };

  const changeTier = (next: Tier) => {
    setTier(next);
    onNotice(t.dashboard.settings.tierChanged(t.tiers[next]));
  };

  return (
    <div className="space-y-6">
      <ViewHeader title={t.dashboard.settings.title} subtitle={t.dashboard.settings.subtitle} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={save} noValidate className="h-fit rounded-xl border border-edge bg-night-800 p-6">
          <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.profile}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              id="settings-first-name"
              label={t.dashboard.settings.firstName}
              value={form.firstName}
              autoComplete="given-name"
              onChange={(value) => setForm((current) => ({ ...current, firstName: value }))}
            />
            <Field
              id="settings-last-name"
              label={t.dashboard.settings.lastName}
              value={form.lastName}
              autoComplete="family-name"
              onChange={(value) => setForm((current) => ({ ...current, lastName: value }))}
            />
            <Field
              id="settings-email"
              type="email"
              className="sm:col-span-2"
              label={t.dashboard.settings.email}
              value={form.email}
              autoComplete="email"
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-6">
            {t.common.save}
          </Button>
        </form>

        <div className="space-y-6">
          <section className="rounded-xl border border-edge bg-night-800 p-6">
            <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.subscription}</h2>
            <p className="mt-1 text-sm text-muted">{t.dashboard.settings.subscriptionText}</p>
            <div role="group" aria-label={t.dashboard.settings.subscription} className="mt-5 grid grid-cols-2 gap-2">
              {(['standard', 'premium'] as Tier[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={tier === option}
                  onClick={() => changeTier(option)}
                  className={cn(
                    'flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl border text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                    tier === option ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
                  )}
                >
                  {option === 'premium' ? <Crown className="h-4 w-4" aria-hidden /> : <span className="h-4" aria-hidden />}
                  {t.tiers[option]}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-edge bg-night-800 p-6">
            <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.language}</h2>
            <LanguageSwitcher className="mt-4" />
          </section>
          <section className="rounded-xl border border-edge bg-night-800 p-6">
            <h2 className="font-display text-2xl uppercase">{t.dashboard.settings.session}</h2>
            <p className="mt-1 text-sm text-muted">{t.dashboard.settings.logoutText}</p>
            <Button
              variant="outline"
              className="mt-4"
              icon={<LogOut />}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              {t.dashboard.logout}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
