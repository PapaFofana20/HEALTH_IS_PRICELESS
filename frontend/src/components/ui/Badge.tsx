import { Crown, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import type { Plan } from '../../types';

export function PlanBadge({ plan, className }: { plan: Plan; className?: string }) {
  const { t } = useLanguage();
  if (plan === 'premium') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-sm bg-volt px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-night-900',
          className,
        )}
      >
        <Crown className="h-3 w-3" aria-hidden />
        {t.tiers.premium}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border border-ink/20 bg-night-900/80 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink backdrop-blur',
        className,
      )}
    >
      {t.tiers.standard}
    </span>
  );
}

type TagTone = 'default' | 'volt' | 'light' | 'dark';

const tones: Record<TagTone, string> = {
  default: 'border-edge bg-night-800/80 text-muted',
  volt: 'border-volt/30 bg-volt/10 text-volt',
  light: 'border-ink/20 bg-night-900/60 text-ink backdrop-blur',
  dark: 'border-night-900/15 bg-night-900/5 text-night-900',
};

export function Tag({ children, tone = 'default', icon, className }: { children: ReactNode; tone?: TagTone; icon?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  className?: string;
}

export function Chip({ active, onClick, children, count, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
        active ? 'border-volt bg-volt text-night-900' : 'border-edge text-muted hover:border-ink/40 hover:text-ink',
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] leading-none', active ? 'bg-night-900/15' : 'bg-night-700')}>
          {count}
        </span>
      )}
    </button>
  );
}

export function Rating({ value, tone = 'volt', className }: { value: number; tone?: 'volt' | 'dark'; className?: string }) {
  const { t, fmtNumber } = useLanguage();
  const rounded = Math.round(value);
  return (
    <span
      role="img"
      aria-label={t.common.ratingLabel(fmtNumber(value, { maximumFractionDigits: 1 }))}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            'h-3.5 w-3.5',
            i < rounded
              ? tone === 'volt'
                ? 'fill-volt text-volt'
                : 'fill-night-900 text-night-900'
              : tone === 'volt'
                ? 'text-edge-strong'
                : 'text-night-900/25',
          )}
        />
      ))}
    </span>
  );
}
