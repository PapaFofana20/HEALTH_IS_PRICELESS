import { useState } from 'react';
import { CalendarDays, FileText, ListTree, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { cgu, privacy } from '../data/legal';
import type { LegalDoc } from '../data/legal';
import { Eyebrow, container } from '../components/ui/SectionHeading';
import { NotFoundState } from '../components/ui/States';

const DOCS: Record<string, LegalDoc> = { confidentialite: privacy, cgu };

/* Pages isolees (footer uniquement) : politique de confidentialite et CGU. */
export default function LegalPage({ docKey }: { docKey: keyof typeof DOCS }) {
  const { t, loc } = useLanguage();
  const doc = DOCS[docKey] ?? null;
  const [activeSection, setActiveSection] = useState(0);
  usePageTitle(doc ? loc(doc.title) : '');
  if (!doc) return <NotFoundState />;

  const jump = (index: number) => {
    setActiveSection(index);
    document.getElementById(`legal-section-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-edge bg-night-900 pb-14 pt-32 sm:pb-16 lg:pb-20 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-24 -z-10 hidden h-72 w-72 rotate-12 border border-volt/15 lg:block" />
        <div className={container}>
          <Eyebrow className="animate-fade-up">{t.about.legalEyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-4xl animate-fade-up font-display text-5xl uppercase leading-[0.92] tracking-tight [animation-delay:60ms] sm:text-6xl lg:text-7xl">
            {loc(doc.title)}
          </h1>
          <div className="mt-6 flex animate-fade-up flex-wrap items-center gap-2 [animation-delay:120ms]">
            <span className="inline-flex items-center gap-2 rounded-full border border-edge/70 bg-night-800/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
              <CalendarDays className="h-3.5 w-3.5 text-volt" aria-hidden />
              {loc(doc.updated)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-volt/30 bg-volt/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {doc.sections.length} sections
            </span>
          </div>
        </div>
      </section>

      <section className="bg-night-950 py-16 lg:py-24">
        <div className={cn(container, 'grid gap-10 lg:grid-cols-12')}>
          {/* Sommaire sticky */}
          <aside className="lg:col-span-4">
            <nav
              aria-label={loc(doc.title)}
              className="rounded-2xl border border-edge/70 bg-night-900/70 p-3 lg:sticky lg:top-24"
            >
              <p className="flex items-center gap-2 px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">
                <ListTree className="h-4 w-4 text-volt" aria-hidden />
                {t.about.legalToc}
              </p>
              <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {doc.sections.map((section, index) => (
                  <li key={loc(section.heading)}>
                    <button
                      type="button"
                      onClick={() => jump(index)}
                      aria-current={activeSection === index ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-150',
                        activeSection === index
                          ? 'bg-volt/10 text-ink'
                          : 'text-muted hover:bg-night-800 hover:text-ink',
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

          {/* Contenu */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-edge/70 bg-night-900/70">
              {doc.sections.map((section, index) => (
                <article
                  key={loc(section.heading)}
                  id={`legal-section-${index}`}
                  className="scroll-mt-28 border-b border-edge/60 p-6 last:border-b-0 sm:p-8 lg:p-10"
                >
                  <div className="flex items-baseline gap-4">
                    <span aria-hidden className="font-display text-4xl leading-none text-volt/40 sm:text-5xl">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-display text-2xl uppercase leading-tight tracking-tight sm:text-3xl">
                      {loc(section.heading)}
                    </h2>
                  </div>
                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={loc(paragraph)} className="flex gap-3 text-[15px] leading-relaxed text-muted">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt/70" aria-hidden />
                        <span>{loc(paragraph)}</span>
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted/70">{loc(doc.updated)}</p>
          </div>
        </div>
      </section>
    </>
  );
}