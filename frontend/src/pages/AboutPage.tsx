import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dumbbell, Mail, MessageCircle, Salad, TrendingUp, UserRound } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { media } from '../data/media';
import { ButtonLink } from '../components/ui/Button';
import { FaqList } from '../components/ui/Faq';
import { Reveal } from '../components/ui/Reveal';
import { Eyebrow, PageHero, SectionHeading, container } from '../components/ui/SectionHeading';
import founderPapaFofana from '../assets/founder-papa-fofana.jpg';

const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? 'contact@hip.app';
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '2250700000000';
const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20HEALTH%20IS%20PRICELESS%2C%20j%27ai%20une%20question.`;
const waDisplay = '+225 07 00 00 00 00';

const FOUNDER_PHOTOS: (string | null)[] = [null, founderPapaFofana];

function mark(text: string) {
  return text.split(/\{\{(.+?)\}\}/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="text-volt">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function AboutPage() {
  const { t } = useLanguage();
  usePageTitle(t.nav.about, t.about.heroSubtitle);
  const [params] = useSearchParams();

  useEffect(() => {
    document.title = 'À propos | HEALTH IS PRICELESS';
  }, []);

  useEffect(() => {
    const section = params.get('section');
    if (!section) return;
    const id = window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(id);
  }, [params]);

  return (
    <>
      <PageHero
        eyebrow={t.about.heroEyebrow}
        title={mark(t.about.heroTitle)}
        subtitle={t.about.heroSubtitle}
        image={media.aboutHero}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#vision"
            className="inline-flex h-13 items-center justify-center rounded-full bg-volt px-7 text-[13px] font-extrabold uppercase tracking-[0.12em] text-night-900 transition-all duration-150 hover:-translate-y-0.5 hover:bg-volt-dark active:scale-[0.97]"
          >
            {t.about.heroVisionCta}
          </a>
          <ButtonLink to="/programmes" size="lg" variant="outline">
            {t.about.heroProgramsCta}
          </ButtonLink>
        </div>
      </PageHero>

      {/* Vision */}
      <section id="vision" className="scroll-mt-24 py-16 lg:py-24">
        <div className={cn(container, 'grid items-start gap-12 lg:grid-cols-2')}>
          <Reveal>
            <Eyebrow>{t.about.visionLabel}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{mark(t.about.visionTitle)}</h2>
            <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted">{t.about.visionText}</p>
          </Reveal>
          <div className="grid gap-4">
            {t.about.visionBlocks.map((block, index) => (
              <Reveal key={block.title} delay={index * 80}>
                <article className="flex items-start gap-4 rounded-2xl border border-edge bg-night-800 p-6 transition-colors duration-300 hover:border-volt/40">
                  <span aria-hidden className="font-display text-4xl leading-none txt-outline-soft">0{index + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl uppercase">{block.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{block.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="border-y border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <Eyebrow>{t.about.whyLabel}</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{mark(t.about.whyTitle)}</h2>
            <p className="mt-6 max-w-3xl border-l-2 border-volt pl-5 font-display text-2xl uppercase leading-snug text-ink sm:text-3xl">{t.about.whyQuote}</p>
            <p className="mt-5 max-w-2xl text-muted">{t.about.whyText}</p>
          </Reveal>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.about.whySteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 70} className="h-full">
                <li className="h-full rounded-2xl border border-edge bg-night-800 p-6">
                  <span className="font-display text-4xl text-volt">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-xl uppercase">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Problème */}
      <section className="py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading title={mark(t.about.problemTitle)} />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.about.problems.map((problem, index) => (
              <Reveal key={problem.title} delay={index * 80} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-edge bg-night-800 p-6">
                  <span className="font-display text-5xl leading-none txt-outline">0{index + 1}</span>
                  <h3 className="mt-6 font-display text-2xl uppercase">{problem.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{problem.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Réponse / écosystème */}
      <section className="border-t border-edge bg-night-950 py-16 lg:py-24">
        <div className={cn(container, 'grid items-center gap-12 lg:grid-cols-2')}>
          <Reveal>
            <Eyebrow>{t.about.responseLabel}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{mark(t.about.responseTitle)}</h2>
            <p className="mt-5 text-muted">{t.about.responseText}</p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {t.about.responseFeatures.map((feature) => (
                <li key={feature} className="rounded-xl border border-edge bg-night-800 px-4 py-3 text-sm font-semibold text-ink/90">
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mx-auto grid aspect-square w-full max-w-md place-items-center rounded-3xl border border-edge bg-night-800">
              <div aria-hidden className="absolute inset-6 rounded-full border border-edge/60" />
              <div aria-hidden className="absolute inset-16 rounded-full border border-edge/40" />
              <p className="absolute font-display text-2xl uppercase leading-none text-volt">HEALTH IS<br />PRICELESS</p>
              <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-edge bg-night-900 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]">Sport</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-night-900 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]">Nutrition</span>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-edge bg-night-900 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]">Progression</span>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-edge bg-night-900 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]">Analyse</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 piliers */}
      <section className="py-16 lg:py-24">
        <div className={container}>
          <div className="grid gap-4 md:grid-cols-3">
            {t.about.pillars.map((pillar, index) => {
              const Icon = [Dumbbell, Salad, TrendingUp][index % 3];
              return (
                <Reveal key={pillar.title} delay={index * 80} className="h-full">
                  <article className="flex h-full flex-col rounded-2xl border border-edge bg-night-800 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-volt/40 hover:shadow-2xl hover:shadow-black/40">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-volt/30 bg-volt/10 text-volt">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="mt-8 font-display text-2xl text-volt">0{index + 1}</span>
                    <h3 className="mt-2 font-display text-3xl uppercase">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cofondateurs */}
      <section className="border-t border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading title={mark(t.about.foundersTitle)} />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {t.about.founders.map((founder, index) => {
              const photo = FOUNDER_PHOTOS[index];
              return (
                <Reveal key={index} delay={index * 100} className="h-full">
                  <figure className="flex h-full flex-col rounded-2xl border border-edge bg-night-800 p-6 sm:p-8">
                    <div
                      className={cn(
                        'relative aspect-square w-full overflow-hidden rounded-2xl bg-night-900',
                        photo ? 'border border-edge' : 'border border-dashed border-edge-strong',
                      )}
                    >
                      {photo ? (
                        <img src={photo} alt={founder.name} className="h-full w-full object-cover object-top" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
                          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-edge-strong text-edge-strong">
                            <UserRound className="h-7 w-7" aria-hidden />
                          </span>
                          <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted/70">{t.about.foundersPhotoHint}</span>
                        </div>
                      )}
                    </div>
                    <figcaption className="mt-5">
                      {founder.name && <p className="font-display text-2xl uppercase leading-none">{founder.name}</p>}
                      <p className={cn('text-[11px] font-extrabold uppercase tracking-[0.16em] text-volt', founder.name && 'mt-2')}>{founder.role}</p>
                    </figcaption>
                    <blockquote className="mt-5 flex-1">
                      <span aria-hidden className="block font-display text-6xl leading-[0.6] text-volt">“</span>
                      <p className="mt-4 text-base leading-relaxed text-ink/90 sm:text-lg">{founder.quote}</p>
                      <span aria-hidden className="mt-3 block text-right font-display text-6xl leading-[0.6] text-volt">”</span>
                    </blockquote>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Approche */}
      <section className="py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <Eyebrow>{t.about.approachLabel}</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{mark(t.about.approachTitle)}</h2>
            <p className="mt-5 max-w-2xl text-muted">{t.about.approachText}</p>
          </Reveal>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.about.approachSteps.map((step, index) => (
              <li key={step.title} className="border-l border-edge pl-5">
                <span className="font-display text-4xl text-volt">0{index + 1}</span>
                <h3 className="mt-3 font-display text-xl uppercase">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Valeurs */}
      <section className="border-y border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-5">
            {t.about.values.map((value, index) => (
              <Reveal key={value.title} delay={index * 60}>
                <h3 className="font-display text-2xl uppercase text-volt">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ambition */}
      <section className="relative isolate overflow-hidden">
        <img src={media.aboutMission} alt="" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-night-950/70" />
        <div className={cn(container, 'py-20 lg:py-28')}>
          <Reveal>
            <Eyebrow>{t.about.ambitionLabel}</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] sm:text-6xl">{mark(t.about.ambitionTitle)}</h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">{t.about.ambitionText}</p>
          </Reveal>
        </div>
      </section>

      {/* Ce que nous construisons */}
      <section className="py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{mark(t.about.buildingTitle)}</h2>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {t.about.buildingItems.map((item, index) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl border border-edge bg-night-800 p-5">
                <span className="font-display text-xl text-volt">0{index + 1}</span>
                <span className="text-sm font-bold uppercase tracking-[0.1em]">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-display text-2xl uppercase text-volt">{t.about.buildingFooter}</p>
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

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-volt text-night-900">
              <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-12 lg:p-16">
                <div className="lg:col-span-7">
                  <SectionHeading tone="light" eyebrow={t.about.contactEyebrow} title={t.about.contactTitle} />
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <ButtonLink to={waLink} target="_blank" rel="noopener noreferrer" size="lg" variant="dark" icon={<MessageCircle className="h-5 w-5" aria-hidden />}>
                      {t.about.contactCta}
                    </ButtonLink>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex h-13 items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-night-900/20 px-7 text-[13px] font-extrabold uppercase tracking-[0.12em] transition-colors hover:border-night-900">
                      <Mail className="h-4 w-4" aria-hidden />
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <ul className="flex h-full flex-col justify-center gap-2 rounded-2xl bg-night-900 p-6 text-ink sm:p-7">
                    <li>
                      <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-night-800">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-volt text-night-900"><Mail className="h-5 w-5" aria-hidden /></span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">Email</span>
                          <span className="block truncate font-bold group-hover:text-volt">{CONTACT_EMAIL}</span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-night-800">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-volt text-night-900"><MessageCircle className="h-5 w-5" aria-hidden /></span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">WhatsApp</span>
                          <span className="block font-bold group-hover:text-volt">{waDisplay}</span>
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

      {/* CTA final */}
      <section className="relative isolate overflow-hidden border-t border-edge">
        <img
          src="https://images.unsplash.com/photo-1765302755287-e3288ea8fbcb?auto=format&fit=crop&w=1600&h=900&q=70"
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-night-950 via-night-950/60 to-night-950/30" />
        <div className={cn(container, 'py-20 text-center lg:py-28')}>
          <Reveal>
            <h2 className="font-display text-5xl uppercase leading-[0.95] sm:text-6xl lg:text-7xl">{mark(t.about.finalTitle)}</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted">{t.about.finalSubtitle}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink to="/quiz" size="lg">{t.about.finalPrimary}</ButtonLink>
              <ButtonLink to="/programmes" size="lg" variant="outline">{t.about.finalSecondary}</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
