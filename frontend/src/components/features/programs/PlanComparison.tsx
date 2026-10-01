import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Crown, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuth } from '../../../hooks/useAuth';
import { planPricing } from '../../../data/programs';
import { spaceSlug } from '../../../data/spaces';
import { Button, ButtonLink } from '../../ui/Button';
import { Reveal } from '../../ui/Reveal';
import { SectionHeading, container } from '../../ui/SectionHeading';
import type { Goal, Plan } from '../../../types';

function PriceBlock({ plan, goal }: { plan: Plan; goal: Goal }) {
  const { t, fmtPrice } = useLanguage();
  return (
    <div className="relative mt-8">
      <p className="flex items-baseline gap-2">
        <span className="font-display text-5xl leading-none sm:text-6xl">{fmtPrice(planPricing[goal][plan].monthly)}</span>
        <span className="text-sm font-semibold text-muted">{t.plans.perMonth}</span>
      </p>
    </div>
  );
}

/** Standard vs Premium cards with goal toggle. Reused on Home and Pricing. */
export function PlanComparison() {
  const { t } = useLanguage();
  const { user, tier, setTier, updateUser } = useAuth();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal>('muscle-gain');

  const choose = (plan: Plan) => {
    // L'achat (tier + objectif du programme choisi) ouvre la page dédiée.
    if (user) {
      setTier(plan);
      updateUser({ goal });
    }
    navigate(`/espace/${spaceSlug(plan, goal)}`);
  };

  return (
    <div>
      <div className="flex justify-center">
        <div role="group" aria-label={t.plans.goalLabel} className="inline-flex items-center rounded-full border border-edge bg-night-800 p-1">
          {(['muscle-gain', 'weight-loss'] as Goal[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={goal === option}
              onClick={() => setGoal(option)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
                goal === option ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
              )}
            >
              {option === 'muscle-gain' ? t.goals['muscle-gain'] : t.goals['weight-loss']}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Standard */}
        <article className="relative flex flex-col overflow-hidden rounded-2xl border border-edge bg-night-800 p-6 sm:p-8 lg:p-10">
          <div aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rotate-12 pattern-stripes opacity-10" />
          <p className="relative text-[11px] font-extrabold uppercase tracking-[0.24em] text-muted">
            <span className="text-volt">01</span> — {t.tiers.standard}
          </p>
          <h3 className="relative mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">{t.plans.standard.name}</h3>
          <p className="relative mt-3 text-muted">{t.plans.standard.tagline}</p>
          <PriceBlock plan="standard" goal={goal} />
          <ul className="relative mt-6 flex-1 space-y-3.5 border-t border-edge pt-6">
            {t.plans.standard.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-ink/90">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-volt/40 bg-volt/10 text-volt">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Button size="lg" fullWidth className="relative mt-10" onClick={() => choose('standard')}>
            {tier === 'standard' ? t.plans.currentPlan : t.plans.standard.cta}
          </Button>
        </article>

        {/* Premium */}
        <article className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-volt bg-night-700 p-6 sm:p-8 lg:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rotate-12 pattern-stripes opacity-[0.16]" />
          <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-sm bg-volt px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-night-900 sm:right-7 sm:top-7">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t.plans.recommended}
          </span>
          <p className="relative text-[11px] font-extrabold uppercase tracking-[0.24em] text-volt">02 — {t.tiers.premium}</p>
          <h3 className="relative mt-3 flex items-center gap-3 font-display text-4xl uppercase leading-none sm:text-5xl">
            {t.plans.premium.name}
            <Crown className="h-6 w-6 text-volt sm:h-7 sm:w-7" aria-hidden />
          </h3>
          <p className="relative mt-3 text-ink/75">{t.plans.premium.tagline}</p>
          <PriceBlock plan="premium" goal={goal} />
          <ul className="relative mt-6 flex-1 space-y-3.5 border-t border-volt/20 pt-6">
            {t.plans.premium.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt text-night-900">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <Button size="lg" fullWidth className="relative mt-10" icon={<Crown />} onClick={() => choose('premium')}>
            {tier === 'premium' ? t.plans.currentPlan : t.plans.premium.cta}
          </Button>
        </article>
      </div>
    </div>
  );
}

/** Home section wrapper around the comparison. */
export function PlansSection() {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="plans-title" className="relative overflow-hidden bg-night-900 py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 pattern-grid-soft fade-mask-radial" />
      <div className={cn(container, 'relative')}>
        <Reveal>
          <SectionHeading
            id="plans-title"
            align="center"
            eyebrow={t.plans.eyebrow}
            title={
              <>
                {t.plans.title1} <span className="text-volt">{t.plans.title2}</span>
              </>
            }
            subtitle={t.plans.subtitle}
          />
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <PlanComparison />
        </Reveal>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-6">
          <p className="text-sm text-muted">
            {t.plans.note}{' '}
            <Link to="/exercices" className="font-bold text-volt underline-offset-4 hover:underline">
              {t.plans.noteCta}
            </Link>
          </p>
          <ButtonLink to="/tarifs" variant="ghost" size="sm" iconRight={<ArrowRight />}>
            {t.plans.compare}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
