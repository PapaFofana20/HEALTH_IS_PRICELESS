/* ==========================================================
   IMC — analyse corporelle (fonctions pures, testables).
   La présentation (textes FR/EN) vit dans les locales ;
   ce module ne produit que des données + codes de validation.
   ========================================================== */

export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ft-in';

/** Classes adultes standard (seuils OMS). */
export type BmiClass = 'under' | 'normal' | 'over' | 'obese1' | 'obese2' | 'obese3';
export type BmiPosition = 'below' | 'inside' | 'above';

export const LB_PER_KG = 2.20462;
export const CM_PER_INCH = 2.54;
export const ADULT_MIN_AGE = 18;
export const SENIOR_AGE = 65;
export const HEALTHY_BMI_MIN = 18.5;
export const HEALTHY_BMI_MAX = 24.9;

/**
 * Seuils adultes — source unique (bornes supérieures exclusives).
 * getBMICategory(), la jauge et les tests partagent cette config.
 */
export const BMI_THRESHOLDS: { max: number; class: BmiClass }[] = [
  { max: 18.5, class: 'under' },
  { max: 25, class: 'normal' },
  { max: 30, class: 'over' },
  { max: 35, class: 'obese1' },
  { max: 40, class: 'obese2' },
  { max: Number.POSITIVE_INFINITY, class: 'obese3' },
];

/** Plan d'accompagnement déduit de la catégorie (pour les CTA dynamiques). */
export type BmiPlan = 'gain' | 'maintain' | 'lose';

export function getBMIPlan(category: BmiClass): BmiPlan {
  if (category === 'under') return 'gain';
  if (category === 'normal') return 'maintain';
  return 'lose';
}

export const round1 = (value: number): number => Math.round(value * 10) / 10;

/** Nombre réel utilisable : ni NaN, ni infini. */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function convertWeightToKg(value: number, unit: WeightUnit): number {
  if (!isValidNumber(value)) return NaN;
  return unit === 'lb' ? value / LB_PER_KG : value;
}

/**
 * Convertit une taille en cm.
 * - 'cm' : value = centimètres, inches ignoré.
 * - 'ft-in' : value = pieds, inches = pouces complémentaires.
 */
export function convertHeightToCm(value: number, unit: HeightUnit, inches = 0): number {
  if (!isValidNumber(value) || !isValidNumber(inches)) return NaN;
  if (unit === 'cm') return value;
  return value * 12 * CM_PER_INCH + inches * CM_PER_INCH;
}

/** IMC précis (non arrondi). NaN si entrées invalides. */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!isValidNumber(weightKg) || !isValidNumber(heightCm) || weightKg <= 0 || heightCm <= 0) return NaN;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

/** Classe adulte selon BMI_THRESHOLDS. null si invalide. */
export function getBMICategory(bmi: number): BmiClass | null {
  if (!isValidNumber(bmi) || bmi <= 0) return null;
  const hit = BMI_THRESHOLDS.find((threshold) => bmi < threshold.max);
  return hit ? hit.class : null;
}

/** Analyse complète : IMC arrondi + catégorie. null si entrées invalides. */
export function analyzeBMI(weightKg: number, heightCm: number): { bmi: number; rounded: number; category: BmiClass } | null {
  const bmi = calculateBMI(weightKg, heightCm);
  const category = getBMICategory(bmi);
  if (!category) return null;
  return { bmi, rounded: round1(bmi), category };
}

/** Plage de poids (kg) correspondant à un IMC 18,5–24,9 pour une taille donnée. */
export function calculateHealthyBMIRange(heightCm: number): { min: number; max: number } | null {
  if (!isValidNumber(heightCm) || heightCm <= 0) return null;
  const squared = (heightCm / 100) ** 2;
  return { min: HEALTHY_BMI_MIN * squared, max: HEALTHY_BMI_MAX * squared };
}

export interface BmiReportInput {
  bmi: number;
  heightCm: number;
  weightKg: number;
  age: number;
  /** Objectif déjà enregistré (ex. profil utilisateur). Absent = section masquée. */
  weightGoal?: number | null;
}

export interface BmiReport {
  bmi: number;
  rounded: number;
  isMinor: boolean;
  category: BmiClass | 'minor';
  /** Plage 18,5-24,9 (null chez les mineurs : pas d'interpretation adulte). */
  range: { min: number; max: number } | null;
  position: BmiPosition | null;
  goal: { current: number; target: number; diff: number } | null;
}

/** Produit les données du rapport personnalisé. null si entrées invalides. */
export function generateBMIReport(input: BmiReportInput): BmiReport | null {
  const { bmi, heightCm, weightKg, age, weightGoal = null } = input;
  if (!isValidNumber(bmi) || bmi <= 0) return null;
  if (!isValidNumber(heightCm) || heightCm <= 0) return null;
  if (!isValidNumber(weightKg) || weightKg <= 0) return null;
  if (!isValidNumber(age)) return null;

  if (age < ADULT_MIN_AGE) {
    return { bmi, rounded: round1(bmi), isMinor: true, category: 'minor', range: null, position: null, goal: null };
  }

  const category = getBMICategory(bmi);
  const range = calculateHealthyBMIRange(heightCm);
  if (!category || !range) return null;
  const position: BmiPosition = weightKg < range.min ? 'below' : weightKg > range.max ? 'above' : 'inside';
  const goal =
    isValidNumber(weightGoal) && (weightGoal as number) > 0
      ? { current: weightKg, target: weightGoal as number, diff: (weightGoal as number) - weightKg }
      : null;
  return { bmi, rounded: round1(bmi), isMinor: false, category, range, position, goal };
}

export type BmiFieldError = 'empty' | 'not-a-number' | 'out-of-range';

/** Valide un champ texte numérique contre [min, max]. null = valide. */
export function validatePositiveNumber(raw: string, min: number, max: number): BmiFieldError | null {
  if (raw.trim() === '') return 'empty';
  const value = Number(raw);
  if (!isValidNumber(value)) return 'not-a-number';
  if (value < min || value > max) return 'out-of-range';
  return null;
}