import { useMemo } from 'react';
import { Users, TrendingUp, Receipt, Star } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { planPricing, programs } from '../../data/programs';
import { fetchAdminMembers, fetchAdminOrders, monthlyBuckets } from '../../services/adminApi';
import type { AdminMember } from '../../services/adminApi';
import { RevenueChart, SignupsChart, TierSplit } from '../../components/features/admin/AdminCharts';
import { RevenueOverview } from '../../components/features/admin/RevenueOverview';
import { Tag } from '../../components/ui/Badge';
import { KpiCard } from './KpiCard';
import { ErrorState, GridSkeleton } from '../../components/ui/States';

export function OverviewView() {
  const { t, fmtDate, fmtNumber, fmtPrice } = useLanguage();
  const membersQuery = useAsync(fetchAdminMembers, []);
  const ordersQuery = useAsync(fetchAdminOrders, []);

  const members = membersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const monthLabel = (key: string) => fmtDate(`${key}-01`, { month: 'short' });

  // Ces useMemo doivent rester AVEC les early returns ci-dessous : les
  // déplacer après feraitrender plus de hooks au passage loading -> loaded
  // ("Rendered more hooks than during the previous render").
  const revenueSeries = useMemo(
    () =>
      monthlyBuckets(
        orders.filter((order) => order.status === 'paid').map((order) => ({ date: order.date, value: order.amount })),
      ).map((bucket) => ({ label: monthLabel(bucket.key), value: Math.round(bucket.value / 1000) })),
    [orders, fmtDate],
  );
  const signupsSeries = useMemo(
    () =>
      monthlyBuckets(
        members.filter((member) => member.joined).map((member) => ({ date: member.joined, value: 1 })),
      ).map((bucket) => ({ label: monthLabel(bucket.key), value: bucket.value })),
    [members, fmtDate],
  );

  if (membersQuery.loading || ordersQuery.loading) {
    return <GridSkeleton count={4} className="sm:grid-cols-2 xl:grid-cols-4" />;
  }
  if (membersQuery.error || ordersQuery.error) {
    return (
      <ErrorState
        onRetry={() => {
          membersQuery.refetch();
          ordersQuery.refetch();
        }}
      />
    );
  }

  const activeMembers = members.filter((member) => member.status === 'active');
  const monthly = (member: AdminMember) =>
    member.tier === 'free' ? 0 : (planPricing[member.goal][member.tier]?.monthlyEquivalent ?? 0);
  const mrr = activeMembers.reduce((sum, member) => sum + monthly(member), 0);
  const paidOrders = orders.filter((order) => order.status === 'paid');
  const collected = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const avgRating = programs.length
    ? programs.reduce((sum, program) => sum + program.rating, 0) / programs.length
    : 0;
  const latest = orders.slice(0, 5);

  const orderTone: Record<string, 'volt' | 'default' | 'light'> = {
    paid: 'volt',
    pending: 'default',
    failed: 'light',
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <KpiCard icon={Users} label={t.admin.kpi.members} value={fmtNumber(members.length)} sub={t.admin.kpi.membersSub(fmtNumber(activeMembers.length))} />
        <KpiCard icon={TrendingUp} label={t.admin.kpi.revenue} value={fmtPrice(mrr)} sub={t.admin.kpi.revenueSub} />
        <KpiCard icon={Receipt} label={t.admin.kpi.orders} value={fmtNumber(paidOrders.length)} sub={t.admin.kpi.ordersSub(fmtPrice(collected))} />
        <KpiCard
          icon={Star}
          label={t.admin.kpi.rating}
          value={fmtNumber(avgRating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          sub={t.admin.kpi.ratingSub(fmtNumber(programs.length))}
        />
      </div>
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RevenueChart data={revenueSeries} />
        </div>
        <div className="min-w-0">
          <TierSplit members={members} />
        </div>
      </div>
      <RevenueOverview orders={orders} />
      <div className="grid gap-5 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <SignupsChart data={signupsSeries} />
        </div>
        <article className="h-full rounded-2xl border border-edge/70 bg-night-800/70 p-6 sm:p-8">
          <h2 className="font-display text-2xl uppercase tracking-tight">{t.admin.latestTitle}</h2>
          {latest.length === 0 ? (
            <p className="mt-5 text-sm font-semibold text-muted">{t.admin.orders.empty}</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {latest.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-edge/60 bg-night-900/50 px-4 py-3.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-bold tracking-tight">{order.member}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{order.reference}</p>
                  </div>
                  <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}