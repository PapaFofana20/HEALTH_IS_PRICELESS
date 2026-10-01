import { useState } from 'react';
import type { FormEvent } from 'react';
import { CircleCheck, LoaderCircle, Plus, Scale, TrendingDown, TrendingUp, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '../../../utils/cn';
import { clamp } from '../../../utils/fitness';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { useAsync } from '../../../hooks/useAsync';
import { api } from '../../../services/api';
import { Button } from '../../ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../../ui/States';
import { chartTooltip } from './Charts';
import { ProgressBar } from './Widgets';

const labelClass = 'text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted';

/** Weight log: stats, chart, add-measurement form. Persists through the API layer. */
export function WeightTracker({ compact = false }: { compact?: boolean }) {
  const { t, fmtNumber, fmtDate } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id ?? 'guest';
  const goal = user?.weightGoal ?? 76;
  const today = new Date().toISOString().slice(0, 10);

  const { data, loading, error, refetch, setData } = useAsync(() => api.getWeightEntries(userId), [userId]);
  const [formOpen, setFormOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(today);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const entries = data ?? [];
  const current = entries.length ? entries[entries.length - 1].weight : undefined;
  const start = entries.length ? entries[0].weight : undefined;
  const change = current !== undefined && start !== undefined ? current - start : 0;
  const remaining = current !== undefined ? Math.abs(current - goal) : 0;
  const progress =
    current !== undefined && start !== undefined && start !== goal ? clamp(((start - current) / (start - goal)) * 100, 0, 100) : 0;
  const weights = entries.map((entry) => entry.weight);
  const domain: [number, number] = weights.length
    ? [Math.floor(Math.min(...weights) - 1), Math.ceil(Math.max(...weights) + 1)]
    : [0, 100];
  const chartData = entries.map((entry) => ({ label: fmtDate(entry.date, { day: 'numeric', month: 'short' }), weight: entry.weight }));
  const fmtKg = (value: number) => fmtNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(weight.replace(',', '.'));
    if (!weight || Number.isNaN(value) || value < 30 || value > 300) {
      setFormError(t.dashboard.weight.invalid);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const next = await api.addWeightEntry(userId, { date, weight: Math.round(value * 10) / 10 });
      setData(() => next);
      setWeight('');
      setFormOpen(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setFormError(t.states.errorText);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="h-full rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
          <Scale className="h-5 w-5 text-volt" aria-hidden />
          {t.dashboard.weight.title}
        </h2>
        <Button
          size="sm"
          variant={formOpen ? 'subtle' : 'primary'}
          icon={formOpen ? <X /> : <Plus />}
          aria-expanded={formOpen}
          aria-controls="weight-form"
          onClick={() => {
            setFormOpen((value) => !value);
            setFormError(null);
          }}
        >
          {formOpen ? t.common.cancel : t.dashboard.weight.add}
        </Button>
      </div>

      {saved && (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-success">
          <CircleCheck className="h-4 w-4" aria-hidden />
          {t.dashboard.weight.saved}
        </p>
      )}

      {formOpen && (
        <form
          id="weight-form"
          onSubmit={submit}
          noValidate
          className="mt-4 grid animate-fade-up gap-3 rounded-lg border border-edge bg-night-900 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <label htmlFor="weight-value" className={labelClass}>
              {t.dashboard.weight.weightLabel}
            </label>
            <input
              id="weight-value"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="30"
              max="300"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder={current !== undefined ? String(current) : '75.0'}
              aria-invalid={Boolean(formError) || undefined}
              aria-describedby={formError ? 'weight-error' : undefined}
              className="mt-2 h-11 w-full rounded-lg border border-edge bg-night-800 px-3 font-bold text-ink transition-colors placeholder:text-muted/60 focus:border-volt focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="weight-date" className={labelClass}>
              {t.dashboard.weight.dateLabel}
            </label>
            <input
              id="weight-date"
              type="date"
              value={date}
              max={today}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-edge bg-night-800 px-3 font-semibold text-ink transition-colors focus:border-volt focus:outline-none"
            />
          </div>
          <Button type="submit" disabled={saving} icon={saving ? <LoaderCircle className="animate-spin" /> : undefined}>
            {t.common.save}
          </Button>
          {formError && (
            <p id="weight-error" role="alert" className="text-xs font-semibold text-danger sm:col-span-3">
              {formError}
            </p>
          )}
        </form>
      )}

      {loading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : error ? (
        <ErrorState className="mt-6" onRetry={refetch} />
      ) : entries.length === 0 ? (
        <EmptyState
          compact
          className="mt-6"
          icon={<Scale aria-hidden />}
          title={t.dashboard.weight.emptyTitle}
          text={t.dashboard.weight.emptyText}
          action={
            !formOpen ? (
              <Button size="sm" icon={<Plus />} onClick={() => setFormOpen(true)}>
                {t.dashboard.weight.add}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <dl className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg bg-night-900 p-3">
              <dt className={labelClass}>{t.dashboard.weight.current}</dt>
              <dd className="mt-1.5 font-display text-2xl leading-none sm:text-3xl">
                {fmtKg(current ?? 0)}
                <span className="ml-1 font-sans text-xs font-bold text-muted">{t.dashboard.weight.unit}</span>
              </dd>
            </div>
            <div className="rounded-lg bg-night-900 p-3">
              <dt className={labelClass}>{t.dashboard.weight.goal}</dt>
              <dd className="mt-1.5 font-display text-2xl leading-none text-volt sm:text-3xl">
                {fmtKg(goal)}
                <span className="ml-1 font-sans text-xs font-bold text-muted">{t.dashboard.weight.unit}</span>
              </dd>
            </div>
            <div className="rounded-lg bg-night-900 p-3">
              <dt className={labelClass}>{t.dashboard.weight.change}</dt>
              <dd className={cn('mt-1.5 flex items-center gap-1 font-display text-2xl leading-none sm:text-3xl', change <= 0 ? 'text-success' : 'text-amber-300')}>
                {change <= 0 ? <TrendingDown className="h-5 w-5" aria-hidden /> : <TrendingUp className="h-5 w-5" aria-hidden />}
                {change > 0 ? '+' : ''}
                {fmtKg(change)}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <div className="flex justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">
              <span>{t.dashboard.weight.toGoal(Math.round(progress))}</span>
              <span>
                {t.dashboard.weight.remaining} {fmtKg(remaining)} {t.dashboard.weight.unit}
              </span>
            </div>
            <ProgressBar value={progress} label={t.dashboard.weight.toGoal(Math.round(progress))} tone="success" className="mt-2" />
          </div>

          <div className={cn('mt-6 w-full min-w-0', compact ? 'h-44' : 'h-64')}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#1E3448" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={domain} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip {...chartTooltip} cursor={{ stroke: '#2B4A66' }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name={t.dashboard.weight.current}
                  unit=" kg"
                  stroke="#C7FF00"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#07111F', stroke: '#C7FF00', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#C7FF00' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {!compact && (
            <div className="mt-6">
              <h3 className={labelClass}>{t.dashboard.weight.history}</h3>
              <ul className="mt-3 divide-y divide-edge rounded-lg border border-edge">
                {[...entries].reverse().map((entry, index, list) => {
                  const previous = list[index + 1];
                  const delta = previous ? entry.weight - previous.weight : 0;
                  return (
                    <li key={entry.date} className="flex items-center justify-between px-4 py-3 text-sm">
                      <time dateTime={entry.date} className="text-muted">
                        {fmtDate(entry.date)}
                      </time>
                      <span className="flex items-center gap-3">
                        <span className="font-bold">
                          {fmtKg(entry.weight)} {t.dashboard.weight.unit}
                        </span>
                        {previous && (
                          <span className={cn('w-14 text-right text-xs font-bold', delta <= 0 ? 'text-success' : 'text-amber-300')}>
                            {delta > 0 ? '+' : ''}
                            {fmtKg(delta)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </article>
  );
}
