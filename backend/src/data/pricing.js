export const planPricing = {
  'muscle-gain': {
    standard: { monthly: 8528, yearlyMonthly: 6556 },
    premium: { monthly: 16384, yearlyMonthly: 12464 },
  },
  'weight-loss': {
    standard: { monthly: 6556, yearlyMonthly: 5248 },
    premium: { monthly: 13112, yearlyMonthly: 10496 },
  },
};

export const pricingFeatures = [
  { label: { fr: 'Calculateurs IMC, calories & protéines', en: 'BMI, calorie & protein calculators' }, free: true, standard: true, premium: true },
  { label: { fr: 'Bibliothèque d\'exercices', en: 'Exercise library' }, free: true, standard: true, premium: true },
  { label: { fr: 'Articles & recettes', en: 'Articles & recipes' }, free: 'limited', standard: true, premium: true },
  { label: { fr: 'Suivi des séances & du poids', en: 'Session & weight tracking' }, free: false, standard: true, premium: true },
  { label: { fr: 'Programmes complets & avancés', en: 'Complete & advanced programs' }, free: false, standard: false, premium: true },
];
