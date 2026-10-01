import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Flame } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { media } from '../../../data/media';
import { programs } from '../../../data/programs';
import { Tag } from '../../ui/Badge';
import { Reveal } from '../../ui/Reveal';
import { SectionHeading, container } from '../../ui/SectionHeading';
import type { Goal } from '../../../types';

export function GoalSelector() {
  const { t } = useLanguage();

  const cards = [
    { goal: 'weight-loss' as Goal, number: '01', image: media.goals.weightLoss, content: t.goalSection.weightLoss, Icon: Flame },
    { goal: 'muscle-gain' as Goal, number: '02', image: media.goals.muscleGain, content: t.goalSection.muscleGain, Icon: Dumbbell },
  ];

  return (
    <section aria-labelledby="goal-title" className="relative bg-night-900 pb-20 pt-10 lg:pb-28 lg:pt-16">
      <div className={container}>
        <Reveal>
          <SectionHeading id="goal-title" eyebrow={t.goalSection.eyebrow} title={t.goalSection.title} subtitle={t.goalSection.subtitle} />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {cards.map(({ goal, number, image, content, Icon }, index) => {
            const count = programs.filter((program) => program.goal === goal).length;
            return (
              <Reveal key={goal} delay={index * 120} className="h-full">
                <Link
                  to={`/programmes?goal=${goal}`}
                  className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-2xl border border-edge bg-night-800 p-6 transition-colors duration-300 hover:border-volt/70 sm:h-[440px] sm:p-8 lg:h-[560px] lg:p-10"
                >
                  <img
                    src={image}
                    alt={content.imageAlt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-900 via-night-900/70 to-night-900/5" />
                  <span aria-hidden className="absolute right-6 top-4 font-display text-7xl leading-none txt-outline opacity-80 sm:right-8 sm:text-8xl">
                    {number}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-volt text-night-900">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <Tag tone="light">{t.goalSection.programsCount(count)}</Tag>
                    </div>
                    <h3 className="mt-5 font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">{content.title}</h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-ink/80">{content.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {content.tags.map((tag) => (
                        <li key={tag}>
                          <Tag tone="light">{tag}</Tag>
                        </li>
                      ))}
                    </ul>
                    <span className="mt-7 inline-flex items-center gap-3 text-[13px] font-extrabold uppercase tracking-[0.14em] text-volt">
                      {t.goalSection.cta}
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-volt/50 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-volt group-hover:text-night-900">
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
