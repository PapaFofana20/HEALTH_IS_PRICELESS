/* Facturation annuelle unique (FCFA). monthlyEquivalent = affichage seul. */
export const planPricing = {
  'muscle-gain': {
    standard: { annual: 11750, monthlyEquivalent: 979 },
    premium: { annual: 27900, monthlyEquivalent: 2325 },
  },
  'weight-loss': {
    standard: { annual: 12750, monthlyEquivalent: 1063 },
    premium: { annual: 29900, monthlyEquivalent: 2492 },
  },
};

export const pricingFeatures = [
  { label: { fr: 'Calculateurs IMC, calories & protéines', en: 'BMI, calorie & protein calculators' }, free: true, standard: true, premium: true },
  { label: { fr: 'Bibliothèque d\'exercices', en: 'Exercise library' }, free: true, standard: true, premium: true },
  { label: { fr: 'Articles & recettes', en: 'Articles & recipes' }, free: 'limited', standard: true, premium: true },
  { label: { fr: 'Suivi des séances & du poids', en: 'Session & weight tracking' }, free: false, standard: true, premium: true },
  { label: { fr: 'Programmes complets & avancés', en: 'Complete & advanced programs' }, free: false, standard: false, premium: true },
];
