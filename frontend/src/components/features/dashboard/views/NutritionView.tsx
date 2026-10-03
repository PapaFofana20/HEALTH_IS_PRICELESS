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
import { labelClass } from '../constants';
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
    <ul className="space-y-3">
      {items.map(({ item, recipe }) => (
        <li key={item.recipeId} className="flex items-center gap-4 rounded-lg border border-edge bg-night-900 p-3">
          <img src={recipe.image} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-volt">{t.meals[item.category]}</p>
            <p className="truncate font-bold">{loc(recipe.name)}</p>
          </div>
          <p className="shrink-0 text-right text-xs font-bold">
            {recipe.calories} kcal
            <span className="block text-muted">
              {recipe.protein} g · {t.nutritionPage.protein}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t.dashboard.nutrition.title}
        subtitle={t.dashboard.nutrition.subtitle}
        action={
          <ButtonLink to="/nutrition?section=calculators" variant="outline" size="sm">
            {t.dashboard.nutrition.tools}
          </ButtonLink>
        }
      />
      <article className="rounded-xl border border-edge bg-night-800 p-6">
        <h2 className="font-display text-2xl uppercase">{t.dashboard.nutrition.targets}</h2>
        <p className="text-sm text-muted">{t.dashboard.nutrition.profileHint}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {macros.map((macro) => (
            <div key={macro.label} className="rounded-lg bg-night-900 p-4">
              <p className={labelClass}>{macro.label}</p>
              <p className="mt-2 font-display text-3xl leading-none">
                {fmtNumber(Math.round(macro.value * macro.ratio))}
                <span className="ml-1 font-sans text-xs font-bold text-muted">
                  / {fmtNumber(macro.value)} {macro.unit}
                </span>
              </p>
              <ProgressBar value={macro.ratio * 100} label={macro.label} className="mt-3" />
            </div>
          ))}
        </div>
      </article>
      <article className="rounded-xl border border-edge bg-night-800 p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl uppercase">
          {t.dashboard.nutrition.mealPlan}
          {tier !== 'premium' && <Lock className="h-4 w-4 text-volt" aria-hidden />}
        </h2>
        <div className="mt-5">
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