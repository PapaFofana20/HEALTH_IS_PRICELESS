import { Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Salad, BookOpen } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { articles } from '../../data/articles';
import { exercises } from '../../data/exercises';
import { mealPlans } from '../../data/nutrition';
import { recipes } from '../../data/nutrition';
import { programs } from '../../data/programs';

export function ContentView() {
  const { t, fmtNumber } = useLanguage();
  const cards = [
    { icon: Dumbbell, label: t.admin.content.exercises, count: exercises.length, to: '/exercices' },
    { icon: Salad, label: t.admin.content.recipes, count: recipes.length + mealPlans.length, to: '/nutrition' },
    { icon: BookOpen, label: t.admin.content.articles, count: articles.length, to: '/conseils' },
    { icon: Dumbbell, label: t.admin.content.programs, count: programs.length, to: '/programmes' },
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-muted">{t.admin.content.subtitle}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, label, count, to }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-4 rounded-xl border border-edge bg-night-800 p-5 transition-colors hover:border-volt/50"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-volt/30 bg-volt/10 text-volt">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-3xl leading-none">{fmtNumber(count)}</span>
              <span className="mt-1 block text-sm font-semibold text-muted">{label}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-volt" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}