import { Lock } from 'lucide-react';
import { calculateCalories } from '../../../../utils/fitness';
import type { CalorieGoal } from '../../../../utils/fitness';
import { useLanguage } from '../../../../hooks/useLanguage';
import { useAuth } from '../../../../hooks/useAuth';
import { useAsync } from '../../../../hooks/useAsync';
import { api } from '../../../../services/api';
import { getRecipeById, mealPlans } from '../../../../data/nutrition';
import { nutritionProfile } from '../../../../data/user';
import { ButtonLink } from '../../../ui/Button';
import { LockedContent } from '../../../ui/States';
import { ProgressBar } from '../Widgets';
import { ViewHeader } from '../DashboardLayout';
import type { User } from '../../../../types';

export function NutritionView({ user }: { user: User }) {
  const { t, loc, fmtNumber } = useLanguage();
  const { tier } = useAuth();
  const { data: weights } = useAsync(() => api.getWeightEntries(user.id), [user.id]);
  const latest = weights && weights.length ? weights[weights.length - 1].weight : 80;
  const goal: CalorieGoal = user.goal === 'weight-loss' ? 'lose' : 'gain';
  const targets = calculateCalories({
    sex: nutritionProfile.sex,
    age: nutritionProfile.age,
    heightCm: nutritionProfile.heightCm,
    weightKg: latest,
    activity: nutritionProfile.activity,
    goal,
  });
  const macros = [
    { label: t.calc.calories.target, value: targets.target, unit: 'kcal', ratio: 0.64 },
    { label: t.calc.calories.protein, value: targets.protein, unit: 'g', ratio: 0.7 },
    { label: t.calc.calories.carbs, value: targets.carbs, unit: 'g', ratio: 0.55 },
    { label: t.calc.calories.fat, value: targets.fat, unit: 'g', ratio: 0.6 },
  ];
  const plan = mealPlans.find((item) => item.goal === user.goal);
  const items = (plan?.items ?? []).flatMap((item) => {
    const recipe = getRecipeById(item.recipeId);
    return recipe ? [{ item, recipe }] : [];
  });

  const mealList = (
    <ul className="space-y-4">
      {items.map(({ item, recipe }) => (
        <li key={item.recipeId} className="flex min-w-0 items-center gap-4 rounded-2xl border border-edge/70 bg-night-900/70 p-4 transition-colors duration-200 hover:border-edge-strong sm:p-5">
          <img src={recipe.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-volt">{t.meals[item.category]}</p>
            <p className="mt-1 truncate font-bold leading-snug">{loc(recipe.name)}</p>
          </div>
          <p className="shrink-0 text-right text-sm font-bold leading-relaxed">
            {recipe.calories} kcal
            <span className="block text-xs font-semibold text-muted">
              {recipe.protein} g · {t.nutritionPage.protein}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ViewHeader
        title={t.dashboard.nutrition.title}
        subtitle={t.dashboard.nutrition.subtitle}
        action={
          <ButtonLink to="/nutrition?section=calculators" variant="outline" size="sm">
            {t.dashboard.nutrition.tools}
          </ButtonLink>
        }
      />
      <article className="rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
        <h2 className="font-display text-2xl uppercase leading-none tracking-tight">{t.dashboard.nutrition.targets}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.dashboard.nutrition.profileHint}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {macros.map((macro) => (
            <div key={macro.label} className="min-w-0 rounded-2xl border border-edge/70 bg-night-900/70 p-5 sm:p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{macro.label}</p>
              <p className="mt-3 font-display text-4xl leading-none tracking-tight">
                {fmtNumber(Math.round(macro.value * macro.ratio))}
                <span className="ml-1.5 font-sans text-xs font-bold text-muted">
                  / {fmtNumber(macro.value)} {macro.unit}
                </span>
              </p>
              <ProgressBar value={macro.ratio * 100} label={macro.label} className="mt-4 h-2" />
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-2xl border border-edge/70 bg-night-800/70 p-6 transition-colors duration-300 hover:border-edge-strong sm:p-8">
        <h2 className="flex items-center gap-3 font-display text-2xl uppercase leading-none tracking-tight">
          {t.dashboard.nutrition.mealPlan}
          {tier !== 'premium' && <Lock className="h-4 w-4 text-volt" aria-hidden />}
        </h2>
        <div className="mt-8">
          {tier === 'premium' ? (
            mealList
          ) : (
            <LockedContent title={t.dashboard.nutrition.lockedTitle} text={t.dashboard.nutrition.lockedText}>
              {mealList}
            </LockedContent>
          )}
        </div>
      </article>
    </div>
  );
}