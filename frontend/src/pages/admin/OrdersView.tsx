import { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { fetchAdminOrders } from '../../services/adminApi';
import type { OrderStatus } from '../../services/adminApi';
import { Chip, Tag } from '../../components/ui/Badge';
import { ScrollTable } from '../../components/ui/ScrollTable';
import { ErrorState, Skeleton } from '../../components/ui/States';

const orderTone: Record<OrderStatus, 'volt' | 'default' | 'light'> = {
  paid: 'volt',
  pending: 'default',
  failed: 'light',
};

export function OrdersView() {
  const { t, fmtNumber, fmtPrice, fmtDate } = useLanguage();
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const { data, loading, error, refetch } = useAsync(fetchAdminOrders, []);
  const orders = data ?? [];

  const filtered = useMemo(
    () => orders.filter((order) => status === 'all' || order.status === status),
    [orders, status],
  );
  const total = filtered.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.amount, 0);

  if (loading) {
    return (
      <div className="space-y-3" role="status">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {(['all', 'paid', 'pending', 'failed'] as const).map((option) => (
            <Chip
              key={option}
              active={status === option}
              onClick={() => setStatus(option)}
              count={option === 'all' ? orders.length : orders.filter((order) => order.status === option).length}
            >
              {option === 'all' ? t.admin.orders.allStatuses : t.admin.orderStatus[option]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="hidden md:block">
        <ScrollTable className="rounded-2xl border border-edge/70 bg-night-800/70">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge/70 bg-night-800/80 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.ref}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.member}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.plan}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.amount}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.method}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.date}</th>
                <th scope="col" className="px-5 py-4">{t.admin.orders.table.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60 bg-night-900/40">
              {filtered.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-night-800/70">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-volt">{order.reference}</td>
                  <td className="px-5 py-4 text-sm font-bold text-ink">{order.member}</td>
                  <td className="px-5 py-4 text-sm text-ink/85">{t.tiers[order.plan]}</td>
                  <td className="px-5 py-4 text-sm font-bold text-ink">{fmtPrice(order.amount)}</td>
                  <td className="px-5 py-4 text-sm text-muted">{t.admin.methods[order.method]}</td>
                  <td className="px-5 py-4 text-sm text-muted">{fmtDate(order.date)}</td>
                  <td className="px-5 py-4">
                    <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                    {t.admin.orders.empty}
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-edge/70 bg-night-800/80 text-sm">
                  <td colSpan={3} className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                    {t.admin.orders.total}
                  </td>
                  <td className="px-5 py-4 font-display text-xl text-volt">{fmtPrice(total)}</td>
                  <td colSpan={3} className="px-5 py-4 text-right text-xs font-semibold text-muted">
                    {t.admin.orders.count(fmtNumber(filtered.length))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </ScrollTable>
      </div>
      <div className="grid gap-3 md:hidden">
        {filtered.map((order) => (
          <article key={order.id} className="rounded-2xl border border-edge/70 bg-night-800/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-bold text-volt">{order.reference}</p>
                <p className="mt-1 truncate text-sm font-bold text-ink">{order.member}</p>
              </div>
              <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
              <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.orders.table.plan}</dt>
                <dd className="mt-1 truncate font-semibold text-ink/85">{t.tiers[order.plan]}</dd>
              </div>
              <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.orders.table.amount}</dt>
                <dd className="mt-1 font-bold text-ink">{fmtPrice(order.amount)}</dd>
              </div>
              <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.orders.table.method}</dt>
                <dd className="mt-1 truncate font-semibold text-muted">{t.admin.methods[order.method]}</dd>
              </div>
              <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.orders.table.date}</dt>
                <dd className="mt-1 font-semibold text-muted">{fmtDate(order.date)}</dd>
              </div>
            </dl>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-edge/70 bg-night-800/70 px-5 py-12 text-center text-sm text-muted">
            {t.admin.orders.empty}
          </p>
        )}
        {filtered.length > 0 && (
          <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.orders.total}</p>
              <p className="font-display text-xl text-volt">{fmtPrice(total)}</p>
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-muted">{t.admin.orders.count(fmtNumber(filtered.length))}</p>
          </div>
        )}
      </div>
    </div>
  );
}
