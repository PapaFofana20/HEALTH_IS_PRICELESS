import { ArrowRight, Check, Lock, Quote } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { getSpace } from '../data/spaces';
import { getProgramById } from '../data/programs';
import { PlanBadge, Tag } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading, container } from '../components/ui/SectionHeading';
import { NotFoundState } from '../components/ui/States';

/**
 * Espace acheté : /espace/:spaceId (4 pages, plan × objectif).
 * Design repris de la section Témoignages (fond mist, citation).
 * Accès réservé au membre ayant acheté ce programme dédié
 * (tier couvrant le plan + objectif aligné, ou programme en cours
 * correspondant) ; sinon « Programme non disponible » + CTA tarifs.
 */
export default function EspacePage() {
  const { spaceId } = useParams();
  const { t } = useLanguage();
  const { user } = useAuth();
  const space = getSpace(spaceId);

  const names = t.space.names as Record<string, string>;
  const pageName = space ? names[space.id] : '';
  usePageTitle(pageName || t.brand.defaultTitle);

  if (!space) return <NotFoundState />;

  const current = user?.currentProgramId ? getProgramById(user.currentProgramId) : null;
  const tierCovers = user && (user.tier === space.plan || user.tier === 'premium');
  const hasAccess =
    !!user &&
    ((tierCovers && user.goal === space.goal) ||
      (current !== null && current.plan === space.plan && current.goal === space.goal));

  return (
    <section aria-labelledby="space-title" className="relative overflow-hidden bg-mist py-20 text-night-900 lg:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 pattern-dots-dark" />
      <div className={cn(container, 'relative')}>
        <Reveal>
          <SectionHeading
            id="space-title"
            as="h1"
            tone="light"
            eyebrow={t.space.eyebrow}
            title={pageName}
            subtitle={hasAccess ? t.space.unlockedNote : t.space.lockedNote}
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <figure className="flex  flex-col justify-between border-l-4 border-night-900 pl-6 sm:pl-10 lg:col-span-7">
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-md bg-night-900 text-volt">
                <Quote className="h-5 w-5" aria-hidden />
              </span>
              <blockquote className="mt-6 font-display text-2xl uppercase leading-[1.12] tracking-wide sm:text-3xl lg:text-[2.35rem]">
                {t.space.unavailable}
              </blockquote>
            </div>
            <figcaption className="mt-8 flex flex-wrap items-center gap-4">
              <PlanBadge plan={space.plan} />
              <Tag tone="dark">{t.goals[space.goal]}</Tag>
            </figcaption>
          </figure>

          <figure className="relative flex  flex-col justify-between overflow-hidden rounded-2xl bg-volt p-7 text-night-900 sm:p-9 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rotate-12 pattern-stripes-dark opacity-15" />
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-md bg-night-900 text-volt">
                {hasAccess ? <Check className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}
              </span>
              <p className="mt-6 text-lg font-semibold leading-relaxed sm:text-xl">
                {hasAccess ? t.space.unlockedCta : t.space.lockedCta}
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3">
              {hasAccess ? (
                <ButtonLink to="/dashboard" variant="dark" iconRight={<ArrowRight aria-hidden />}>
                  {t.nav.dashboard}
                </ButtonLink>
              ) : user ? (
                <ButtonLink to="/tarifs" variant="dark" iconRight={<ArrowRight aria-hidden />}>
                  {t.space.seePricing}
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink to={`/connexion?mode=register&plan=${space.plan}&goal=${space.goal}`} variant="dark">
                    {t.space.createAccount}
                  </ButtonLink>
                  <ButtonLink
                    to="/tarifs"
                    variant="outline"
                    className="border-night-900/30 text-night-900 hover:border-night-900 hover:bg-night-900 hover:text-volt"
                  >
                    {t.space.seePricing}
                  </ButtonLink>
                </>
              )}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
