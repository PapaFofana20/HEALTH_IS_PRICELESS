import { Link } from 'react-router-dom';
import { ArrowRight, Check, Dumbbell, Flame } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { ButtonLink } from '../../ui/Button';
import { Reveal } from '../../ui/Reveal';
import { Eyebrow, container } from '../../ui/SectionHeading';

export function QuizBanner() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="quiz-banner-title" className="relative overflow-hidden border-y border-edge bg-night-800 py-20 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 pattern-stripes opacity-[0.06] fade-mask-left" />
      <div className={cn(container, 'relative grid items-center gap-14 lg:grid-cols-2')}>
        <Reveal>
          <Eyebrow>{t.quizBanner.eyebrow}</Eyebrow>
          <h2 id="quiz-banner-title" className="mt-4 font-display text-5xl uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            {t.quizBanner.title1} <span className="text-volt">{t.quizBanner.title2}</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">{t.quizBanner.text}</p>
          <ol className="mt-8 flex flex-wrap gap-2">
            {t.quizBanner.steps.map((step, index) => (
              <li
                key={step}
                className="inline-flex items-center gap-2 rounded-full border border-edge bg-night-900/60 py-1.5 pl-1.5 pr-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-volt text-[11px] text-night-900">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <ButtonLink to="/quiz" size="lg" iconRight={<ArrowRight />}>
              {t.quizBanner.cta}
            </ButtonLink>
            <span className="text-sm text-muted">{t.quizBanner.duration}</span>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mx-auto max-w-md">
            <div aria-hidden className="absolute -inset-4 -rotate-3 rounded-2xl border border-volt/25" />
            <div className="relative rotate-[1.5deg] rounded-2xl border border-edge bg-night-900 p-6 shadow-2xl shadow-black/50 transition-transform duration-500 hover:rotate-0 sm:p-8">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">
                <span>{t.quizBanner.previewStep}</span>
                <span className="text-volt">20%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-night-700">
                <div className="h-full w-1/5 rounded-full bg-volt" />
              </div>
              <p className="mt-7 font-display text-3xl uppercase leading-tight">{t.quizBanner.previewQuestion}</p>
              <div className="mt-6 grid gap-3">
                <Link
                  to="/quiz?goal=weight-loss"
                  className="flex items-center gap-4 rounded-xl border-2 border-volt bg-volt/10 p-4 transition-colors duration-200 hover:bg-volt/15"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-volt text-night-900">
                    <Flame className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="flex-1 font-bold">{t.quizBanner.previewA}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-volt text-night-900">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
                <Link
                  to="/quiz?goal=muscle-gain"
                  className="flex items-center gap-4 rounded-xl border border-edge p-4 transition-colors duration-200 hover:border-edge-strong hover:bg-night-800"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg border border-edge text-ink">
                    <Dumbbell className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="flex-1 font-bold">{t.quizBanner.previewB}</span>
                  <span className="h-6 w-6 rounded-full border border-edge-strong" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
