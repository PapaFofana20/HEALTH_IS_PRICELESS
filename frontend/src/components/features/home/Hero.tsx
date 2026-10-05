import { ArrowRight, Flame } from 'lucide-react';
import heroImg from '../../../assets/hero-athlete-2.png';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { communityMembers } from '../../../data/community';
import { ButtonLink } from '../../ui/Button';
import { Eyebrow, container } from '../../ui/SectionHeading';

export function Hero() {
  const { t, fmtNumber } = useLanguage();

  const stats = [
    { value: fmtNumber(communityMembers), suffix: '+', label: t.hero.statMembers },
    { value: '50', suffix: '+', label: t.hero.statPrograms },
    { value: fmtNumber(4.8, { minimumFractionDigits: 1 }), suffix: '/5', label: t.hero.statRating },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-night-900 pt-24 sm:pt-20 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-8">
      {/* Background: grid + soft navy glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-24 -z-10 h-[52rem] w-[52rem] rounded-full bg-night-700/70 blur-3xl" />

      <div className={cn(container, 'grid items-center gap-12 pb-14 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pb-0')}>
        {/* Copy — centered on mobile, left-aligned from lg */}
        <div className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left">
          <Eyebrow className="animate-fade-up lg:text-sm">{t.hero.eyebrow}</Eyebrow>
          <h1 className="mt-5 animate-fade-up font-display text-[4.5rem] uppercase leading-[0.88] tracking-tight [animation-delay:80ms] min-[360px]:text-[5rem] sm:text-[5.4rem] lg:mt-4 lg:text-[clamp(3rem,17svh,10rem)]">
            <span className="block">{t.hero.line1}</span>{' '}
            <span className="block">
              {t.hero.line2} <span className="text-volt">{t.hero.line2Accent}</span>
            </span>{' '}
            <span className="block txt-outline">{t.hero.line3}</span>{' '}
            <span className="block">{t.hero.line4}</span>
          </h1>
          <div className="mt-9 flex w-full animate-fade-up flex-col items-center gap-3 [animation-delay:220ms] sm:w-auto sm:flex-row sm:justify-center lg:mt-7 lg:justify-start">
            <ButtonLink to="/quiz" size="lg" iconRight={<ArrowRight />}>
              {t.hero.ctaPrimary}
            </ButtonLink>
            <ButtonLink to="/programmes" size="lg" variant="outline">
              {t.hero.ctaSecondary}
            </ButtonLink>
          </div>
          <dl className="mt-12 grid w-full max-w-xl animate-fade-up grid-cols-3 divide-x divide-edge border-y border-edge text-center [animation-delay:280ms] lg:mt-8 lg:max-w-2xl lg:text-left">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse items-center px-3 py-4 first:pl-0 sm:px-5 lg:items-start lg:py-3.5">
                <dt className="mt-1.5 text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-muted sm:text-[11px] lg:text-xs">{stat.label}</dt>
                <dd className="font-display text-3xl leading-none sm:text-4xl lg:text-[2.75rem]">
                  {stat.value}
                  <span className="text-volt">{stat.suffix}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual composition */}
        <div className="relative lg:col-span-6 lg:mx-auto lg:w-fit">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[560px] sm:aspect-[4/5] lg:aspect-square lg:h-[calc(100svh-1.5rem)] lg:w-auto lg:max-w-none">
            <div aria-hidden className="absolute right-0 top-[4%] h-[60%] w-[62%] pattern-stripes opacity-30 fade-mask-bottom" />
            <span aria-hidden className="absolute -left-4 bottom-[3%] select-none whitespace-nowrap font-display text-[6.5rem] leading-none txt-outline-soft sm:text-[9rem] lg:left-auto lg:-right-8 lg:text-[3rem] xl:text-[4rem]">
              HEALTH IS PRICELESS
            </span>
            <img
              src={heroImg}
              alt={t.hero.imageAlt}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover fade-mask-hero"
            />
            <div aria-hidden className="absolute left-[9%] top-[10%] h-[76%] w-[74%] -skew-x-6 rounded-sm border-2 border-volt/80 lg:left-[6%] lg:top-[9%] lg:h-[80%] lg:w-[86%]" />

            {/* Streak card */}
            <div className="absolute right-0 top-[6%] animate-fade-up rounded-lg border border-edge bg-night-800/90 p-3.5 shadow-2xl shadow-black/40 backdrop-blur-md [animation-delay:450ms] sm:-right-3 lg:right-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{t.hero.streakLabel}</p>
              <p className="mt-0.5 font-display text-2xl uppercase text-volt lg:text-[1.75rem]">{t.hero.streakValue}</p>
              <div aria-hidden className="mt-2 flex gap-1">
                {[1, 1, 1, 1, 1, 0, 0].map((on, index) => (
                  <span key={index} className={cn('h-5 w-2 rounded-sm', on ? 'bg-volt' : 'bg-night-600')} />
                ))}
              </div>
            </div>

            {/* Today's session card */}
            <div className="absolute -left-1 bottom-[21%] animate-float sm:-left-8 lg:-left-4">
              <div className="flex items-center gap-3 rounded-lg border border-edge bg-night-800/90 p-3.5 pr-5 shadow-2xl shadow-black/40 backdrop-blur-md">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-volt text-night-900 lg:h-12 lg:w-12">
                  <Flame className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{t.hero.todayLabel}</p>
                  <p className="font-display text-lg uppercase tracking-wide lg:text-xl">{t.hero.todayValue}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeTrack({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const row = [...items, ...items, ...items];
  return (
    <div className={cn('flex w-max animate-marquee', reverse && '[animation-direction:reverse]')}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden className="flex shrink-0 items-center">
          {row.map((item, index) => (
            <li key={`${copy}-${index}`} className="flex items-center gap-6 pr-6 font-display text-xl uppercase tracking-[0.08em] sm:text-2xl">
              <span>{item}</span>
              <span className="h-2 w-2 rotate-45 bg-current" />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/** Crossed bands under the hero: lime ticker over an outlined counter-band. */
export function Marquee() {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden bg-night-900 py-8 sm:py-10">
      <p className="sr-only">{t.marquee.join(' • ')}</p>
      <div aria-hidden className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[2deg] border-y border-edge bg-night-800 py-3 text-ink/25">
        <MarqueeTrack items={t.marquee} reverse />
      </div>
      <div aria-hidden className="relative -rotate-[1.5deg] scale-x-110 bg-volt py-3 text-night-900 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]">
        <MarqueeTrack items={t.marquee} />
      </div>
    </div>
  );
}
