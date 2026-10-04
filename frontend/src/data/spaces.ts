import type { Goal, Plan } from '../types';

export interface Space {
  id: string;
  plan: Plan;
  goal: Goal;
}

/**
 * Les 4 espaces achetables : plan × objectif.
 * slug = id de route (/espace/:id) et clé de traduction t.space.names.
 */
export const SPACES: Space[] = [
  { id: 'standard-perte-de-poids', plan: 'standard', goal: 'weight-loss' },
  { id: 'standard-prise-de-masse', plan: 'standard', goal: 'muscle-gain' },
  { id: 'premium-perte-de-poids', plan: 'premium', goal: 'weight-loss' },
  { id: 'premium-prise-de-masse', plan: 'premium', goal: 'muscle-gain' },
];

export function getSpace(id: string | undefined): Space | undefined {
  return SPACES.find((space) => space.id === id);
}

/** Slug de la page dédiée à un couple plan × objectif. */
export function spaceSlug(plan: Plan, goal: Goal): string {
  return `${plan}-${goal === 'weight-loss' ? 'perte-de-poids' : 'prise-de-masse'}`;
}
