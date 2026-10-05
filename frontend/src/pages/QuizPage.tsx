import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowRight, Building2, Check, Dumbbell, Flame, House, Pencil, Repeat, RotateCcw, Sprout, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '../utils/cn';
import { recommendPrograms } from '../utils/fitness';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { programs } from '../data/programs';
import { ProgramCard } from '../components/features/programs/ProgramCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/SectionHeading';
import type { Goal, Level, QuizAnswers, TrainingLocation } from '../types';

type StepKey = 'goal' | 'level' | 'sessions' | 'location' | 'duration' | 'height' | 'weight';
const STEPS: StepKey[] = ['height', 'weight', 'goal', 'level', 'sessions', 'location', 'duration'];

const OPTIONS: Record<StepKey, { value: string; icon?: LucideIcon }[]> = {
  goal: [
    { value: 'weight-loss', icon: Flame },
    { value: 'muscle-gain', icon: Dumbbell },
  ],
  level: [
    { value: 'beginner', icon: Sprout },
    { value: 'intermediate', icon: TrendingUp },
    { value: 'advanced', icon: Trophy },
  ],
  sessions: [{ value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }],
  location: [
    { value: 'home', icon: House },
    { value: 'gym', icon: Building2 },
    { value: 'both', icon: Repeat },
  ],
  duration: [{ value: '20' }, { value: '30' }, { value: '45' }, { value: '60' }],
  height: [],
  weight: [],
};

const INPUT_STEPS: StepKey[] = ['height', 'weight'];

type Answers = Partial<Record<StepKey, string>>;
const isGoal = (value: string | null | undefined): value is Goal => value === 'weight-loss' || value === 'muscle-gain';
const isLevel = (value: string | null | undefined): value is Level =>
  value === 'beginner' || value === 'intermediate' || value === 'advanced';
const isLocation = (value: string | null | undefined): value is TrainingLocation =>
  value === 'home' || value === 'gym' || value === 'both';

export default function QuizPage() {
  const { t } = useLanguage();
  usePageTitle(t.quiz.title);
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initialGoal = params.get('goal');
  const [answers, setAnswers] = useState<Answers>(() => (isGoal(initialGoal) ? { goal: initialGoal } : {}));
  const [step, setStep] = useState(() => (isGoal(initialGoal) ? 1 : 0));
  const timer = useRef<number | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Move focus to the new question for screen-reader & keyboard users (not on first render)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const isResult = step >= STEPS.length;
  const currentKey = STEPS[Math.min(step, STEPS.length - 1)];
  const progress = Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100);

  const optionText = (key: StepKey, value: string) => {
    const question = t.quiz.questions[key] as { options?: Record<string, { label: string; desc: string }> };
    return question.options?.[value] ?? { label: value, desc: '' };
  };

  const select = (value: string) => {
    setAnswers((previous) => ({ ...previous, [currentKey]: value }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length)), 260);
  };

  const quizAnswers = useMemo<QuizAnswers>(
    () => ({
      goal: isGoal(answers.goal) ? answers.goal : undefined,
      level: isLevel(answers.level) ? answers.level : undefined,
      sessions: answers.sessions ? Number(answers.sessions) : undefined,
      location: isLocation(answers.location) ? answers.location : undefined,
      duration: answers.duration ? Number(answers.duration) : undefined,
      height: answers.height ? Number(answers.height) : undefined,
      weight: answers.weight ? Number(answers.weight) : undefined,
    }),
    [answers],
  );

  // Résultat : on ne propose QUE les programmes de l'objectif choisi
  // (prise de masse → tous les muscle-gain, perte de poids → tous les weight-loss),
  // triés par affinité avec le reste des réponses (niveau, séances, lieu, durée).
  const goalPrograms = useMemo(
    () => (quizAnswers.goal ? programs.filter((program) => program.goal === quizAnswers.goal) : programs),
    [quizAnswers.goal],
  );

  const matches = useMemo(
    () => (isResult ? recommendPrograms(quizAnswers, goalPrograms, Math.max(goalPrograms.length, 1)) : []),
    [isResult, quizAnswers, goalPrograms],
  );

  const topPick = useMemo(() => (isResult ? matches[0] ?? null : null), [isResult, matches]);

  const restart = () => {
    window.clearTimeout(timer.current);
    setAnswers({});
    setStep(0);
  };

  const options = OPTIONS[currentKey];
  const question = t.quiz.questions[currentKey];
  const isInputStep = INPUT_STEPS.includes(currentKey);

  return (
    <section className="relative isolate min-h-screen overflow-hidden pb-20 pt-28 lg:pt-36">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div aria-hidden className="absolute -right-20 top-40 -z-10 hidden h-80 w-80 rotate-12 border border-volt/15 lg:block" />
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>{isResult ? t.quiz.resultEyebrow : t.quiz.eyebrow}</Eyebrow>
            <p className="mt-2 font-display text-2xl uppercase text-muted">{t.quiz.title}</p>
          </div>
          {!isResult && <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.quiz.stepOf(step + 1, STEPS.length)}</p>}
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-night-700"
          role="progressbar"
          aria-label={t.quiz.progressLabel}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-volt transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <ol aria-hidden className="mt-3 hidden grid-cols-7 gap-2 sm:grid">
          {STEPS.map((key, index) => (
            <li
              key={key}
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-[0.14em]',
                index < step ? 'text-volt' : index === step ? 'text-ink' : 'text-muted/60',
              )}
            >
              {t.quizBanner.steps[index]}
            </li>
          ))}
        </ol>

        {!isResult ? (
          <div key={currentKey} className="mt-12 animate-fade-up">
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-4xl uppercase leading-[0.95] tracking-tight focus:outline-none sm:text-6xl">
              {question.title}
            </h1>
            <p className="mt-3 text-muted sm:text-lg">{question.subtitle}</p>

            {isInputStep ? (
              <div className="mt-10 mx-auto max-w-md">
                <label htmlFor={currentKey} className="sr-only">
                  {question.title}
                </label>
                <div className="relative">
                  <input
                    id={currentKey}
                    type="number"
                    min={currentKey === 'height' ? 100 : 30}
                    max={currentKey === 'height' ? 250 : 300}
                    value={answers[currentKey] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnswers((prev) => ({ ...prev, [currentKey]: val }));
                    }}
                    placeholder={currentKey === 'height' ? '170' : '70'}
                    className="w-full rounded-2xl border-2 border-edge bg-night-800 px-5 py-4 pr-16 text-2xl font-display text-ink placeholder:text-muted/50 focus:border-volt focus:outline-none transition-colors"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-wider text-muted">
                    {currentKey === 'height' ? 'cm' : 'kg'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted">{question.subtitle}</p>
              </div>
            ) : (
              <div
                role="group"
                aria-label={question.title}
                className={cn(
                  'mt-10 grid gap-3 sm:gap-4',
                  options.length === 2 ? 'sm:grid-cols-2' : options.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4',
                )}
              >
                {options.map(({ value, icon: Icon }) => {
                  const option = optionText(currentKey, value);
                  const selected = answers[currentKey] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => select(value)}
                      className={cn(
                        'group relative flex flex-col items-start rounded-2xl border-2 p-5 text-left transition-all duration-200 sm:p-6',
                        selected ? 'border-volt bg-volt/10' : 'border-edge bg-night-800 hover:-translate-y-0.5 hover:border-edge-strong',
                      )}
                    >
                      {Icon ? (
                        <>
                          <span
                            className={cn(
                              'grid h-12 w-12 place-items-center rounded-xl transition-colors duration-200',
                              selected ? 'bg-volt text-night-900' : 'bg-night-700 text-volt',
                            )}
                          >
                            <Icon className="h-6 w-6" aria-hidden />
                          </span>
                          <span className="mt-5 font-display text-2xl uppercase">{option.label}</span>
                        </>
                      ) : (
                        <>
                          <span className={cn('font-display text-5xl uppercase leading-none transition-colors', selected ? 'text-volt' : 'text-ink')}>
                            {option.label}
                          </span>
                          {currentKey === 'sessions' && (
                            <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t.quiz.sessionsUnit}</span>
                          )}
                        </>
                      )}
                      <span className="mt-2 text-sm text-muted">{option.desc}</span>
                      <span
                        aria-hidden
                        className={cn(
                          'absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border transition-colors duration-200',
                          selected ? 'border-volt bg-volt text-night-900' : 'border-edge-strong',
                        )}
                      >
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4">
              <Button variant="ghost" icon={<ArrowLeft />} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                {t.common.back}
              </Button>
              <Button
                onClick={() => setStep((s) => Math.min(s + 1, STEPS.length))}
                disabled={isInputStep ? !answers[currentKey] || Number(answers[currentKey]) <= 0 : !answers[currentKey]}
                iconRight={<ArrowRight />}
              >
                {t.common.next}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 animate-fade-up">
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-5xl uppercase leading-[0.92] tracking-tight focus:outline-none sm:text-7xl">
              {t.quiz.resultTitle1} <span className="text-volt">{t.quiz.resultTitle2}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-muted sm:text-lg">{t.quiz.resultText}</p>

            <div className="mt-8 rounded-2xl border border-edge bg-night-800/70 p-4 sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.quiz.yourAnswers}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {STEPS.map((key, index) => {
                  const value = answers[key];
                  if (!value) return null;
                  const label = `${optionText(key, value).label}${key === 'sessions' ? ` ${t.quiz.sessionsUnit}` : ''}`;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setStep(index)}
                        aria-label={t.quiz.editAnswer(label)}
                        className="inline-flex items-center gap-2 rounded-full border border-edge bg-night-900 px-3.5 py-2 text-xs font-bold transition-colors duration-200 hover:border-volt hover:text-volt"
                      >
                        <span className="text-muted">{t.quizBanner.steps[index]} :</span>
                        {label}
                        <Pencil className="h-3 w-3" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {topPick && (
              <div className="mt-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.quiz.yourGoal}</p>
                <div className="mt-4">
                  <ProgramCard program={topPick.program} matchScore={topPick.score} highlight={t.quiz.bestMatch} />
                </div>
              </div>
            )}

            {matches.filter((m) => m.program.id !== topPick?.program.id).length > 0 && (
              <div className="mt-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{t.quiz.otherMatches}</p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {matches
                    .filter((m) => m.program.id !== topPick?.program.id)
                    .map((match) => (
                      <ProgramCard key={match.program.id} program={match.program} matchScore={match.score} />
                    ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" icon={<RotateCcw />} onClick={restart}>
                {t.quiz.restart}
              </Button>
              <ButtonLink to="/programmes" variant="ghost" iconRight={<ArrowRight />}>
                {t.quiz.allPrograms}
              </ButtonLink>
            </div>

            {!user && (
              <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-volt/30 bg-volt/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold">{t.quiz.saveHint}</p>
                <ButtonLink to="/connexion?mode=register" iconRight={<ArrowRight />}>
                  {t.quiz.createAccount}
                </ButtonLink>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
