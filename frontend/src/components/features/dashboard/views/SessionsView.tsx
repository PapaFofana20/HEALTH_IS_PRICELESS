import { CalendarDays, Check, Flame, Timer, X } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAsync } from '../../../../hooks/useAsync';
import { api } from '../../../../services/api';
import { Tag } from '../../../ui/Badge';
import { ButtonLink } from '../../../ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../../ui/States';
import { ViewHeader } from '../DashboardLayout';
import { labelClass, typeIcons } from '../constants';

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse rounded-xl border border-edge bg-night-800 p-4">
      <dt className={labelClass}>{label}</dt>
      <dd className="mb-2 font-display text-3xl leading-none">{value}</dd>
    </div>
  );
}

export function SessionsView({ userId }: { userId: string }) {
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
          action={<ButtonLink to="/dashboard">{t.dashboard.nav.accueil}</ButtonLink>}
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
                      <time dateTime={log.date}>{fmtDate(log.date, { weekday: 'short', day: 'numeric', month: 'short' })}</time> · {t.dayTypes[log.type]}
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