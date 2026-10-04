import { describe, expect, it } from 'vitest';
import {
  calculateBMI,
  calculateHealthyBMIRange,
  convertHeightToCm,
  convertWeightToKg,
  generateBMIReport,
  getBMICategory,
  isValidNumber,
  validatePositiveNumber,
} from './bmi';

describe('isValidNumber', () => {
  it('accepte les nombres finis', () => {
    expect(isValidNumber(24.6)).toBe(true);
    expect(isValidNumber(0)).toBe(true);
  });
  it('rejette NaN, infini et non-nombres', () => {
    expect(isValidNumber(NaN)).toBe(false);
    expect(isValidNumber(Infinity)).toBe(false);
    expect(isValidNumber('24')).toBe(false);
    expect(isValidNumber(undefined)).toBe(false);
  });
});

describe('calculateBMI', () => {
  it('calcule 75,5 kg / 178 cm', () => {
    expect(calculateBMI(75.5, 178)).toBeCloseTo(23.83, 2);
  });
  it('rejette les valeurs invalides', () => {
    expect(calculateBMI(0, 178)).toBeNaN();
    expect(calculateBMI(75, 0)).toBeNaN();
    expect(calculateBMI(-70, 178)).toBeNaN();
    expect(calculateBMI(NaN, 178)).toBeNaN();
    expect(calculateBMI(75, Infinity)).toBeNaN();
  });
});

describe('convertWeightToKg', () => {
  it('convertit lb vers kg', () => {
    expect(convertWeightToKg(1, 'lb')).toBeCloseTo(0.4536, 4);
    expect(convertWeightToKg(154.3, 'lb')).toBeCloseTo(70, 0);
  });
  it('laisse les kg intacts', () => {
    expect(convertWeightToKg(75.5, 'kg')).toBe(75.5);
  });
  it('rejette NaN', () => {
    expect(convertWeightToKg(NaN, 'kg')).toBeNaN();
  });
});

describe('convertHeightToCm', () => {
  it('convertit pieds/pouces vers cm', () => {
    expect(convertHeightToCm(5, 'ft-in', 10)).toBeCloseTo(177.8, 1);
    expect(convertHeightToCm(6, 'ft-in', 0)).toBeCloseTo(182.88, 2);
  });
  it('laisse les cm intacts', () => {
    expect(convertHeightToCm(178, 'cm')).toBe(178);
  });
  it('rejette NaN', () => {
    expect(convertHeightToCm(NaN, 'cm')).toBeNaN();
  });
});

describe('getBMICategory', () => {
  it.each([
    [17.8, 'under'],
    [18.49, 'under'],
    [18.5, 'normal'],
    [23.4, 'normal'],
    [24.99, 'normal'],
    [25, 'over'],
    [28.2, 'over'],
    [29.99, 'over'],
    [30, 'obese1'],
    [33.1, 'obese1'],
    [34.99, 'obese1'],
    [35, 'obese2'],
    [39.99, 'obese2'],
    [40, 'obese3'],
    [45, 'obese3'],
  ])('classe %s en %s', (bmi, expected) => {
    expect(getBMICategory(bmi)).toBe(expected);
  });
  it('rejette les valeurs invalides', () => {
    expect(getBMICategory(0)).toBeNull();
    expect(getBMICategory(-5)).toBeNull();
    expect(getBMICategory(NaN)).toBeNull();
    expect(getBMICategory(Infinity)).toBeNull();
  });
});

describe('calculateHealthyBMIRange', () => {
  it('calcule la plage 18,5-24,9 pour 178 cm (58,6 - 78,9 kg)', () => {
    const range = calculateHealthyBMIRange(178);
    expect(range).not.toBeNull();
    expect(range!.min).toBeCloseTo(58.62, 1);
    expect(range!.max).toBeCloseTo(78.89, 1);
  });
  it('rejette les tailles invalides', () => {
    expect(calculateHealthyBMIRange(0)).toBeNull();
    expect(calculateHealthyBMIRange(NaN)).toBeNull();
  });
});

describe('generateBMIReport', () => {
  it('profil A : IMC 17,8 -> insuffisance, en dessous de la plage', () => {
    const report = generateBMIReport({ bmi: 17.8, heightCm: 180, weightKg: 57.7, age: 30 });
    expect(report?.category).toBe('under');
    expect(report?.position).toBe('below');
    expect(report?.rounded).toBe(17.8);
  });
  it('profil B : IMC 23,4 -> normal, dans la plage', () => {
    const report = generateBMIReport({ bmi: 23.4, heightCm: 175, weightKg: 71.7, age: 30 });
    expect(report?.category).toBe('normal');
    expect(report?.position).toBe('inside');
  });
  it('profil C : IMC 28,2 -> surpoids, au-dessus de la plage', () => {
    const report = generateBMIReport({ bmi: 28.2, heightCm: 170, weightKg: 81.5, age: 30 });
    expect(report?.category).toBe('over');
    expect(report?.position).toBe('above');
  });
  it('profil D : IMC 33,1 -> obesite classe I', () => {
    const report = generateBMIReport({ bmi: 33.1, heightCm: 170, weightKg: 95.7, age: 30 });
    expect(report?.category).toBe('obese1');
  });
  it('mineur : pas de categorie adulte ni de plage', () => {
    const report = generateBMIReport({ bmi: 20, heightCm: 160, weightKg: 51.2, age: 15 });
    expect(report?.isMinor).toBe(true);
    expect(report?.category).toBe('minor');
    expect(report?.range).toBeNull();
    expect(report?.position).toBeNull();
  });
  it('integre lobjectif de poids quand il existe', () => {
    const report = generateBMIReport({ bmi: 26, heightCm: 175, weightKg: 80, age: 30, weightGoal: 72 });
    expect(report?.goal).toEqual({ current: 80, target: 72, diff: -8 });
  });
  it('masque lobjectif quand il est absent', () => {
    const report = generateBMIReport({ bmi: 23.4, heightCm: 175, weightKg: 71.7, age: 30 });
    expect(report?.goal).toBeNull();
  });
  it('rejette les entrees invalides', () => {
    expect(generateBMIReport({ bmi: NaN, heightCm: 175, weightKg: 70, age: 30 })).toBeNull();
    expect(generateBMIReport({ bmi: 24, heightCm: 0, weightKg: 70, age: 30 })).toBeNull();
  });
});

describe('validatePositiveNumber', () => {
  it('valide les champs corrects', () => {
    expect(validatePositiveNumber('30', 5, 100)).toBeNull();
    expect(validatePositiveNumber('75.5', 20, 350)).toBeNull();
  });
  it('detecte vide, NaN et hors limites', () => {
    expect(validatePositiveNumber('', 5, 100)).toBe('empty');
    expect(validatePositiveNumber('   ', 5, 100)).toBe('empty');
    expect(validatePositiveNumber('abc', 5, 100)).toBe('not-a-number');
    expect(validatePositiveNumber('Infinity', 5, 100)).toBe('not-a-number');
    expect(validatePositiveNumber('3', 5, 100)).toBe('out-of-range');
    expect(validatePositiveNumber('200', 5, 100)).toBe('out-of-range');
  });
});