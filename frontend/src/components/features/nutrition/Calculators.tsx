import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Check, ChevronDown, Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { ACTIVITY_LEVELS, calculateCalories, calculateProtein, clamp } from '../../../utils/fitness';
import type { ActivityLevel, CalorieGoal, Sex } from '../../../utils/fitness';
import { useAuth } from '../../../hooks/useAuth';
import { analyzeBMI, BMI_THRESHOLDS, generateBMIReport, getBMIPlan, validatePositiveNumber } from '../../../utils/bmi';
import type { BmiClass, BmiFieldError, BmiPlan, BmiPosition } from '../../../utils/bmi';
import { Button, ButtonLink } from '../../ui/Button';

/* ---------- Shared fields ---------- */
const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted';

interface NumberFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  error?: string;
  placeholder?: string;
}

function NumberField({ id, label, unit, value, onChange, min, max, step = 1, error, placeholder }: NumberFieldProps) {
  const num = Number(value);
  const invalid = value === '' || Number.isNaN(num) || num < min || num > max;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            'h-12 w-full rounded-lg border bg-night-900 pl-3.5 pr-10 text-base font-bold text-ink transition-colors duration-200 focus:outline-none',
            invalid ? 'border-danger/70' : 'border-edge focus:border-volt',
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted">{unit}</span>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-12 rounded-lg border px-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
              value === option.value ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ActivitySelect({ id, value, onChange }: { id: string; value: ActivityLevel; onChange: (value: ActivityLevel) => void }) {
  const { t } = useLanguage();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {t.calc.activity}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as ActivityLevel)}
          className="h-12 w-full appearance-none rounded-lg border border-edge bg-night-900 pl-3.5 pr-10 text-sm font-semibold text-ink transition-colors duration-200 focus:border-volt focus:outline-none"
        >
          {ACTIVITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t.calc.activityLevels[level]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </div>
  );
}

function ResultPanel({ children }: { children: ReactNode }) {
  return (
    <div aria-live="polite" className="relative overflow-hidden rounded-xl border border-edge bg-night-900 p-6">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rotate-12 pattern-stripes opacity-10" />
      <div className="relative">{children}</div>
    </div>
  );
}

function Disclaimer() {
  const { t } = useLanguage();
  return (
    <p className="flex items-start gap-2 text-xs text-muted md:col-span-2">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      {t.calc.disclaimer}
    </p>
  );
}

/* ---------- BMI : bilan corporel personnalise ---------- */
const bmiClassColors: Record<BmiClass, string> = {
  under: 'text-sky-300',
  normal: 'text-success',
  over: 'text-amber-300',
  obese1: 'text-orange-400',
  obese2: 'text-red-400',
  obese3: 'text-red-300',
};

const BMI_AGE_MIN = 5;
const BMI_AGE_MAX = 100;
const BMI_WEIGHT_MIN = 20;
const BMI_WEIGHT_MAX = 350;
const BMI_HEIGHT_MIN = 100;
const BMI_HEIGHT_MAX = 250;

/* Jauge 6 zones derivee de BMI_THRESHOLDS (echelle 14 -> 44). */
const GAUGE_MIN = 14;
const GAUGE_MAX = 44;

const gaugeZoneColors: Record<BmiClass, string> = {
  under: 'bg-sky-400/70',
  normal: 'bg-success',
  over: 'bg-amber-400',
  obese1: 'bg-orange-400',
  obese2: 'bg-red-400',
  obese3: 'bg-red-600',
};

function gaugePosition(bmi: number): number {
  return clamp(((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100, 0, 100);
}

/** Compteur anime vers la cible (instantane si prefers-reduced-motion). */
function useAnimatedNumber(target: number, active: boolean): number {
  const [display, setDisplay] = useState(active ? target : 0);
  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);
  return display;
}

interface BmiAnalysis {
  age: number;
  sexLabel: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  rounded: number;
  isMinor: boolean;
  isSenior: boolean;
  category: BmiClass | null;
  plan: BmiPlan | null;
  range: { min: number; max: number } | null;
  position: BmiPosition | null;
  goal: { current: number; target: number; diff: number } | null;
}

export function BmiCalculator() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [analysis, setAnalysis] = useState<BmiAnalysis | null>(null);

  const ageError = validatePositiveNumber(age, BMI_AGE_MIN, BMI_AGE_MAX);
  const weightError = validatePositiveNumber(weight, BMI_WEIGHT_MIN, BMI_WEIGHT_MAX);
  const heightError = validatePositiveNumber(height, BMI_HEIGHT_MIN, BMI_HEIGHT_MAX);

  const fieldMessage = (code: BmiFieldError | null, emptyMessage: string, rangeMessage: string): string | undefined => {
    if (!code) return undefined;
    if (code === 'empty') return emptyMessage;
    return rangeMessage;
  };

  const formValid = ageError === null && weightError === null && heightError === null;


  const analyze = () => {
    if (!formValid) {
      setShowErrors(true);
      return;
    }
    const ageN = Number(age);
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const result = analyzeBMI(weightKg, heightCm);
    if (!result) return;
    const full = generateBMIReport({ bmi: result.bmi, heightCm, weightKg, age: ageN, weightGoal: user?.weightGoal ?? null });
    setAnalysis({
      age: ageN,
      sexLabel: sex === 'male' ? t.calc.male : t.calc.female,
      weightKg,
      heightCm,
      bmi: result.bmi,
      rounded: result.rounded,
      isMinor: ageN < 18,
      isSenior: ageN >= 65,
      category: result.category,
      plan: getBMIPlan(result.category),
      range: full?.range ?? null,
      position: full?.position ?? null,
      goal: full?.goal ?? null,
    });
  };

  const reset = () => setAnalysis(null);

  if (analysis) {
    return <BmiResultView analysis={analysis} onReset={reset} />;
  }

  return (
    <div>
      <h3 className="font-display text-3xl uppercase tracking-tight">{t.calc.bmi.formTitle}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.calc.bmi.formSubtitle}</p>

      <div className="mt-6 space-y-5" role="group" aria-label={t.calc.bmi.formTitle}>
        <fieldset>
          <legend className={labelClass}>{t.calc.sex}</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(['male', 'female'] as Sex[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sex === option}
                onClick={() => setSex(option)}
                className={cn(
                  'h-16 rounded-xl border text-sm font-extrabold uppercase tracking-[0.12em] transition-colors duration-200',
                  sex === option ? 'border-volt bg-volt/10 text-volt' : 'border-edge text-muted hover:border-edge-strong hover:text-ink',
                )}
              >
                {option === 'male' ? t.calc.male : t.calc.female}
              </button>
            ))}
          </div>
        </fieldset>

        <NumberField
          id="bmi-age"
          label={t.calc.age}
          unit={t.calc.ageUnit}
          value={age}
          onChange={setAge}
          min={BMI_AGE_MIN}
          max={BMI_AGE_MAX}
          placeholder="30"
          error={showErrors ? fieldMessage(ageError, t.calc.bmi.validation.ageRequired, t.calc.bmi.validation.ageInvalid) : undefined}
        />
        <NumberField
          id="bmi-height"
          label={t.calc.height}
          unit={t.calc.heightUnit}
          value={height}
          onChange={setHeight}
          min={BMI_HEIGHT_MIN}
          max={BMI_HEIGHT_MAX}
          placeholder="175"
          error={showErrors ? fieldMessage(heightError, t.calc.bmi.validation.heightRequired, t.calc.bmi.validation.heightRange) : undefined}
        />
        <NumberField
          id="bmi-weight"
          label={t.calc.weight}
          unit={t.calc.weightUnit}
          value={weight}
          onChange={setWeight}
          min={BMI_WEIGHT_MIN}
          max={BMI_WEIGHT_MAX}
          step={0.1}
          placeholder="70"
          error={showErrors ? fieldMessage(weightError, t.calc.bmi.validation.weightRequired, t.calc.bmi.validation.weightRange) : undefined}
        />

        <Button size="lg" fullWidth onClick={analyze} disabled={!formValid}>
          {t.calc.bmi.analyze}
        </Button>
      </div>
      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  );

}

/* ---------- Jauge 6 zones ---------- */
function BmiGauge({ bmi, categoryLabel }: { bmi: number; categoryLabel: string }) {
  const { t } = useLanguage();
  const bounds = [GAUGE_MIN, ...BMI_THRESHOLDS.map((threshold) => (Number.isFinite(threshold.max) ? threshold.max : GAUGE_MAX))];
  return (
    <div>
      <div
        role="img"
        aria-label={`${t.calc.bmi.gaugeTitle} : ${categoryLabel}`}
        className="relative h-3"
      >
        <div className="flex h-full overflow-hidden rounded-full">
          {BMI_THRESHOLDS.map((threshold, index) => {
            const width = ((bounds[index + 1] - bounds[index]) / (GAUGE_MAX - GAUGE_MIN)) * 100;
            return <span key={threshold.class} className={cn('h-full', gaugeZoneColors[threshold.class])} style={{ width: `${width}%` }} />;
          })}
        </div>
        <span
          aria-hidden
          className="absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-night-900 transition-[left] duration-700 ease-out motion-reduce:transition-none"
          style={{ left: `${gaugePosition(bmi)}%` }}
        />
      </div>
      <div aria-hidden className="mt-2 grid grid-cols-6 gap-1 text-[9px] font-bold uppercase tracking-wide text-muted sm:text-[10px]">
        {BMI_THRESHOLDS.map((threshold) => (
          <span key={threshold.class} className="truncate">
            {t.calc.bmi.gaugeClasses[threshold.class]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Vue resultat : rapport personnalise ---------- */
function BmiResultView({ analysis, onReset }: { analysis: BmiAnalysis; onReset: () => void }) {
  const { t, fmtNumber } = useLanguage();
  const animated = useAnimatedNumber(analysis.rounded, true);
  const fmt1 = (value: number) => fmtNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtMeters = (heightCm: number) => fmtNumber(heightCm / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    resultRef.current?.focus({ preventScroll: true });
  }, []);

  const planCtas: Record<BmiPlan, { to: string; label: string }[]> = {
    lose: [
      { to: '/nutrition', label: t.calc.bmi.ctaRecipes },
      { to: '/exercices', label: t.calc.bmi.ctaExercises },
      { to: '/dashboard/progression', label: t.calc.bmi.ctaProgress },
    ],
    gain: [
      { to: '/nutrition', label: t.calc.bmi.ctaRecipes },
      { to: '/programmes', label: t.calc.bmi.ctaPrograms },
      { to: '/conseils', label: t.calc.bmi.ctaAdvice },
    ],
    maintain: [
      { to: '/exercices', label: t.calc.bmi.ctaExercises },
      { to: '/conseils', label: t.calc.bmi.ctaAdvice },
      { to: '/dashboard/progression', label: t.calc.bmi.ctaProgress },
    ],
  };

  const recKey = analysis.category === 'under' || analysis.category === 'normal' || analysis.category === 'over' ? analysis.category : 'obese';

  return (
    <div aria-live="polite">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-volt">{t.calc.bmi.analysisDone}</p>

      {analysis.isMinor || !analysis.category ? (
        <div className="mt-4 space-y-4">
          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.minorTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.minorText}</p>
            <p className={cn(labelClass, 'mt-6')}>{t.calc.bmi.minorValueLabel}</p>
            <p className="mt-1 font-display text-7xl leading-none tracking-tight text-volt">{fmt1(analysis.rounded)}</p>
          </ResultPanel>
          <Button variant="outline" onClick={onReset}>
            {t.calc.bmi.recalculate}
          </Button>
          <Disclaimer />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <ResultPanel>
            <h3 ref={resultRef} tabIndex={-1} className="font-display text-2xl uppercase tracking-tight focus:outline-none">
              {t.calc.bmi.result}
            </h3>
            <p className="mt-2 font-display text-7xl leading-none tracking-tight text-volt">
              {fmt1(animated)} <span className="text-2xl text-muted">{t.calc.bmi.resultUnit}</span>
            </p>
            <p className={cn('mt-3 text-sm font-extrabold uppercase tracking-wider', bmiClassColors[analysis.category])}>
              {t.calc.bmi.classes[analysis.category]}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.interpretations[analysis.category]}</p>
            {analysis.isSenior && (
              <p role="note" className="mt-4 rounded-lg border border-edge bg-night-800 p-3 text-xs leading-relaxed text-muted">
                {t.calc.bmi.elderlyWarning}
              </p>
            )}
          </ResultPanel>

          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.gaugeTitle}</p>
            <div className="mt-4">
              <BmiGauge bmi={analysis.bmi} categoryLabel={t.calc.bmi.classes[analysis.category]} />
            </div>
            <p className="mt-3 text-sm font-bold">
              {t.calc.bmi.currentBmi} : <span className="text-volt">{fmt1(analysis.rounded)}</span>
            </p>
          </ResultPanel>

          {analysis.range && analysis.position && (
            <ResultPanel>
              <p className={labelClass}>{t.calc.bmi.rangeTitle}</p>
              <p className="mt-3 text-sm font-bold leading-relaxed">{t.calc.bmi.rangeQuestion}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink">
                {t.calc.bmi.rangeText(fmt1(analysis.range.min), fmt1(analysis.range.max), fmtMeters(analysis.heightCm))}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{t.calc.bmi.rangeNote}</p>
              <p className="mt-3 border-t border-edge pt-3 text-sm leading-relaxed text-muted">
                {t.calc.bmi.position[analysis.position]}
              </p>
            </ResultPanel>
          )}

          {analysis.goal && (
            <ResultPanel>
              <p className={labelClass}>{t.calc.bmi.goalTitle}</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-edge p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalCurrent}</dt>
                  <dd className="mt-1 font-display text-2xl">{fmt1(analysis.goal.current)}</dd>
                </div>
                <div className="rounded-lg border border-edge p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalTarget}</dt>
                  <dd className="mt-1 font-display text-2xl text-volt">{fmt1(analysis.goal.target)}</dd>
                </div>
                <div className="rounded-lg border border-edge p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalDiff}</dt>
                  <dd className="mt-1 font-display text-2xl">
                    {analysis.goal.diff > 0 ? '+' : ''}
                    {fmt1(analysis.goal.diff)}
                  </dd>
                </div>
              </dl>
            </ResultPanel>
          )}

          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.recommendationsTitle}</p>
            <ul className="mt-4 space-y-2.5">
              {t.calc.bmi.recommendations[recKey].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink/90">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </ResultPanel>

          {analysis.plan && (
            <ResultPanel>
              <p className={labelClass}>{t.calc.bmi.nextTitle}</p>
              <p className="mt-2 font-display text-2xl uppercase tracking-tight">{t.calc.bmi.planTitles[analysis.plan]}</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {planCtas[analysis.plan].map((cta) => (
                  <ButtonLink key={cta.to} to={cta.to} variant="outline" fullWidth>
                    {cta.label}
                  </ButtonLink>
                ))}
              </div>
            </ResultPanel>
          )}

          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.specialTitle}</p>
            <ul className="mt-4 space-y-3">
              {[
                { title: t.calc.bmi.specialPregnancyTitle, text: t.calc.bmi.specialPregnancyText },
                { title: t.calc.bmi.specialAthleteTitle, text: t.calc.bmi.specialAthleteText },
                { title: t.calc.bmi.specialElderlyTitle, text: t.calc.bmi.specialElderlyText },
                { title: t.calc.bmi.specialChangeTitle, text: t.calc.bmi.specialChangeText },
              ].map((item) => (
                <li key={item.title} className="rounded-lg border border-edge p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </ResultPanel>

          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.limitsTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.limitsText}</p>
          </ResultPanel>

          <Button variant="outline" onClick={onReset}>
            {t.calc.bmi.recalculate}
          </Button>
          <Disclaimer />
        </div>
      )}
    </div>
  );
}
/* ---------- Calories ---------- */
export function CalorieCalculator() {
  const { t, fmtNumber } = useLanguage();
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<CalorieGoal>('lose');

  const a = Number(age);
  const h = Number(height);
  const w = Number(weight);
  const valid = a >= 15 && a <= 90 && h >= 120 && h <= 230 && w >= 30 && w <= 300;
  const result = valid ? calculateCalories({ sex, age: a, heightCm: h, weightKg: w, activity, goal }) : null;
  const macros = result
    ? [
        { key: 'protein', label: t.calc.calories.protein, grams: result.protein, kcal: result.protein * 4, color: 'bg-volt' },
        { key: 'carbs', label: t.calc.calories.carbs, grams: result.carbs, kcal: result.carbs * 4, color: 'bg-sky-400' },
        { key: 'fat', label: t.calc.calories.fat, grams: result.fat, kcal: result.fat * 9, color: 'bg-amber-400' },
      ]
    : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">{t.calc.calories.intro}</p>
        <Segmented
          label={t.calc.sex}
          value={sex}
          onChange={setSex}
          options={[
            { value: 'male', label: t.calc.male },
            { value: 'female', label: t.calc.female },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-2">
          <NumberField id="cal-age" label={t.calc.age} unit={t.calc.ageUnit} value={age} onChange={setAge} min={15} max={90} />
          <NumberField id="cal-height" label={t.calc.height} unit={t.calc.heightUnit} value={height} onChange={setHeight} min={120} max={230} />
          <NumberField id="cal-weight" label={t.calc.weight} unit={t.calc.weightUnit} value={weight} onChange={setWeight} min={30} max={300} step={0.1} />
        </div>
        <ActivitySelect id="cal-activity" value={activity} onChange={setActivity} />
        <Segmented
          label={t.calc.goal}
          value={goal}
          onChange={setGoal}
          options={[
            { value: 'lose', label: t.calc.goals.lose },
            { value: 'maintain', label: t.calc.goals.maintain },
            { value: 'gain', label: t.calc.goals.gain },
          ]}
        />
      </div>
      <ResultPanel>
        {result ? (
          <>
            <p className={labelClass}>{t.calc.calories.target}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="font-display text-7xl leading-none text-volt">{fmtNumber(result.target)}</span>
              <span className="text-sm font-bold text-muted">{t.calc.calories.perDay}</span>
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-edge p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.calories.bmr}</dt>
                <dd className="mt-1 font-bold">{fmtNumber(result.bmr)} kcal</dd>
              </div>
              <div className="rounded-lg border border-edge p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.calories.tdee}</dt>
                <dd className="mt-1 font-bold">{fmtNumber(result.tdee)} kcal</dd>
              </div>
            </dl>
            <p className={cn(labelClass, 'mt-6')}>{t.calc.calories.macros}</p>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-night-700">
              {macros.map((macro) => (
                <span key={macro.key} className={cn('h-full', macro.color)} style={{ width: `${(macro.kcal / result.target) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {macros.map((macro) => (
                <li key={macro.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink/85">
                    <span className={cn('h-2.5 w-2.5 rounded-full', macro.color)} />
                    {macro.label}
                  </span>
                  <span className="font-bold">{fmtNumber(macro.grams)} g</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted">{t.calc.invalid}</p>
        )}
      </ResultPanel>
      <Disclaimer />
    </div>
  );
}

/* ---------- Protein ---------- */
export function ProteinCalculator() {
  const { t, fmtNumber } = useLanguage();
  const [weight, setWeight] = useState('75');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<CalorieGoal>('gain');
  const w = Number(weight);
  const valid = w >= 30 && w <= 300;
  const result = valid ? calculateProtein(w, goal, activity) : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">{t.calc.protein.intro}</p>
        <NumberField id="prot-weight" label={t.calc.weight} unit={t.calc.weightUnit} value={weight} onChange={setWeight} min={30} max={300} step={0.1} />
        <ActivitySelect id="prot-activity" value={activity} onChange={setActivity} />
        <Segmented
          label={t.calc.goal}
          value={goal}
          onChange={setGoal}
          options={[
            { value: 'lose', label: t.calc.goals.lose },
            { value: 'maintain', label: t.calc.goals.maintain },
            { value: 'gain', label: t.calc.goals.gain },
          ]}
        />
      </div>
      <ResultPanel>
        {result ? (
          <>
            <p className={labelClass}>{t.calc.protein.daily}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-7xl leading-none text-volt">{fmtNumber(result.daily)}</span>
              <span className="text-lg font-bold text-muted">g</span>
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-edge p-3">
                <dt className="text-muted">{t.calc.protein.range}</dt>
                <dd className="text-right font-bold">
                  {fmtNumber(result.min)}–{fmtNumber(result.max)} g
                  <span className="block text-[11px] font-semibold text-muted">
                    {fmtNumber(result.minPerKg)}–{fmtNumber(result.maxPerKg)} {t.calc.protein.perKg}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-edge p-3">
                <dt className="text-muted">{t.calc.protein.perMeal}</dt>
                <dd className="font-bold">≈ {fmtNumber(result.perMeal)} g</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-muted">{t.calc.protein.sources}</p>
          </>
        ) : (
          <p className="text-sm text-muted">{t.calc.invalid}</p>
        )}
      </ResultPanel>
      <Disclaimer />
    </div>
  );
}

/* ---------- Tabs wrapper ---------- */
export type CalculatorKey = 'calories' | 'protein' | 'bmi';
const KEYS: CalculatorKey[] = ['calories', 'protein', 'bmi'];

export function CalculatorTabs({ initial = 'calories', className }: { initial?: CalculatorKey; className?: string }) {
  const { t } = useLanguage();
  const [active, setActive] = useState<CalculatorKey>(initial);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = KEYS.indexOf(active);
    const next = KEYS[(index + (event.key === 'ArrowRight' ? 1 : KEYS.length - 1)) % KEYS.length];
    setActive(next);
    document.getElementById(`calc-tab-${next}`)?.focus();
  };

  return (
    <div className={cn('rounded-2xl border border-edge bg-night-800 p-4 sm:p-6 lg:p-8', className)}>
      <div role="tablist" aria-label={t.calc.tabsLabel} onKeyDown={onKeyDown} className="inline-flex rounded-full border border-edge bg-night-900 p-1">
        {KEYS.map((key) => (
          <button
            key={key}
            id={`calc-tab-${key}`}
            type="button"
            role="tab"
            aria-selected={active === key}
            aria-controls={`calc-panel-${key}`}
            tabIndex={active === key ? 0 : -1}
            onClick={() => setActive(key)}
            className={cn(
              'rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors duration-200 sm:px-6',
              active === key ? 'bg-volt text-night-900' : 'text-muted hover:text-ink',
            )}
          >
            {t.calc.tabs[key]}
          </button>
        ))}
      </div>
      <div id={`calc-panel-${active}`} role="tabpanel" aria-labelledby={`calc-tab-${active}`} className="mt-6">
        {active === 'calories' && <CalorieCalculator />}
        {active === 'protein' && <ProteinCalculator />}
        {active === 'bmi' && <BmiCalculator />}
      </div>
    </div>
  );
}
