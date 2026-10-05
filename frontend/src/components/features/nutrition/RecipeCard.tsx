import { ArrowRight, Clock, Flame } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { Tag } from '../../ui/Badge';
import type { Recipe } from '../../../types';

function MacroGrid({ recipe, className }: { recipe: Recipe; className?: string }) {
  const { t } = useLanguage();
  const items = [
    { label: t.nutritionPage.calories, value: `${recipe.calories}`, unit: 'kcal', accent: true },
    { label: t.nutritionPage.protein, value: `${recipe.protein}`, unit: 'g' },
    { label: t.nutritionPage.carbs, value: `${recipe.carbs}`, unit: 'g' },
    { label: t.nutritionPage.fat, value: `${recipe.fat}`, unit: 'g' },
  ];
  return (
    <dl className={cn('grid grid-cols-4 gap-2 text-center', className)}>
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-night-900/70 px-1 py-2">
          <dt className="truncate text-[9px] font-bold uppercase tracking-wider text-muted">{item.label}</dt>
          <dd className={cn('mt-0.5 font-display text-lg leading-none', item.accent && 'text-volt')}>
            {item.value}
            <span className="ml-0.5 font-sans text-[10px] font-bold text-muted">{item.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onOpen }: RecipeCardProps) {
  const { t, loc } = useLanguage();
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-edge bg-night-800 transition-all duration-300 hover:-translate-y-1 hover:border-edge-strong hover:shadow-2xl hover:shadow-black/40 has-[button:focus-visible]:ring-2 has-[button:focus-visible]:ring-volt">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={recipe.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-transparent to-transparent" />
        <Tag tone="light" className="absolute left-3 top-3">
          {t.meals[recipe.category]}
        </Tag>
        <Tag tone="volt" className="absolute right-3 top-3 bg-night-900/75" icon={<Clock className="h-3 w-3" aria-hidden />}>
          {recipe.prepMinutes} min
        </Tag>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-volt">
          {recipe.goal === 'both' ? `${t.goals['weight-loss']} · ${t.goals['muscle-gain']}` : t.goals[recipe.goal]}
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase leading-tight tracking-wide">{loc(recipe.name)}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{loc(recipe.description)}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-edge pt-4 text-xs font-semibold text-ink/85">
          <li className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-muted" aria-hidden />
            {recipe.calories} kcal
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted" aria-hidden />
            {recipe.prepMinutes} min
          </li>
        </ul>
        <button
          type="button"
          onClick={() => onOpen(recipe)}
          className="mt-auto inline-flex items-center gap-2 pt-5 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink outline-none transition-colors duration-200 after:absolute after:inset-0 after:content-[''] group-hover:text-volt"
        >
          {t.nutritionPage.viewRecipe}
          <span className="sr-only"> — {loc(recipe.name)}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
        </button>
      </div>
    </article>
  );
}

/** Full recipe (inside a Modal). */
export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const { t, loc } = useLanguage();
  const steps = (
    <ol className="space-y-3">
      {loc(recipe.steps).map((step, index) => (
        <li key={step} className="flex gap-4">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-volt font-display text-sm text-night-900">{index + 1}</span>
          <p className="pt-0.5 text-sm leading-relaxed text-ink/90">{step}</p>
        </li>
      ))}
    </ol>
  );

  return (
    <div>
      <div className="relative -mx-5 -mt-5 mb-6 aspect-[16/8] overflow-hidden sm:-mx-6 sm:-mt-6">
        <img src={recipe.image} alt={loc(recipe.name)} className="h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-800 via-night-800/10 to-transparent" />
        <div className="absolute bottom-4 left-5 flex flex-wrap gap-2 sm:left-6">
          <Tag tone="volt" className="bg-night-900/75">
            {t.meals[recipe.category]}
          </Tag>
          <Tag tone="light" icon={<Clock className="h-3 w-3" aria-hidden />}>
            {t.nutritionPage.prepTime} · {recipe.prepMinutes} min
          </Tag>
        </div>
      </div>
      <p className="leading-relaxed text-ink/90">{loc(recipe.description)}</p>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{t.nutritionPage.perServing}</p>
      <MacroGrid recipe={recipe} className="mt-2" />
      <div className="mt-8 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <h3 className="font-display text-xl uppercase tracking-wide">{t.nutritionPage.ingredients}</h3>
          <ul className="mt-4 space-y-2.5">
            {loc(recipe.ingredients).map((ingredient) => (
              <li key={ingredient} className="flex gap-3 text-sm text-ink/90">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-volt" />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <h3 className="font-display text-xl uppercase tracking-wide">{t.nutritionPage.preparation}</h3>
          <div className="mt-4">{steps}</div>
        </div>
      </div>
    </div>
  );
}
