import { Crown, House, Inbox, LoaderCircle, Lock, RefreshCw, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, ButtonLink } from './Button';

/* ---------- Loading ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-night-700/80', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-night-800">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      <span className="sr-only">{t.common.loading}</span>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function Spinner({ className, label }: { className?: string; label?: string }) {
  const { t } = useLanguage();
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-muted', className)}>
      <LoaderCircle className="h-4 w-4 animate-spin text-volt" aria-hidden />
      <span>{label ?? t.common.loading}</span>
    </span>
  );
}

/* ---------- Empty ---------- */
interface EmptyStateProps {
  title: string;
  text?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ title, text, icon, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-edge bg-night-800/40 text-center',
        compact ? 'px-5 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full border border-edge bg-night-700 text-volt [&>svg]:h-6 [&>svg]:w-6">
        {icon ?? <Inbox aria-hidden />}
      </div>
      <h3 className="mt-5 font-display text-2xl uppercase tracking-wide">{title}</h3>
      {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

/* ---------- Error ---------- */
export function ErrorState({ title, text, onRetry, className }: { title?: string; text?: string; onRetry?: () => void; className?: string }) {
  const { t } = useLanguage();
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-12 text-center', className)}>
      <div className="grid h-14 w-14 place-items-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <TriangleAlert className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-5 font-display text-2xl uppercase tracking-wide">{title ?? t.states.errorTitle}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{text ?? t.states.errorText}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" icon={<RefreshCw />} onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}

/* ---------- Locked (Premium) ---------- */
interface LockedContentProps {
  children: ReactNode;
  title?: string;
  text?: string;
  ctaLabel?: string;
  to?: string;
  className?: string;
}

export function LockedContent({ children, title, text, ctaLabel, to = '/tarifs', className }: LockedContentProps) {
  const { t } = useLanguage();
  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <div aria-hidden inert={true} className="pointer-events-none select-none opacity-40 blur-[5px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-b from-night-900/30 via-night-900/75 to-night-900/95 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full border border-volt/40 bg-volt/10 text-volt">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <p className="font-display text-xl uppercase tracking-wide sm:text-2xl">{title ?? t.common.premiumContent}</p>
        {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
        <ButtonLink to={to} size="sm" icon={<Crown />} className="mt-1">
          {ctaLabel ?? t.common.unlockPremium}
        </ButtonLink>
      </div>
    </div>
  );
}

/* ---------- Not found ---------- */
export function NotFoundState({ title, text, backTo = '/', backLabel }: { title?: string; text?: string; backTo?: string; backLabel?: string }) {
  const { t } = useLanguage();
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden px-4 pb-20 pt-32">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="mx-auto max-w-xl text-center">
        <p aria-hidden className="font-display text-[8rem] leading-none txt-outline-volt sm:text-[11rem]">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl uppercase sm:text-5xl">{title ?? t.states.notFoundTitle}</h1>
        <p className="mt-4 text-muted">{text ?? t.states.notFoundText}</p>
        <ButtonLink to={backTo} className="mt-8" icon={<House />}>
          {backLabel ?? t.states.backHome}
        </ButtonLink>
      </div>
    </section>
  );
}
