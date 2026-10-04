import { ShieldCheck } from 'lucide-react';
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
  usePageTitle(doc ? loc(doc.title) : '');
  if (!doc) return <NotFoundState />;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-edge bg-night-900 pb-14 pt-32 sm:pb-16 lg:pb-20 lg:pt-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
        <div className={container}>
          <Eyebrow className="animate-fade-up">{t.about.legalEyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-4xl animate-fade-up font-display text-5xl uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            {loc(doc.title)}
          </h1>
          <p className="mt-4 animate-fade-up text-sm text-muted">{loc(doc.updated)}</p>
        </div>
      </section>

      <section className="bg-night-950 py-16 lg:py-20">
        <div className={cn(container, 'max-w-4xl')}>
          <div className="space-y-10">
            {doc.sections.map((section) => (
              <div key={loc(section.heading)}>
                <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">{loc(section.heading)}</h2>
                <ul className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <li
                      key={loc(paragraph)}
                      className="flex gap-4 rounded-xl border border-edge bg-night-900 p-5 text-sm leading-relaxed text-muted"
                    >
                      <ShieldCheck className="h-5 w-5 shrink-0 text-volt" aria-hidden />
                      {loc(paragraph)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}