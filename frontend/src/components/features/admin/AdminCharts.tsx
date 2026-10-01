import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../../hooks/useLanguage';
import { adminMembers, adminRevenueByMonth, adminSignupsByMonth } from '../../../data/admin';
import { chartTooltip } from '../dashboard/Charts';

const TIER_COLORS = ['#C7FF00', '#38BDF8', '#475569'];

export function RevenueChart() {
  const { t } = useLanguage();
  const gradientId = `admin-revenue-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <article className="h-full rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl uppercase">{t.admin.charts.revenue}</h2>
      <p className="text-sm text-muted">{t.admin.charts.revenueSub}</p>
      <div className="mt-6 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={adminRevenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C7FF00" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#C7FF00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E3448" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip {...chartTooltip} cursor={{ stroke: '#2B4A66' }} />
            <Area type="monotone" dataKey="revenue" stroke="#C7FF00" strokeWidth={2.5} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export function SignupsChart() {
  const { t } = useLanguage();
  return (
    <article className="h-full rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl uppercase">{t.admin.charts.signups}</h2>
      <p className="text-sm text-muted">{t.admin.charts.signupsSub}</p>
      <div className="mt-6 h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={adminSignupsByMonth} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#1E3448" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip {...chartTooltip} cursor={{ fill: '#102235' }} />
            <Bar dataKey="signups" fill="#C7FF00" radius={[6, 6, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export function TierSplit() {
  const { t } = useLanguage();
  const data = (['premium', 'standard', 'free'] as const).map((tier, index) => ({
    name: t.tiers[tier],
    value: adminMembers.filter((member) => member.tier === tier).length,
    fill: TIER_COLORS[index],
  }));
  return (
    <article className="h-full rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
      <h2 className="font-display text-2xl uppercase">{t.admin.charts.tiers}</h2>
      <p className="text-sm text-muted">{t.admin.charts.tiersSub}</p>
      <div className="mt-4 h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip {...chartTooltip} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} strokeWidth={0} paddingAngle={3}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-semibold text-ink/85">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.fill }} />
              {entry.name}
            </span>
            <span className="font-extrabold">{entry.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
