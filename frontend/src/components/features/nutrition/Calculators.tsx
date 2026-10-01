import { useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { ACTIVITY_LEVELS, bmiGaugePosition, calculateBmi, calculateCalories, calculateProtein } from '../../../utils/fitness';
import type { ActivityLevel, BmiCategory, CalorieGoal, Sex } from '../../../utils/fitness';

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
}

function NumberField({ id, label, unit, value, onChange, min, max, step = 1 }: NumberFieldProps) {
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
          className={cn(
            'h-12 w-full rounded-lg border bg-night-900 pl-3.5 pr-10 text-base font-bold text-ink transition-colors duration-200 focus:outline-none',
            invalid ? 'border-danger/70' : 'border-edge focus:border-volt',
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-muted">{unit}</span>
      </div>
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

/* ---------- BMI ---------- */
const bmiColors: Record<BmiCategory, string> = {
  under: 'text-sky-300',
  normal: 'text-success',
  over: 'text-amber-300',
  obese: 'text-red-300',
};

export function BmiCalculator() {
  const { t, fmtNumber } = useLanguage();
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const h = Number(height);
  const w = Number(weight);
  const valid = h >= 120 && h <= 230 && w >= 30 && w <= 300;
  const result = valid ? calculateBmi(w, h) : null;
  const marks = [
    { value: 15, pos: 0 },
    { value: 18.5, pos: 14 },
    { value: 25, pos: 40 },
    { value: 30, pos: 60 },
    { value: 40, pos: 100 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted">{t.calc.bmi.intro}</p>
        <NumberField id="bmi-height" label={t.calc.height} unit={t.calc.heightUnit} value={height} onChange={setHeight} min={120} max={230} />
        <NumberField id="bmi-weight" label={t.calc.weight} unit={t.calc.weightUnit} value={weight} onChange={setWeight} min={30} max={300} step={0.1} />
      </div>
      <ResultPanel>
        {result ? (
          <>
            <p className={labelClass}>{t.calc.bmi.result}</p>
            <p className="mt-1 font-display text-7xl leading-none text-volt">
              {fmtNumber(result.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </p>
            <p className={cn('mt-2 text-sm font-extrabold uppercase tracking-wider', bmiColors[result.category])}>
              {t.calc.bmi.categories[result.category]}
            </p>
            <div className="mt-7">
              <p className="sr-only">{t.calc.bmi.scale}</p>
              <div className="relative h-2.5">
                <div className="flex h-full overflow-hidden rounded-full">
                  <span className="h-full bg-sky-400/70" style={{ width: '14%' }} />
                  <span className="h-full bg-success" style={{ width: '26%' }} />
                  <span className="h-full bg-amber-400" style={{ width: '20%' }} />
                  <span className="h-full bg-red-400" style={{ width: '40%' }} />
                </div>
                <span
                  aria-hidden
                  className="absolute top-1/2 h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-night-900 transition-[left] duration-500"
                  style={{ left: `${bmiGaugePosition(result.value)}%` }}
                />
              </div>
              <div aria-hidden className="relative mt-2 h-4 text-[10px] font-bold text-muted">
                {marks.map((mark) => (
                  <span
                    key={mark.value}
                    className={cn('absolute', mark.pos === 0 ? '' : mark.pos === 100 ? '-translate-x-full' : '-translate-x-1/2')}
                    style={{ left: `${mark.pos}%` }}
                  >
                    {fmtNumber(mark.value)}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{t.calc.invalid}</p>
        )}
      </ResultPanel>
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
