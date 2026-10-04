import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { ACTIVITY_LEVELS, bmiGaugePosition, calculateCalories, calculateProtein } from '../../../utils/fitness';
import type { ActivityLevel, CalorieGoal, Sex } from '../../../utils/fitness';
import { useAuth } from '../../../hooks/useAuth';
import { calculateBMI, convertHeightToCm, convertWeightToKg, generateBMIReport, validatePositiveNumber } from '../../../utils/bmi';
import type { BmiClass, BmiFieldError, BmiReport, HeightUnit, WeightUnit } from '../../../utils/bmi';
import { Button } from '../../ui/Button';

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
}

function NumberField({ id, label, unit, value, onChange, min, max, step = 1, error }: NumberFieldProps) {
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

/* ---------- BMI : parcours d'analyse corporelle en 4 étapes ---------- */
const bmiClassColors: Record<BmiClass, string> = {
  under: 'text-sky-300',
  normal: 'text-success',
  over: 'text-amber-300',
  obese1: 'text-orange-400',
  obese2: 'text-red-400',
  obese3: 'text-red-300',
};

type BmiStep = 0 | 1 | 2 | 3;

const BMI_AGE_MIN = 5;
const BMI_AGE_MAX = 100;

interface BmiSnapshot {
  age: number;
  sexLabel: string;
  weightDisplay: string;
  heightDisplay: string;
  weightKg: number;
  heightCm: number;
}

export function BmiCalculator() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [step, setStep] = useState<BmiStep>(0);
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState<Sex>('male');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [weight, setWeight] = useState('75');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm');
  const [height, setHeight] = useState('175');
  const [heightIn, setHeightIn] = useState('0');
  const [showErrors, setShowErrors] = useState(false);
  const [report, setReport] = useState<BmiReport | null>(null);
  const [snapshot, setSnapshot] = useState<BmiSnapshot | null>(null);

  const wMin = weightUnit === 'kg' ? 20 : 44;
  const wMax = weightUnit === 'kg' ? 350 : 772;
  const hMin = heightUnit === 'cm' ? 100 : 3;
  const hMax = heightUnit === 'cm' ? 250 : 8;

  const ageError = validatePositiveNumber(age, BMI_AGE_MIN, BMI_AGE_MAX);
  const weightError = validatePositiveNumber(weight, wMin, wMax);
  const heightError = validatePositiveNumber(height, hMin, hMax);
  const heightInError = heightUnit === 'ft-in' ? validatePositiveNumber(heightIn, 0, 11.99) : null;

  const errorMessage = (code: BmiFieldError | null, rangeMessage: string): string | undefined => {
    if (!code) return undefined;
    if (code === 'empty') return t.calc.bmi.errors.required;
    if (code === 'not-a-number') return t.calc.bmi.errors.notNumber;
    return rangeMessage;
  };

  const stepValid = [ageError === null, weightError === null && heightError === null && heightInError === null, true, true][step];
  const ageNumber = Number(age);
  const isMinor = ageError === null && ageNumber < 18;

  const goNext = () => {
    if (!stepValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => (s < 3 ? ((s + 1) as BmiStep) : s));
  };
  const goBack = () => {
    setShowErrors(false);
    setStep((s) => (s > 0 ? ((s - 1) as BmiStep) : s));
  };

  const runCalculation = () => {
    const weightKg = convertWeightToKg(Number(weight), weightUnit);
    const heightCm = heightUnit === 'cm' ? Number(height) : convertHeightToCm(Number(height), 'ft-in', Number(heightIn));
    const bmi = calculateBMI(weightKg, heightCm);
    const result = generateBMIReport({ bmi, heightCm, weightKg, age: ageNumber, weightGoal: user?.weightGoal ?? null });
    if (!result) return;
    const weightLabel = weightUnit === 'kg' ? t.calc.bmi.unitKg : t.calc.bmi.unitLb;
    setSnapshot({
      age: ageNumber,
      sexLabel: sex === 'male' ? t.calc.male : t.calc.female,
      weightDisplay: `${weight} ${weightLabel}`,
      heightDisplay: heightUnit === 'cm' ? `${height} ${t.calc.bmi.unitCm}` : `${height} ${t.calc.bmi.feet} ${heightIn} ${t.calc.bmi.inches}`,
      weightKg,
      heightCm,
    });
    setReport(result);
    setStep(3);
  };

  const recalculate = () => {
    setReport(null);
    setSnapshot(null);
    setShowErrors(false);
    setStep(0);
  };

  const stepLabels = [t.calc.bmi.steps.info, t.calc.bmi.steps.measures, t.calc.bmi.steps.review, t.calc.bmi.steps.report];

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted">{t.calc.bmi.intro}</p>

      <ol aria-label={t.calc.bmi.steps.report} className="mt-5 grid grid-cols-4 gap-2">
        {stepLabels.map((label, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={label} className="flex flex-col gap-1.5">
              <span
                aria-hidden
                className={cn('h-1.5 rounded-full transition-colors', done || current ? 'bg-volt' : 'bg-night-700')}
              />
              <span
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'text-[10px] font-extrabold uppercase tracking-[0.12em]',
                  current ? 'text-volt' : done ? 'text-ink' : 'text-muted',
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {t.calc.bmi.stepOf(step + 1, stepLabels.length)}
      </p>

      {step === 0 && (
        <div className="mt-6 space-y-4">
          <NumberField
            id="bmi-age"
            label={t.calc.age}
            unit={t.calc.ageUnit}
            value={age}
            onChange={setAge}
            min={BMI_AGE_MIN}
            max={BMI_AGE_MAX}
            error={showErrors ? errorMessage(ageError, t.calc.bmi.errors.ageRange) : undefined}
          />
          <Segmented
            label={t.calc.sex}
            value={sex}
            onChange={setSex}
            options={[
              { value: 'male', label: t.calc.male },
              { value: 'female', label: t.calc.female },
            ]}
          />
          <p className="text-xs leading-relaxed text-muted">{t.calc.bmi.ageHint}</p>
          {isMinor && (
            <p role="note" className="rounded-lg border border-edge bg-night-900 p-3 text-xs leading-relaxed text-muted">
              {t.calc.bmi.minorInfo}
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <Segmented
            label={t.calc.bmi.weightUnitLabel}
            value={weightUnit}
            onChange={setWeightUnit}
            options={[
              { value: 'kg', label: t.calc.bmi.unitKg },
              { value: 'lb', label: t.calc.bmi.unitLb },
            ]}
          />
          <NumberField
            id="bmi-weight"
            label={t.calc.weight}
            unit={weightUnit === 'kg' ? t.calc.bmi.unitKg : t.calc.bmi.unitLb}
            value={weight}
            onChange={setWeight}
            min={wMin}
            max={wMax}
            step={0.1}
            error={showErrors ? errorMessage(weightError, t.calc.bmi.errors.weightRange) : undefined}
          />
          <Segmented
            label={t.calc.bmi.heightUnitLabel}
            value={heightUnit}
            onChange={setHeightUnit}
            options={[
              { value: 'cm', label: t.calc.bmi.unitCm },
              { value: 'ft-in', label: t.calc.bmi.unitFtIn },
            ]}
          />
          {heightUnit === 'cm' ? (
            <NumberField
              id="bmi-height"
              label={t.calc.height}
              unit={t.calc.bmi.unitCm}
              value={height}
              onChange={setHeight}
              min={hMin}
              max={hMax}
              error={showErrors ? errorMessage(heightError, t.calc.bmi.errors.heightRange) : undefined}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                id="bmi-height-ft"
                label={t.calc.bmi.feet}
                unit="ft"
                value={height}
                onChange={setHeight}
                min={hMin}
                max={hMax}
                error={showErrors ? errorMessage(heightError, t.calc.bmi.errors.heightRange) : undefined}
              />
              <NumberField
                id="bmi-height-in"
                label={t.calc.bmi.inches}
                unit="in"
                value={heightIn}
                onChange={setHeightIn}
                min={0}
                max={11.99}
                step={0.5}
                error={showErrors ? errorMessage(heightInError, t.calc.bmi.errors.heightRange) : undefined}
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <ResultPanel>
            <p className={labelClass}>{t.calc.bmi.reviewTitle}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">{t.calc.age}</dt>
                <dd className="font-bold">
                  {age} {t.calc.ageUnit}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">{t.calc.sex}</dt>
                <dd className="font-bold">{sex === 'male' ? t.calc.male : t.calc.female}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">{t.calc.weight}</dt>
                <dd className="font-bold">
                  {weight} {weightUnit === 'kg' ? t.calc.bmi.unitKg : t.calc.bmi.unitLb}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">{t.calc.height}</dt>
                <dd className="font-bold">
                  {heightUnit === 'cm'
                    ? `${height} ${t.calc.bmi.unitCm}`
                    : `${height} ${t.calc.bmi.feet} ${heightIn} ${t.calc.bmi.inches}`}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={goBack}>
                {t.calc.bmi.edit}
              </Button>
              <Button onClick={runCalculation}>{t.calc.bmi.calculate}</Button>
            </div>
          </ResultPanel>
        </div>
      )}

      {step === 3 && report && snapshot && (
        <BmiReportView report={report} snapshot={snapshot} onRecalculate={recalculate} />
      )}

      {step < 2 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={goBack} disabled={step === 0}>
            {t.common.back}
          </Button>
          <Button onClick={goNext}>{t.common.next}</Button>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

/* ---------- Rapport IMC personnalisé ---------- */
function BmiGauge({ value, currentLabel }: { value: number; currentLabel: string }) {
  const { t, fmtNumber } = useLanguage();
  const zones = [
    { label: t.calc.bmi.scaleLabels.under, width: '14%', className: 'bg-sky-400/70' },
    { label: t.calc.bmi.scaleLabels.normal, width: '26%', className: 'bg-success' },
    { label: t.calc.bmi.scaleLabels.over, width: '20%', className: 'bg-amber-400' },
    { label: t.calc.bmi.scaleLabels.obese, width: '40%', className: 'bg-red-400' },
  ];
  return (
    <div>
      <p className="sr-only">{t.calc.bmi.scale}</p>
      <div className="relative h-2.5">
        <div className="flex h-full overflow-hidden rounded-full">
          {zones.map((zone) => (
            <span key={zone.label} className={cn('h-full', zone.className)} style={{ width: zone.width }} />
          ))}
        </div>
        <span
          aria-hidden
          className="absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-night-900"
          style={{ left: `${bmiGaugePosition(value)}%` }}
        />
      </div>
      <div aria-hidden className="mt-2 grid grid-cols-4 text-[10px] font-bold uppercase tracking-wide text-muted">
        {zones.map((zone) => (
          <span key={zone.label} className="truncate">
            {zone.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm font-bold">
        {currentLabel} :{' '}
        <span className="text-volt">{fmtNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
      </p>
    </div>
  );
}

function BmiReportView({ report, snapshot, onRecalculate }: { report: BmiReport; snapshot: BmiSnapshot; onRecalculate: () => void }) {
  const { t, fmtNumber } = useLanguage();
  const fmt1 = (value: number) => fmtNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtMeters = (heightCm: number) =>
    fmtNumber(heightCm / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (report.isMinor) {
    return (
      <div className="mt-6 space-y-4" aria-live="polite">
        <ResultPanel>
          <p className={labelClass}>{t.calc.bmi.minorTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.minorText}</p>
          <p className={cn(labelClass, 'mt-6')}>{t.calc.bmi.minorValueLabel}</p>
          <p className="mt-1 font-display text-7xl leading-none text-volt">{fmt1(report.rounded)}</p>
        </ResultPanel>
        <Button variant="outline" onClick={onRecalculate}>
          {t.calc.bmi.recalculate}
        </Button>
        <Disclaimer />
      </div>
    );
  }

  const category = report.category as BmiClass;
  return (
    <div className="mt-6 space-y-4" aria-live="polite">
      <ResultPanel>
        <p className={labelClass}>{t.calc.bmi.reportTitle}</p>
        <p className="mt-4 font-display text-7xl leading-none text-volt">{fmt1(report.rounded)}</p>
        <p className={cn('mt-2 text-sm font-extrabold uppercase tracking-wider', bmiClassColors[category])}>
          {t.calc.bmi.classes[category]}
        </p>
        <div className="mt-7">
          <BmiGauge value={report.bmi} currentLabel={t.calc.bmi.currentBmi} />
        </div>
      </ResultPanel>

      <ResultPanel>
        <p className={labelClass}>{t.calc.bmi.situationTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.situationText[category]}</p>
      </ResultPanel>

      {report.range && report.position && (
        <ResultPanel>
          <p className={labelClass}>{t.calc.bmi.rangeTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            {t.calc.bmi.rangeText(fmt1(report.range.min), fmt1(report.range.max), fmtMeters(snapshot.heightCm))}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{t.calc.bmi.rangeNote}</p>
          <p className="mt-3 border-t border-edge pt-3 text-sm leading-relaxed text-muted">
            {t.calc.bmi.position[report.position]}
          </p>
        </ResultPanel>
      )}

      {report.goal && (
        <ResultPanel>
          <p className={labelClass}>{t.calc.bmi.goalTitle}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-edge p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalCurrent}</dt>
              <dd className="mt-1 font-display text-2xl">{fmt1(report.goal.current)}</dd>
            </div>
            <div className="rounded-lg border border-edge p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalTarget}</dt>
              <dd className="mt-1 font-display text-2xl text-volt">{fmt1(report.goal.target)}</dd>
            </div>
            <div className="rounded-lg border border-edge p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.calc.bmi.goalDiff}</dt>
              <dd className="mt-1 font-display text-2xl">
                {report.goal.diff > 0 ? '+' : ''}
                {fmt1(report.goal.diff)}
              </dd>
            </div>
          </dl>
        </ResultPanel>
      )}

      <ResultPanel>
        <p className={labelClass}>{t.calc.bmi.tipsTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.tipsText[category]}</p>
      </ResultPanel>

      <ResultPanel>
        <p className={labelClass}>{t.calc.bmi.limitsTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t.calc.bmi.limitsText}</p>
      </ResultPanel>

      <ResultPanel>
        <p className={labelClass}>{t.calc.bmi.finalTitle}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t.calc.bmi.result}</dt>
            <dd className="font-display text-2xl text-volt">{fmt1(report.rounded)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t.calc.bmi.categoryLabel}</dt>
            <dd className={cn('text-right font-bold', bmiClassColors[category])}>{t.calc.bmi.classes[category]}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t.calc.bmi.finalHeight}</dt>
            <dd className="font-bold">
              {fmtMeters(snapshot.heightCm)} m
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t.calc.bmi.finalWeight}</dt>
            <dd className="font-bold">
              {fmt1(snapshot.weightKg)} kg
            </dd>
          </div>
          {report.range && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t.calc.bmi.finalRange}</dt>
              <dd className="text-right font-bold">
                {fmt1(report.range.min)} – {fmt1(report.range.max)} kg
              </dd>
            </div>
          )}
        </dl>
        <p className="mt-4 border-t border-edge pt-3 text-xs leading-relaxed text-muted">{t.calc.bmi.finalNote}</p>
      </ResultPanel>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onRecalculate}>
          {t.calc.bmi.recalculate}
        </Button>
      </div>
      <Disclaimer />
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
