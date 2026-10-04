import { useState } from 'react';
import { CalendarDays, Check, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { planPricing } from '../../../data/programs';
import { media } from '../../../data/media';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import type { Plan } from '../../../types';

interface PlanShowcaseCardProps {
  plan: Plan;
  /** compact = dashboard home (no image), full = /dashboard/programmes page. */
  variant?: 'compact' | 'full';
}

const planImages: Record<Plan, string> = {
  standard: media.programs.leanStrong,
  premium: media.programs.transformation,
};

const planIndex: Record<Plan, string> = { standard: '01', premium: '02' };

export function PlanShowcaseCard({ plan, variant = 'compact' }: PlanShowcaseCardProps) {
  const { t, fmtPrice } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const copy = t.dashboard.coaching[plan];
  const isPremium = plan === 'premium';
  const goal = user?.goal ?? 'muscle-gain';
  const price = planPricing[goal][plan];

  const closeModal = () => {
    setOpen(false);
    setPending(false);
  };

  const badge = (
    <span
      className={cn(
        'z-10 inline-flex items-center gap-1.5 rounded-sm bg-volt px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-night-900',
        variant === 'full' ? 'absolute right-4 top-4' : 'absolute right-5 top-5 sm:right-7 sm:top-7',
      )}
    >
      <Sparkles className="h-3 w-3" aria-hidden />
      {t.plans.recommended}
    </span>
  );

  return (
    <>
      <article
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30',
          isPremium ? 'border-2 border-volt bg-night-700' : 'border border-edge bg-night-800 hover:border-edge-strong',
        )}
      >
        {variant === 'full' && (
          <div className="relative h-44 overflow-hidden sm:h-52">
            <img
              src={planImages[plan]}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/30 to-transparent" />
            {isPremium && badge}
          </div>
        )}
        {variant === 'compact' && isPremium && badge}

        <div className="relative flex flex-1 flex-col p-6 sm:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-muted">
            <span className="text-volt">{planIndex[plan]}</span> — {t.tiers[plan]}
          </p>
          <h3 className="mt-3 font-display text-3xl uppercase leading-none sm:text-4xl">{copy.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{copy.text}</p>

          {variant === 'full' && (
            <>
              <div className="mt-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t.dashboard.coaching.objectives}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {copy.objectives.map((objective) => (
                    <li key={objective} className="rounded-full border border-edge bg-night-900 px-3 py-1.5 text-xs font-bold text-ink/90">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                <CalendarDays className="h-4 w-4 text-volt" aria-hidden />
                {t.dashboard.coaching.duration} · {copy.duration}
              </p>
            </>
          )}

          <ul className="mt-6 flex-1 space-y-3">
            {copy.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm font-semibold text-ink/90">
                <span
                  className={cn(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full',
                    isPremium ? 'bg-volt text-night-900' : 'border border-volt/40 bg-volt/10 text-volt',
                  )}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-baseline gap-2 border-t border-volt/20 pt-6">
            <span className="font-display text-4xl leading-none sm:text-5xl">{fmtPrice(price.annual)}</span>
            <span className="text-lg font-bold text-muted">{t.plans.perYear}</span>
          </div>
          <p className="mt-1 text-base text-muted">
            {t.plans.equivPrefix} <span className="font-semibold text-volt">{fmtPrice(price.monthlyEquivalent)}</span>{' '}
            {t.plans.perMonth}
          </p>

          <Button fullWidth className="mt-6" onClick={() => setOpen(true)}>
            {t.dashboard.coaching.discover}
          </Button>
        </div>
      </article>

      <Modal open={open} onClose={closeModal} title={copy.name}>
        <div className="space-y-6">
          <div className="relative h-40 overflow-hidden rounded-xl">
            <img src={planImages[plan]} alt="" className="h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800/90 via-night-800/30 to-transparent" />
            {isPremium && badge}
          </div>

          <p className="leading-relaxed text-muted">{copy.text}</p>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t.dashboard.coaching.objectives}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {copy.objectives.map((objective) => (
                <li key={objective} className="rounded-full border border-edge bg-night-900 px-3 py-1.5 text-xs font-bold text-ink/90">
                  {objective}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t.dashboard.coaching.included}</p>
            <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {copy.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm font-semibold text-ink/90">
                  <span
                    className={cn(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-full',
                      isPremium ? 'bg-volt text-night-900' : 'border border-volt/40 bg-volt/10 text-volt',
                    )}
                  >
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
            <CalendarDays className="h-4 w-4 text-volt" aria-hidden />
            {t.dashboard.coaching.duration} · {copy.duration}
          </p>

          <div className="flex flex-col gap-4 border-t border-volt/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none">{fmtPrice(price.annual)}</span>
              <span className="text-lg font-bold text-muted">{t.plans.perYear}</span>
            </p>
            <p className="mt-1 text-base text-muted">
              {t.plans.equivPrefix} <span className="font-semibold text-volt">{fmtPrice(price.monthlyEquivalent)}</span>{' '}
              {t.plans.perMonth}
            </p>
            <Button onClick={() => setPending(true)}>{t.dashboard.coaching.start}</Button>
          </div>

          {pending && (
            <p role="status" className="animate-fade-up rounded-xl border border-volt/40 bg-volt/10 p-4 text-sm font-semibold text-volt">
              {t.dashboard.coaching.pending}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
