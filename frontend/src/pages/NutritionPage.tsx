import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowDown, Beef, ChefHat, Crown, Droplets, Dumbbell, Flame, Moon, Salad, Scale, Soup } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { getRecipeById, mealPlans, nutritionTips } from '../data/nutrition';
import { media } from '../data/media';
import { CalculatorTabs } from '../components/features/nutrition/Calculators';
import { RecipeCard, RecipeDetail } from '../components/features/nutrition/RecipeCard';
import { Chip } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Reveal } from '../components/ui/Reveal';
import { PageHero, SectionHeading, container } from '../components/ui/SectionHeading';
import { EmptyState, ErrorState, GridSkeleton, LockedContent } from '../components/ui/States';
import type { Goal, MealCategory, Recipe, TipIcon } from '../types';

type RecipeFilter = 'all' | Goal | MealCategory;
const RECIPE_FILTERS: RecipeFilter[] = ['all', 'weight-loss', 'muscle-gain', 'breakfast', 'lunch', 'dinner', 'snack'];
const tipIcons: Record<TipIcon, LucideIcon> = { droplets: Droplets, beef: Beef, salad: Salad, moon: Moon, chef: ChefHat, scale: Scale };

export default function NutritionPage() {
  const { t, loc, fmtNumber } = useLanguage();
  usePageTitle(t.nav.nutrition);
  const { tier } = useAuth();
  const [params] = useSearchParams();
  const { data, loading, error, refetch } = useAsync(() => api.getRecipes(), []);
  const [filter, setFilter] = useState<RecipeFilter>('all');
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [mealGoal, setMealGoal] = useState<Goal>('weight-loss');

  // Deep-link support: /nutrition?section=recipes&tool=bmi
  useEffect(() => {
    const section = params.get('section');
    if (!section) return;
    const id = window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(id);
  }, [params]);

  const toolParam = params.get('tool');
  const initialTool = toolParam === 'bmi' || toolParam === 'protein' || toolParam === 'calories' ? toolParam : undefined;

  const filtered = useMemo(
    () =>
      (data ?? []).filter((recipe) => {
        if (filter === 'all') return true;
        if (filter === 'weight-loss' || filter === 'muscle-gain') return recipe.goal === filter || recipe.goal === 'both';
        return recipe.category === filter;
      }),
    [data, filter],
  );

  const plan = mealPlans.find((item) => item.goal === mealGoal);
  const planItems = (plan?.items ?? []).flatMap((item) => {
    const recipe = getRecipeById(item.recipeId);
    return recipe ? [{ item, recipe }] : [];
  });
  const totals = planItems.reduce(
    (acc, { recipe }) => ({
      calories: acc.calories + recipe.calories,
      protein: acc.protein + recipe.protein,
      carbs: acc.carbs + recipe.carbs,
      fat: acc.fat + recipe.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <PageHero
        eyebrow={t.nutritionPage.eyebrow}
        title={
          <>
            {t.nutritionPage.title1} <span className="text-volt">{t.nutritionPage.title2}</span>
          </>
        }
        subtitle={t.nutritionPage.subtitle}
        image={media.nutritionHero}
      >
        <div className="flex flex-wrap gap-2">
          {(['calculators', 'recipes', 'meals'] as const).map((key) => (
            <Button key={key} variant="outline" size="sm" iconRight={<ArrowDown />} onClick={() => jump(key)}>
              {t.nutritionPage.jump[key]}
            </Button>
          ))}
        </div>
      </PageHero>

      {/* Calculators */}
      <section id="calculators" className="scroll-mt-24 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading title={t.nutritionPage.calculatorsTitle} subtitle={t.nutritionPage.calculatorsSubtitle} />
          </Reveal>
          <Reveal delay={80} className="mt-10">
            <CalculatorTabs key={initialTool ?? 'calories'} initial={initialTool} />
          </Reveal>
        </div>
      </section>

      {/* Tips */}
      <section className="border-y border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading title={t.nutritionPage.tipsTitle} subtitle={t.nutritionPage.tipsSubtitle} />
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nutritionTips.map((tip, index) => {
              const Icon = tipIcons[tip.icon];
              return (
                <li key={tip.id}>
                  <Reveal delay={index * 60} className="h-full">
                    <article className="group flex h-full gap-4 rounded-2xl border border-edge bg-night-800 p-6 transition-colors duration-300 hover:border-volt/40">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-volt/30 bg-volt/10 text-volt transition-colors group-hover:bg-volt group-hover:text-night-900">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-display text-sm text-muted">0{index + 1}</p>
                        <h3 className="font-display text-2xl uppercase leading-tight">{loc(tip.title)}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{loc(tip.text)}</p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Recipes */}
      <section id="recipes" className="scroll-mt-24 py-16 lg:py-24">
        <div className={container}>
          <Reveal>
            <SectionHeading title={t.nutritionPage.recipesTitle} subtitle={t.nutritionPage.recipesSubtitle} />
          </Reveal>
          <div role="group" aria-label={t.nutritionPage.recipeFilters} className="scrollbar-none -mx-1 mt-8 flex gap-2 overflow-x-auto px-1 pb-1">
            {RECIPE_FILTERS.map((value) => (
              <Chip key={value} active={filter === value} onClick={() => setFilter(value)}>
                {t.nutritionPage.categories[value]}
              </Chip>
            ))}
          </div>
          <div className="mt-8">
            {loading ? (
              <GridSkeleton count={6} />
            ) : error ? (
              <ErrorState title={t.nutritionPage.errorTitle} onRetry={refetch} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={<Soup aria-hidden />} title={t.nutritionPage.emptyRecipes} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelected} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Meal suggestions */}
      <section id="meals" className="scroll-mt-24 border-t border-edge bg-night-800/40 py-16 lg:py-24">
        <div className={container}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading title={t.nutritionPage.mealsTitle} subtitle={t.nutritionPage.mealsSubtitle} />
            <div role="group" aria-label={t.nutritionPage.mealsTitle} className="inline-flex w-fit shrink-0 rounded-full border border-edge bg-night-900 p-1">
              {(['weight-loss', 'muscle-gain'] as Goal[]).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={mealGoal === goal}
                  onClick={() => setMealGoal(goal)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200',
                    mealGoal === goal ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
                  )}
                >
                  {goal === 'weight-loss' ? <Flame className="h-4 w-4" aria-hidden /> : <Dumbbell className="h-4 w-4" aria-hidden />}
                  {t.goals[goal]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <ol key={mealGoal} className="grid  gap-4 sm:grid-cols-2 lg:col-span-2">
              {planItems.map(({ item, recipe }) => (
                <li key={item.recipeId}>
                  <button
                    type="button"
                    onClick={() => setSelected(recipe)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-edge bg-night-800 p-3 text-left transition-colors duration-300 hover:border-edge-strong"
                  >
                    <img src={recipe.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-volt">{t.meals[item.category]}</span>
                      <span className="mt-1 block font-display text-lg uppercase leading-tight">{loc(recipe.name)}</span>
                      <span className="mt-1 block text-xs font-semibold text-muted">
                        {recipe.calories} kcal · {recipe.protein} g {t.nutritionPage.protein.toLowerCase()}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="space-y-4">
              <article className="rounded-2xl border border-volt/40 bg-night-700 p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.nutritionPage.dayTotal}</p>
                <p className="mt-2 font-display text-6xl leading-none text-volt">
                  {fmtNumber(totals.calories)}
                  <span className="ml-2 font-sans text-sm font-bold text-muted">kcal</span>
                </p>
                <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: t.nutritionPage.protein, value: totals.protein },
                    { label: t.nutritionPage.carbs, value: totals.carbs },
                    { label: t.nutritionPage.fat, value: totals.fat },
                  ].map((macro) => (
                    <div key={macro.label} className="flex flex-col-reverse rounded-lg bg-night-900/70 px-2 py-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{macro.label}</dt>
                      <dd className="font-display text-2xl leading-none">{macro.value} g</dd>
                    </div>
                  ))}
                </dl>
              </article>
              {tier !== 'premium' && (
                <LockedContent title={t.nutritionPage.mealPlanLocked}>
                  <div className="space-y-2 rounded-2xl border border-edge bg-night-800 p-5">
                    {[1, 2, 3].map((dayNumber) => (
                      <div key={dayNumber} className="flex items-center justify-between rounded-lg bg-night-900 px-4 py-3 text-sm font-bold">
                        <span>J{dayNumber}</span>
                        <Crown className="h-4 w-4 text-volt" />
                      </div>
                    ))}
                  </div>
                </LockedContent>
              )}
            </div>
          </div>
        </div>
      </section>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected ? loc(selected.name) : ''} size="xl">
        {selected && <RecipeDetail recipe={selected} />}
      </Modal>
    </>
  );
}
