import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Egg, Flame, Lightbulb, Moon, Salad, Scale, Trophy } from 'lucide-react';

export type ServiceKey = 'exercises' | 'calories' | 'protein' | 'bmi' | 'tips' | 'nutrition' | 'recovery' | 'motivation';

export type ServiceGroupKey = 'exercises' | 'nutrition' | 'calculators' | 'advice' | 'recovery' | 'motivation';

export interface DashboardService {
  key: ServiceKey;
  icon: LucideIcon;
  to: string;
  group: ServiceGroupKey;
}

/** Free tools surfaced on the dashboard home + /dashboard/services. */
export const freeServices: DashboardService[] = [
  { key: 'exercises', icon: Dumbbell, to: '/dashboard/exercices', group: 'exercises' },
  { key: 'calories', icon: Flame, to: '/dashboard/calculators?tool=calories', group: 'calculators' },
  { key: 'protein', icon: Egg, to: '/dashboard/calculators?tool=protein', group: 'calculators' },
  { key: 'bmi', icon: Scale, to: '/dashboard/calculators?tool=bmi', group: 'calculators' },
  { key: 'tips', icon: Lightbulb, to: '/dashboard/conseils', group: 'advice' },
  { key: 'nutrition', icon: Salad, to: '/dashboard/nutrition', group: 'nutrition' },
  { key: 'recovery', icon: Moon, to: '/dashboard/conseils?cat=recovery', group: 'recovery' },
  { key: 'motivation', icon: Trophy, to: '/dashboard/conseils?cat=training', group: 'motivation' },
];

export const serviceGroupOrder: ServiceGroupKey[] = ['exercises', 'nutrition', 'calculators', 'advice', 'recovery', 'motivation'];
