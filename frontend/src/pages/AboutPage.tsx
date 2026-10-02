import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Eye, HeartHandshake, Mail, MessageCircle, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { coaches } from '../data/programs';
import { media } from '../data/media';
import { ButtonLink } from '../components/ui/Button';
import { FaqList } from '../components/ui/Faq';
import { Reveal } from '../components/ui/Reveal';
import { Eyebrow, PageHero, SectionHeading, container } from '../components/ui/SectionHeading';

const valueIcons: LucideIcon[] = [TrendingUp, Eye, Users, HeartHandshake];

export default function AboutPage() {
  const { t, loc } = useLanguage();
  usePageTitle(t.nav.about);
  const [params] = useSearchParams();

  // Deep links from the footer: /a-propos?section=faq|contact|legal
  useEffect(() => {
    const section = params.get('section');
    if (!section) return;
    const id = window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(id);
  }, [params]);

  return (
    <>
      <PageHero
        eyebrow={t.about.eyebrow}
        title={
          <>
            {t.about.title1} <span className="text-volt">{t.about.title2}</span>
          </>
        }
        subtitle={t.about.intro}
        image={media.aboutHero}
      />

      {/* Mission */}
      <section className="py-16 lg:py-24">
        <div className={cn(container, 'grid items-center gap-14 lg:grid-cols-2')}>
          <Reveal>
            <div className="relative isolate mr-4 sm:mr-6">
              <img src={media.aboutMission} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-[4/5]" />
              <div aria-hidden className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border-2 border-volt/60 sm:-bottom-6 sm:-right-6" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>{t.about.missionEyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{t.about.missionTitle}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{t.about.missionText}</p>
            <dl className="mt-10 grid grid-cols-2 gap-4">
              {t.about.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse rounded-xl border border-edge bg-night-800 p-5">
                  <dt className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{stat.label}</dt>
                  <dd className="font-display text-4xl text-volt">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.about.values.map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
                <Reveal key={value.title} delay={index * 70} className="h-full">
                  <article className="h-full rounded-2xl border border-edge bg-night-800 p-6 transition-colors duration-300 hover:border-volt/40">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl border border-volt/30 bg-volt/10 text-volt">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span aria-hidden className="font-display text-4xl leading-none txt-outline-soft">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-2xl uppercase">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading eyebrow={t.about.teamEyebrow} title={t.about.teamTitle} />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach, index) => (
              <Reveal
                key={coach.id}
                delay={index * 80}
                className={cn('h-full', index === coaches.length - 1 && 'sm:col-span-2 lg:col-span-1')}
              >
                <article className="flex h-full flex-col items-start rounded-2xl border border-edge bg-night-800 p-6">
                  <img src={coach.avatar} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-volt/60 ring-offset-4 ring-offset-night-800" />
                  <h3 className="mt-6 font-display text-2xl uppercase">{coach.name}</h3>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">{loc(coach.role)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{loc(coach.bio)}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={cn(container, 'grid gap-10 lg:grid-cols-12')}>
          <div className="lg:col-span-4">
            <SectionHeading eyebrow={t.about.faqEyebrow} title={t.about.faqTitle} />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={t.about.faq} />
          </div>
        </div>
      </section>

      {/* Contact — volt CTA banner */}
      <section id="contact" className="scroll-mt-24 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-volt text-night-900">
              <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-64 w-64 rotate-12 pattern-stripes-dark opacity-15" />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-10 right-4 hidden select-none font-display text-[12rem] leading-none txt-outline-dark opacity-60 sm:block lg:right-10"
              >
                ?
              </span>
              <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-12 lg:gap-8 lg:p-16">
                <div className="lg:col-span-7">
                  <SectionHeading
                    tone="light"
                    eyebrow={t.about.contactEyebrow}
                    title={t.about.contactTitle}
                  />
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <ButtonLink
                      to="https://wa.me/2250700000000?text=Bonjour%20HEALTH%20IS%20PRICELESS%2C%20j%27ai%20une%20question."
                      target="_blank"
                      rel="noopener noreferrer"
                      size="lg"
                      variant="dark"
                      icon={<MessageCircle className="h-5 w-5" aria-hidden />}
                    >
                      {t.about.contactCta}
                    </ButtonLink>
                    <a
                      href="mailto:contact@forge.app"
                      className="group inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-night-900/20 px-7 text-[13px] font-extrabold uppercase tracking-[0.12em] transition-all duration-200 hover:border-night-900 active:scale-[0.98]"
                    >
                      <Mail className="h-4 w-4" aria-hidden />
                      contact@forge.app
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <ul className="flex h-full flex-col justify-center gap-2 rounded-2xl bg-night-900 p-6 text-ink sm:p-7">
                    <li>
                      <a href="mailto:contact@forge.app" className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-night-800">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-volt text-night-900">
                          <Mail className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">Email</span>
                          <span className="block truncate font-bold group-hover:text-volt">contact@forge.app</span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/2250700000000?text=Bonjour%20HEALTH%20IS%20PRICELESS%2C%20j%27ai%20une%20question."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-night-800"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-volt text-night-900">
                          <MessageCircle className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">WhatsApp</span>
                          <span className="block font-bold group-hover:text-volt">+225 07 00 00 00 00</span>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Legal */}
      <section id="legal" className="scroll-mt-24 border-t border-edge bg-night-950 py-16 lg:py-20">
        <div className={cn(container, 'grid gap-10 lg:grid-cols-12')}>
          <div className="lg:col-span-4">
            <SectionHeading eyebrow={t.about.legalEyebrow} title={t.about.legalTitle} />
          </div>
          <ul className="space-y-4 lg:col-span-8">
            {t.about.legal.map((paragraph) => (
              <li key={paragraph} className="flex gap-4 rounded-xl border border-edge bg-night-900 p-5 text-sm leading-relaxed text-muted">
                <ShieldCheck className="h-5 w-5 shrink-0 text-volt" aria-hidden />
                {paragraph}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
