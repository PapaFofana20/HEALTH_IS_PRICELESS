import { useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, FileText, Info, Scale, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage, usePageTitle } from '../../hooks/useLanguage';
import { cgu, privacy } from '../../data/legal';
import type { LegalDoc } from '../../data/legal';
import { Eyebrow, container } from '../ui/SectionHeading';
import { ButtonLink } from '../ui/Button';
import { NotFoundState } from '../ui/States';

export type LegalDocKey = 'confidentialite' | 'cgu';

const DOCS: Record<LegalDocKey, LegalDoc> = { confidentialite: privacy, cgu };

/* Paragraphe mis en avant (callout) : cite un passage existant du document. */
const FEATURED: Record<LegalDocKey, { section: number; paragraph: number }> = {
  confidentialite: { section: 4, paragraph: 0 },
  cgu: { section: 2, paragraph: 0 },
};

const SECTION_ICONS = [ShieldCheck, FileText, Scale, Info] as const;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

export function LegalPageLayout({ docKey }: { docKey: LegalDocKey }) {
  const { t, loc } = useLanguage();
  const doc = DOCS[docKey];
  const [activeSection, setActiveSection] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const isPrivacy = docKey === 'confidentialite';
  const featured = FEATURED[docKey];

  const subtitle = isPrivacy ? t.about.legalPrivacySubtitle : t.about.legalCguSubtitle;

  usePageTitle(doc ? loc(doc.title) : '', subtitle);

  useEffect(() => {
    if (doc) document.title = `${loc(doc.title)} | HEALTH IS PRICELESS`;
  }, [doc, loc]);

  useEffect(() => {
    if (!doc) return;
    const hash = window.location.hash.replace('#', '');
    const match = /^legal-section-(\d+)$/.exec(hash);
    if (!match) return;
    const index = Number(match[1]);
    if (index < 0 || index >= doc.sections.length) return;
    setActiveSection(index);
    const id = window.setTimeout(
      () => document.getElementById(`legal-section-${index}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }),
      150,
    );
    return () => window.clearTimeout(id);
  }, [doc]);

  if (!doc) return <NotFoundState />;

  const jump = (index: number) => {
    setActiveSection(index);
    setTocOpen(false);
    window.history.replaceState(null, '', `#legal-section-${index}`);
    document.getElementById(`legal-section-${index}`)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };

  const HeroIcon = isPrivacy ? ShieldCheck : FileText;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-edge bg-night-900 pb-12 pt-32 sm:pb-14 lg:pb-16 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
        <div className={container}>
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="grid h-14 w-14 shrink-0  place-items-center rounded-2xl border border-edge/70 bg-night-800 text-volt"
            >
              <HeroIcon className="h-7 w-7" />
            </span>
            <Eyebrow className="">{t.about.legalEyebrow}</Eyebrow>
          </div>
          <h1 className="mt-6 max-w-3xl  font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            {loc(doc.title)}
          </h1>
          <p className="mt-4 max-w-2xl  text-base leading-relaxed text-muted sm:text-lg">
            {subtitle}
          </p>
          <p className="mt-5 inline-flex  items-center gap-2 rounded-full border border-edge/70 bg-night-800/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
            <CalendarDays className="h-3.5 w-3.5 text-volt" aria-hidden />
            {loc(doc.updated)}
          </p>
        </div>
      </section>

      <section className="bg-night-950 py-14 lg:py-20">
        <div className={cn(container, 'grid gap-8 lg:grid-cols-12')}>
          <aside className="lg:col-span-4 xl:col-span-3">
            <nav
              aria-label={t.about.legalToc}
              className="rounded-2xl border border-edge/70 bg-night-900/70 lg:sticky lg:top-24"
            >
              <button
                type="button"
                onClick={() => setTocOpen((open) => !open)}
                aria-expanded={tocOpen}
                className="flex w-full items-center justify-between gap-3 p-4 text-left lg:cursor-default"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                  {t.about.legalToc}
                </span>
                <ChevronDown
                  className={cn('h-4 w-4 text-muted transition-transform duration-200 lg:hidden', tocOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>
              <ol className={cn('grid gap-1 px-3 pb-3 sm:grid-cols-2 lg:grid-cols-1', !tocOpen && 'hidden lg:grid')}>
                {doc.sections.map((section, index) => (
                  <li key={loc(section.heading)}>
                    <button
                      type="button"
                      onClick={() => jump(index)}
                      aria-current={activeSection === index ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-150',
                        activeSection === index ? 'bg-volt/10 text-ink' : 'text-muted hover:bg-night-800 hover:text-ink',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'font-display text-base leading-none',
                          activeSection === index ? 'text-volt' : 'text-muted/60',
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{loc(section.heading)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <div className="max-w-[800px] overflow-hidden rounded-2xl border border-edge/70 bg-night-900/70">
              {doc.sections.map((section, sectionIndex) => {
                const SectionIcon = SECTION_ICONS[sectionIndex % SECTION_ICONS.length];
                return (
                  <article
                    key={loc(section.heading)}
                    id={`legal-section-${sectionIndex}`}
                    className="scroll-mt-28 border-b border-edge/60 p-6 last:border-b-0 sm:p-8 lg:p-10"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-edge/70 bg-night-800 text-volt"
                      >
                        {isPrivacy ? (
                          <SectionIcon className="h-5 w-5" />
                        ) : (
                          <span className="font-display text-lg leading-none">
                            {String(sectionIndex + 1).padStart(2, '0')}
                          </span>
                        )}
                      </span>
                      <h2 className="font-display text-2xl uppercase leading-tight tracking-tight sm:text-[1.7rem]">
                        {loc(section.heading)}
                      </h2>
                    </div>
                    <div className="mt-5 space-y-4">
                      {section.paragraphs.map((paragraph, paragraphIndex) => {
                        const text = loc(paragraph);
                        if (sectionIndex === featured.section && paragraphIndex === featured.paragraph) {
                          return (
                            <div
                              key={text}
                              className="rounded-xl border border-volt/30 bg-volt/[0.07] p-5"
                            >
                              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-volt">
                                {isPrivacy ? (
                                  <ShieldCheck className="h-4 w-4" aria-hidden />
                                ) : (
                                  <Info className="h-4 w-4" aria-hidden />
                                )}
                                {isPrivacy ? t.about.legalCalloutPrivacy : t.about.legalCalloutCgu}
                              </p>
                              <p className="mt-3 text-[15px] leading-[1.75] text-ink">{text}</p>
                            </div>
                          );
                        }
                        return (
                          <p key={text} className="text-[15px] leading-[1.75] text-muted sm:text-base">
                            {text}
                          </p>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="mt-8 flex max-w-[800px] flex-col gap-4 rounded-2xl border border-edge/70 bg-night-900/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-tight">{t.about.legalHelpTitle}</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{t.about.legalHelpText}</p>
              </div>
              <ButtonLink to="/a-propos?section=contact" className="shrink-0">
                {t.about.contactCta}
              </ButtonLink>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
