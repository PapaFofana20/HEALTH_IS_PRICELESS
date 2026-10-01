import { ArrowRight } from 'lucide-react';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { articles } from '../data/articles';
import { Hero, Marquee } from '../components/features/home/Hero';
import { GoalSelector } from '../components/features/home/GoalSelector';
import { FreeTools } from '../components/features/home/FreeTools';
import { QuizBanner } from '../components/features/home/QuizBanner';
import { Testimonials } from '../components/features/home/Testimonials';
import { Newsletter } from '../components/features/home/Community';
import { PlansSection } from '../components/features/programs/PlanComparison';
import { ArticleCard } from '../components/features/articles/ArticleCard';
import { ButtonLink } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading, container } from '../components/ui/SectionHeading';

function HomeArticles() {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="home-articles-title" className="border-b border-edge bg-night-900 py-20 lg:py-28">
      <div className={container}>
        <Reveal>
          <SectionHeading
            id="home-articles-title"
            eyebrow={t.homeArticles.eyebrow}
            title={
              <>
                {t.homeArticles.title1} <span className="text-volt">{t.homeArticles.title2}</span>
              </>
            }
            subtitle={t.homeArticles.subtitle}
            action={
              <ButtonLink to="/conseils" variant="outline" iconRight={<ArrowRight />}>
                {t.homeArticles.cta}
              </ButtonLink>
            }
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {articles.slice(0, 3).map((article, index) => (
            <Reveal key={article.id} delay={index * 80} className="h-full">
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <Marquee />
      <GoalSelector />
      <PlansSection />
      <FreeTools />
      <QuizBanner />
      <Testimonials />
      <HomeArticles />
      <Newsletter />
    </>
  );
}
