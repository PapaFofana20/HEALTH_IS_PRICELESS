import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}

export function KpiCard({ icon: Icon, label, value, sub }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] font-extrabold uppercase leading-relaxed tracking-[0.18em] text-muted">{label}</p>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-volt/30 bg-volt/10 text-volt">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-4 font-display text-4xl leading-none tracking-tight">{value}</p>
      <p className="mt-2.5 text-xs font-semibold leading-relaxed text-muted">{sub}</p>
    </div>
  );
}