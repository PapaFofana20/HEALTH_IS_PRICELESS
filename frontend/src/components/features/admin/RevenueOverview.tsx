import { useMemo, useState } from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import type { AdminOrder } from '../../../services/adminApi';

/* Vue globale des sommes réellement encaissées (commandes payées).
   Périodes civiles : mois / trimestre / année / total, avec comparatif
   à période équivalente précédente. Aucune estimation ici. */

type RevenuePeriod = 'month' | 'quarter' | 'year' | 'all';
const PERIODS: RevenuePeriod[] = ['month', 'quarter', 'year', 'all'];

function startOfDay(value: Date): Date {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function currentStart(period: RevenuePeriod, now: Date): Date | null {
  if (period === 'all') return null;
  const start = startOfDay(now);
  if (period === 'month') {
    start.setDate(1);
    return start;
  }
  if (period === 'quarter') {
    start.setDate(1);
    start.setMonth(start.getMonth() - (start.getMonth() % 3));
    return start;
  }
  start.setMonth(0, 1);
  return start;
}

function inRange(date: Date, start: Date | null, end: Date): boolean {
  const time = date.getTime();
  if (Number.isNaN(time)) return false;
  if (start && time < start.getTime()) return false;
  return time <= end.getTime();
}

export function RevenueOverview({ orders }: { orders: AdminOrder[] }) {
  const { t, fmtNumber, fmtPrice } = useLanguage();
  const [period, setPeriod] = useState<RevenuePeriod>('month');

  const stats = useMemo(() => {
    const now = new Date();
    const paid = orders.filter((order) => order.status === 'paid');
    const start = currentStart(period, now);
    const current = paid.filter((order) => inRange(new Date(order.date), start, now));

    let previous: AdminOrder[] = [];
    if (start) {
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(start);
      if (period === 'month') prevStart.setMonth(prevStart.getMonth() - 1);
      else if (period === 'quarter') prevStart.setMonth(prevStart.getMonth() - 3);
      else prevStart.setFullYear(prevStart.getFullYear() - 1);
      previous = paid.filter((order) => inRange(new Date(order.date), prevStart, prevEnd));
    }

    const total = current.reduce((sum, order) => sum + order.amount, 0);
    const prevTotal = previous.reduce((sum, order) => sum + order.amount, 0);
    const standard = current.filter((order) => order.plan !== 'premium').reduce((sum, order) => sum + order.amount, 0);
    const premium = current.filter((order) => order.plan === 'premium').reduce((sum, order) => sum + order.amount, 0);
    return {
      total,
      count: current.length,
      average: current.length > 0 ? total / current.length : 0,
      delta: prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null,
      hasPrevious: previous.length > 0 || prevTotal > 0,
      standard,
      premium,
    };
  }, [orders, period]);

  const maxPlan = Math.max(stats.standard, stats.premium, 1);
  const deltaLabel =
    stats.delta === null
      ? null
      : fmtNumber(stats.delta / 100, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' });

  return (
    <article className="rounded-2xl border border-edge/70 bg-night-800/70 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-tight">{t.admin.revenue.title}</h2>
          <p className="mt-1 text-sm text-muted">{t.admin.revenue.subtitle}</p>
        </div>
        <div role="group" aria-label={t.admin.revenue.title} className="flex flex-wrap gap-2">
          {PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={period === option}
              onClick={() => setPeriod(option)}
              className={cn(
                'h-10 rounded-full border px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                period === option ? 'border-volt bg-volt text-night-900' : 'border-edge text-muted hover:text-ink',
              )}
            >
              {t.admin.revenue.periods[option]}
            </button>
          ))}
        </div>
      </div>

      {stats.count === 0 ? (
        <p className="mt-6 rounded-xl border border-edge/60 bg-night-900/50 px-4 py-5 text-sm font-semibold text-muted">
          {t.admin.revenue.noData}
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
            <p className="font-display text-5xl leading-none tracking-tight sm:text-6xl">{fmtPrice(stats.total)}</p>
            {deltaLabel !== null ? (
              <p
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold',
                  stats.delta !== null && stats.delta > 0
                    ? 'border-volt/40 bg-volt/10 text-volt'
                    : stats.delta !== null && stats.delta < 0
                      ? 'border-danger/40 bg-danger/10 text-danger'
                      : 'border-edge text-muted',
                )}
              >
                {stats.delta !== null && stats.delta > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                ) : stats.delta !== null && stats.delta < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Minus className="h-3.5 w-3.5" aria-hidden />
                )}
                {t.admin.revenue.vsPrevious(deltaLabel)}
              </p>
            ) : (
              stats.hasPrevious === false && (
                <p className="text-xs font-semibold text-muted">{t.admin.revenue.firstPeriod}</p>
              )
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-edge/60 bg-night-900/50 p-4 sm:p-5">
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                {t.admin.revenue.transactions}
              </dt>
              <dd className="mt-2 font-display text-4xl leading-none tracking-tight">{fmtNumber(stats.count)}</dd>
            </div>
            <div className="rounded-2xl border border-edge/60 bg-night-900/50 p-4 sm:p-5">
              <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                {t.admin.revenue.avgBasket}
              </dt>
              <dd className="mt-2 font-display text-4xl leading-none tracking-tight">{fmtPrice(Math.round(stats.average))}</dd>
            </div>
          </dl>

          <div className="mt-6 space-y-3">
            {(
              [
                { key: 'standard', label: t.tiers.standard, value: stats.standard },
                { key: 'premium', label: t.tiers.premium, value: stats.premium },
              ] as const
            ).map((row) => (
              <div key={row.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold text-ink/90">{row.label}</span>
                  <span className="font-bold">{fmtPrice(row.value)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-night-700">
                  <div
                    className={cn('h-full rounded-full', row.key === 'premium' ? 'bg-volt' : 'bg-sky-400')}
                    style={{ width: `${(row.value / maxPlan) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </article>
  );
}