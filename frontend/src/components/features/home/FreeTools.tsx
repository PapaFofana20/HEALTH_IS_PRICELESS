import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { bmiGaugePosition } from '../../../utils/fitness';
import { media, unsplash } from '../../../data/media';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Reveal } from '../../ui/Reveal';
import { SectionHeading, container } from '../../ui/SectionHeading';
import { BmiCalculator, CalorieCalculator, ProteinCalculator } from '../nutrition/Calculators';

type ToolKey = 'bmi' | 'calories' | 'protein';

interface ToolCardProps {
  title: string;
  text: string;
  image: string;
  action: ReactNode;
}

function ToolCard({ title, text, image, action }: ToolCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-edge bg-night-800 transition-colors duration-300 hover:border-volt/50">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/20 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl uppercase leading-none">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
        <div className="mt-auto pt-6">{action}</div>
      </div>
    </article>
  );
}

function LinkCard({ to, title, text, cta, image }: { to: string; title: string; text: string; cta: string; image: string }) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-edge bg-night-800 transition-all duration-300 hover:-translate-y-1 hover:border-edge-strong"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/20 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl uppercase leading-none">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors group-hover:text-volt">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function FreeTools() {
  const { t, fmtNumber } = useLanguage();
  const [tool, setTool] = useState<ToolKey | null>(null);
  const sampleBmi = 22.9;

  return (
    <section aria-labelledby="free-title" className="relative overflow-hidden border-t border-edge bg-night-800/30 py-20 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 pattern-dots opacity-50 fade-mask-radial" />
      <div className={cn(container, 'relative')}>
        <Reveal>
          <SectionHeading
            id="free-title"
            eyebrow={t.freeTools.eyebrow}
            title={
              <>
                {t.freeTools.title1} <span className="text-volt">{t.freeTools.title2}</span>
              </>
            }
            subtitle={t.freeTools.subtitle}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {/* BMI — same height as the other calculator cards */}
          <Reveal className="h-full sm:col-span-2 lg:col-span-2">
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-edge bg-night-800 p-6 transition-colors duration-300 hover:border-volt/50">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rotate-12 pattern-stripes opacity-10" />
              <div className="relative">
                <h3 className="font-display text-3xl uppercase leading-none">{t.freeTools.bmi.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.freeTools.bmi.text}</p>
              </div>
              <div className="relative mt-6">
                <div aria-hidden className="flex items-end justify-between">
                  <span className="font-display text-5xl leading-none text-volt">{fmtNumber(sampleBmi)}</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-success">{t.calc.bmi.categories.normal}</span>
                </div>
                <div aria-hidden className="relative mt-3 h-2">
                  <div className="flex h-full overflow-hidden rounded-full">
                    <span className="h-full bg-sky-400/70" style={{ width: '14%' }} />
                    <span className="h-full bg-success" style={{ width: '26%' }} />
                    <span className="h-full bg-amber-400" style={{ width: '20%' }} />
                    <span className="h-full bg-red-400" style={{ width: '40%' }} />
                  </div>
                  <span
                    className="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-night-800"
                    style={{ left: `${bmiGaugePosition(sampleBmi)}%` }}
                  />
                </div>
                <Button variant="outline" size="sm" className="mt-6" onClick={() => setTool('bmi')} iconRight={<ArrowRight />}>
                  {t.freeTools.bmi.cta}
                </Button>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full sm:col-span-2 lg:col-span-2" delay={80}>
            <ToolCard
              title={t.freeTools.calories.title}
              text={t.freeTools.calories.text}              image={unsplash('photo-1744444202869-54debf97b285')}
              action={
                <Button variant="outline" size="sm" onClick={() => setTool('calories')} iconRight={<ArrowRight />}>
                  {t.freeTools.calories.cta}
                </Button>
              }
            />
          </Reveal>

          <Reveal className="h-full sm:col-span-2 lg:col-span-2" delay={120}>
            <ToolCard
              title={t.freeTools.protein.title}
              text={t.freeTools.protein.text}              image={unsplash('photo-1652769710760-c7a93ad559c0')}
              action={
                <Button variant="outline" size="sm" onClick={() => setTool('protein')} iconRight={<ArrowRight />}>
                  {t.freeTools.protein.cta}
                </Button>
              }
            />
          </Reveal>

          <Reveal className="h-full lg:col-span-2" delay={160}>
            <LinkCard to="/exercices" image={media.exercises.squat} {...t.freeTools.exercises} />
          </Reveal>

          <Reveal className="h-full lg:col-span-2" delay={200}>
            <LinkCard to="/conseils?cat=training" image={media.articles.startTraining} {...t.freeTools.tips} />
          </Reveal>

          <Reveal className="h-full lg:col-span-2" delay={60}>
            <LinkCard to="/conseils?cat=nutrition" image={media.articles.protein} {...t.freeTools.articles} />
          </Reveal>

          <Reveal className="h-full sm:col-span-2 lg:col-span-6" delay={120}>
            <Link
              to="/nutrition?section=recipes"
              className="group relative flex h-full min-h-[220px] overflow-hidden rounded-2xl border border-edge bg-night-800 transition-colors duration-300 hover:border-edge-strong lg:min-h-[280px]"
            >
              <img
                src={unsplash('photo-1770966666349-7b7708a8c0c2')}
                alt=""
                loading="lazy"
                className="absolute inset-y-0 right-0 h-full w-3/5 object-cover transition-transform duration-700 ease-out group-hover:scale-105 lg:w-1/2"
              />
              <div aria-hidden className="absolute inset-0 bg-linear-to-r from-night-800 via-night-800/90 to-night-800/10" />
              <div className="relative flex max-w-xs flex-col justify-center p-6 sm:p-8 lg:max-w-sm">
                <h3 className="font-display text-3xl uppercase leading-none">{t.freeTools.recipes.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.freeTools.recipes.text}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors group-hover:text-volt">
                  {t.freeTools.recipes.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>

      <Modal open={tool !== null} onClose={() => setTool(null)} title={tool ? t.freeTools[tool].title : ''} size="xl">
        {tool === 'bmi' && <BmiCalculator />}
        {tool === 'calories' && <CalorieCalculator />}
        {tool === 'protein' && <ProteinCalculator />}
      </Modal>
    </section>
  );
}
