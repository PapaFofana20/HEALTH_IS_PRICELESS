import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}

export function KpiCard({ icon: Icon, label, value, sub }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-edge bg-night-800 p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-volt/30 bg-volt/10 text-volt">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold text-muted">{sub}</p>
    </div>
  );
}