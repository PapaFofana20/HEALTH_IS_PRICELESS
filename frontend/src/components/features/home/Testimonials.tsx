import { useState } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { testimonials } from '../../../data/community';
import { getProgramById } from '../../../data/programs';
import { Rating, Tag } from '../../ui/Badge';
import { Reveal } from '../../ui/Reveal';
import { SectionHeading, container } from '../../ui/SectionHeading';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Testimonials() {
  const { t, loc } = useLanguage();
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const current = testimonials[index];
  const next = testimonials[(index + 1) % total];
  const go = (direction: 1 | -1) => setIndex((value) => (value + direction + total) % total);

  const programName = (programId: string) => {
    const program = getProgramById(programId);
    return program ? loc(program.name) : '';
  };

  const controls = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t.testimonials.prev}
        className="grid h-12 w-12 place-items-center rounded-full border border-night-900/20 text-night-900 transition-colors duration-200 hover:bg-night-900 hover:text-volt"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t.testimonials.next}
        className="grid h-12 w-12 place-items-center rounded-full bg-night-900 text-volt transition-transform duration-200 hover:-translate-y-0.5"
      >
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );

  return (
    <section aria-labelledby="testimonials-title" className="relative overflow-hidden bg-mist py-20 text-night-900 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 pattern-dots-dark" />
      <div className={cn(container, 'relative')}>
        <Reveal>
          <SectionHeading
            id="testimonials-title"
            tone="light"
            eyebrow={t.testimonials.eyebrow}
            title={t.testimonials.title}
            subtitle={t.testimonials.subtitle}
            action={controls}
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12" aria-live="polite">
          <figure key={current.id} className="flex  flex-col justify-between border-l-4 border-night-900 pl-6 sm:pl-10 lg:col-span-7">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-md bg-night-900 text-volt">
                <Quote className="h-5 w-5" aria-hidden />
              </span>
              <blockquote className="mt-6 font-display text-2xl uppercase leading-[1.12] tracking-wide sm:text-3xl lg:text-[2.35rem]">
                «{loc(current.quote)}»
              </blockquote>
            </div>
            <figcaption className="mt-8 flex flex-wrap items-center gap-4">
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-night-900 text-lg font-extrabold tracking-wide text-volt ring-2 ring-night-900 ring-offset-2 ring-offset-mist"
              >
                {initials(current.name)}
              </span>
              <div>
                <p className="font-extrabold">
                  {current.name}, {current.age} {t.common.years}
                </p>
                <p className="text-sm text-slate-600">
                  {t.testimonials.followed} : {programName(current.programId)} · {loc(current.duration)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:ml-auto">
                <Tag tone="dark">{t.goals[current.goal]}</Tag>
                <Rating value={current.rating} tone="dark" />
              </div>
            </figcaption>
          </figure>

          <figure key={next.id} className="relative flex  flex-col justify-between overflow-hidden rounded-2xl bg-volt p-7 sm:p-9 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rotate-12 pattern-stripes-dark opacity-15" />
            <blockquote className="relative text-lg font-semibold leading-relaxed sm:text-xl">«{loc(next.quote)}»</blockquote>
            <figcaption className="relative mt-8 flex items-center gap-4">
              <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-night-900 text-base font-extrabold tracking-wide text-volt ring-2 ring-night-900">
                {initials(next.name)}
              </span>
              <div>
                <p className="font-extrabold">
                  {next.name}, {next.age} {t.common.years}
                </p>
                <p className="text-sm text-night-900/70">
                  {t.goals[next.goal]} · {programName(next.programId)}
                </p>
              </div>
              <Rating value={next.rating} tone="dark" className="ml-auto" />
            </figcaption>
          </figure>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t.testimonials.goTo(i + 1)}
                aria-current={i === index}
                className="grid h-11 w-11 place-items-center focus-visible:outline-night-900"
              >
                <span
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === index ? 'w-10 bg-night-900' : 'w-4 bg-night-900/25 hover:bg-night-900/50',
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-bold text-slate-600">{t.testimonials.summary}</p>
        </div>
      </div>
    </section>
  );
}
