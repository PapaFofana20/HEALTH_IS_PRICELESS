import { useId, useState } from 'react';
import { Activity, Lock } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { muscleVolume as previewVolume } from '../../../data/user';
import { Tag } from '../../ui/Badge';
import { EmptyState, ErrorState, LockedContent, Skeleton } from '../../ui/States';
import type { MuscleVolume, WeeklyProgress } from '../../../types';

/** Shared Recharts tooltip styling (night blue + volt). */
export const chartTooltip = {
  contentStyle: {
    background: '#0D1B2A',
    border: '1px solid #1E3448',
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 600,
  },
  labelStyle: { color: '#94A3B8', fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: '#F8FAFC' },
};

type Metric = 'sessions' | 'minutes' | 'calories';
const METRICS: Metric[] = ['sessions', 'minutes', 'calories'];
const targetKey = { sessions: 'sessionsTarget', minutes: 'minutesTarget', calories: 'caloriesTarget' } as const;

interface ProgressChartProps {
  data?: WeeklyProgress[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function ProgressChart({ data, loading, error, onRetry }: ProgressChartProps) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState<Metric>('sessions');
  const gradientId = `progress-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const chartData = (data ?? []).map((row) => ({
    label: `${t.dashboard.weekShort}${row.week}`,
    done: row[metric],
    target: row[targetKey[metric]],
  }));

  return (
    <article className="h-full rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase">{t.dashboard.chartTitle}</h2>
          <p className="text-sm text-muted">{t.dashboard.chartSubtitle}</p>
        </div>
        <div role="group" aria-label={t.dashboard.chartTitle} className="inline-flex w-fit rounded-full border border-edge bg-night-900 p-1">
          {METRICS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={metric === item}
              onClick={() => setMetric(item)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                metric === item ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
              )}
            >
              {t.dashboard.metrics[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-64 w-full min-w-0">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : error ? (
          <ErrorState onRetry={onRetry} className="h-full py-6" />
        ) : chartData.length === 0 ? (
          <EmptyState compact className="h-full" icon={<Activity aria-hidden />} title={t.dashboard.noData} text={t.dashboard.noDataText} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C7FF00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C7FF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E3448" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip {...chartTooltip} cursor={{ stroke: '#2B4A66' }} />
              <Area
                type="monotone"
                dataKey="target"
                name={t.dashboard.target}
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="transparent"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="done"
                name={t.dashboard.done}
                stroke="#C7FF00"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={{ r: 3, fill: '#C7FF00', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#C7FF00', stroke: '#07111F', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex gap-5 text-xs font-semibold text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 bg-volt" />
          {t.dashboard.done}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="w-5 border-t-2 border-dashed border-muted" />
          {t.dashboard.target}
        </span>
      </div>
    </article>
  );
}

export function MuscleVolumeChart({ data }: { data: MuscleVolume[] }) {
  const { t } = useLanguage();
  const chartData = data.map((row) => ({ label: t.muscles[row.muscle], sets: row.sets }));
  return (
    <div className="h-64 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E3448" strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="label" width={112} tick={{ fill: '#F8FAFC', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip {...chartTooltip} cursor={{ fill: 'rgba(199,255,0,0.06)' }} />
          <Bar dataKey="sets" name={t.dashboard.advanced.sets} fill="#C7FF00" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Premium-only analytics card (locked preview for other tiers). */
export function AdvancedStats({ locked, data, loading }: { locked: boolean; data?: MuscleVolume[]; loading?: boolean }) {
  const { t } = useLanguage();
  let content;
  if (loading) content = <Skeleton className="h-64 w-full" />;
  else if (data && data.length > 0) content = <MuscleVolumeChart data={data} />;
  else content = <EmptyState compact icon={<Activity aria-hidden />} title={t.dashboard.noData} text={t.dashboard.noDataText} />;

  return (
    <article className="rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
            {t.dashboard.advanced.title}
            {locked && <Lock className="h-4 w-4 text-volt" aria-hidden />}
          </h2>
          <p className="text-sm text-muted">{t.dashboard.advanced.subtitle}</p>
        </div>
        {!locked && <Tag tone="volt">{t.tiers.premium}</Tag>}
      </div>
      <div className="mt-6">
        {locked ? (
          <LockedContent title={t.dashboard.advanced.title} text={t.dashboard.advanced.lockedText}>
            <MuscleVolumeChart data={previewVolume} />
          </LockedContent>
        ) : (
          content
        )}
      </div>
    </article>
  );
}
