import { ArrowRight, Check, Crown, Minus } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { pricingFeatures } from '../data/programs';
import { PlanComparison } from '../components/features/programs/PlanComparison';
import { ButtonLink } from '../components/ui/Button';
import { FaqList } from '../components/ui/Faq';
import { Reveal } from '../components/ui/Reveal';
import { ScrollTable } from '../components/ui/ScrollTable';
import { PageHero, SectionHeading, container } from '../components/ui/SectionHeading';
import type { FeatureAvailability, Tier } from '../types';

const TIERS: Tier[] = ['standard', 'premium'];

function Availability({ value }: { value: FeatureAvailability }) {
  const { t } = useLanguage();
  if (value === true) {
    return (
      <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-volt text-night-900">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">{t.common.included}</span>
      </span>
    );
  }
  if (value === 'limited') {
    return <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted">{t.common.limited}</span>;
  }
  return (
    <span className="inline-grid h-7 w-7 place-items-center text-edge-strong">
      <Minus className="h-4 w-4" aria-hidden />
      <span className="sr-only">{t.common.notIncluded}</span>
    </span>
  );
}

export default function PricingPage() {
  const { t, loc } = useLanguage();
  usePageTitle(t.nav.pricing);
  const { user, tier } = useAuth();

  return (
    <>
      <PageHero
        eyebrow={t.pricing.eyebrow}
        title={
          <>
            {t.pricing.title1} <span className="text-volt">{t.pricing.title2}</span>
          </>
        }
        subtitle={t.pricing.subtitle}
      >
        {user && (
          <p className="inline-flex items-center gap-2 rounded-full border border-volt/40 bg-volt/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">
            <Crown className="h-4 w-4" aria-hidden />
            {t.pricing.currentTier(t.tiers[tier])}
          </p>
        )}
      </PageHero>

      <section className="py-16 lg:py-20">
        <div className={container}>
          <PlanComparison />
        </div>
      </section>

      <section className="border-y border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading eyebrow={t.pricing.tableEyebrow} title={t.pricing.tableTitle} />
          </Reveal>
          <div className="mt-10">
            <ScrollTable className="rounded-2xl border border-edge bg-night-900">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">{t.pricing.tableTitle}</caption>
                <thead>
                  <tr className="border-b border-edge bg-night-800">
                    <th scope="col" className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">
                      {t.pricing.feature}
                    </th>
                    {TIERS.map((item) => (
                      <th key={item} scope="col" className={cn('px-5 py-4 text-center font-display text-xl uppercase', item === 'premium' && 'text-volt')}>
                        {t.tiers[item]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {pricingFeatures.map((feature) => (
                    <tr key={feature.label.en} className="transition-colors hover:bg-night-800/60">
                      <th scope="row" className="px-5 py-4 font-semibold text-ink/90">
                        {loc(feature.label)}
                      </th>
                      {TIERS.map((item) => (
                        <td key={item} className={cn('px-5 py-4 text-center', item === 'premium' && 'bg-volt/[0.03]')}>
                          <Availability value={feature[item]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollTable>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className={cn(container, 'grid gap-12 lg:grid-cols-12')}>
          <div className="lg:col-span-4">
            <SectionHeading eyebrow={t.pricing.faqEyebrow} title={t.pricing.faqTitle} />
            <div className="mt-8 rounded-2xl border border-edge bg-night-800 p-6">
              <p className="font-display text-2xl uppercase">{t.pricing.freeCtaTitle}</p>
              <p className="mt-2 text-sm text-muted">{t.pricing.freeCtaText}</p>
              <ButtonLink to="/exercices" variant="outline" size="sm" className="mt-5" iconRight={<ArrowRight />}>
                {t.pricing.freeCta}
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={t.pricing.faq} />
          </div>
        </div>
      </section>
    </>
  );
}
