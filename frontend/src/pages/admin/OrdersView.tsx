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
      <ScrollTable className="rounded-xl border border-edge">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge bg-night-800 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.ref}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.member}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.plan}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.amount}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.method}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.date}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge bg-night-900">
            {filtered.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-night-800/60">
                <td className="px-5 py-4 font-mono text-xs font-bold text-volt">{order.reference}</td>
                <td className="px-5 py-4 font-bold">{order.member}</td>
                <td className="px-5 py-4">{t.tiers[order.plan]}</td>
                <td className="px-5 py-4 font-bold">{fmtPrice(order.amount)}</td>
                <td className="px-5 py-4 text-muted">{t.admin.methods[order.method]}</td>
                <td className="px-5 py-4 text-muted">{fmtDate(order.date)}</td>
                <td className="px-5 py-4">
                  <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  {t.admin.orders.empty}
                </td>
              </tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t border-edge bg-night-800 text-sm">
                <td colSpan={3} className="px-5 py-4 font-extrabold uppercase tracking-[0.12em] text-muted">
                  {t.admin.orders.total}
                </td>
                <td className="px-5 py-4 font-display text-xl text-volt">{fmtPrice(total)}</td>
                <td colSpan={3} className="px-5 py-4 text-right text-xs text-muted">
                  {t.admin.orders.count(fmtNumber(filtered.length))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </ScrollTable>
    </div>
  );
}