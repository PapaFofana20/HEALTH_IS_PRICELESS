import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Eye, EyeOff, RotateCcw, Star } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useLanguage } from '../../../hooks/useLanguage';
import { coaches, resetProgramOverride, saveProgramOverride } from '../../../data/programs';
import { Modal } from '../../ui/Modal';
import { PlanBadge, Tag } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import type { Program } from '../../../types';

interface FormState {
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
  descFr: string;
  descEn: string;
  objFr: string;
  objEn: string;
  weeks: string;
  perWeek: string;
  minutes: string;
  rating: string;
  image: string;
  coachId: string;
  visible: boolean;
}

const labelClass = 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';
const inputClass =
  'h-12 w-full rounded-xl border border-edge bg-night-900 px-3.5 text-sm font-semibold text-ink transition-colors placeholder:text-muted/60 focus:border-volt focus:outline-none';
const sectionClass = 'rounded-2xl border border-edge/70 bg-night-800/70 p-4 sm:p-5';
const sectionTitleClass = 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted';

const boundedInt = (value: string, min: number, max: number): number | null => {
  const n = Number(value.replace(',', '.'));
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const boundedFloat = (value: string, min: number, max: number): number | null => {
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const lines = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

interface ProgramEditModalProps {
  program: Program;
  initialVisible: boolean;
  onClose: () => void;
  onSaved: (kind: 'saved' | 'reset') => void;
}

/** Back-office editor for a program's main info (localized fields + visibility). */
export function ProgramEditModal({ program, initialVisible, onClose, onSaved }: ProgramEditModalProps) {
  const { t, loc } = useLanguage();
  const ids = useId();
  const [form, setForm] = useState<FormState>({
    nameFr: program.name.fr,
    nameEn: program.name.en,
    taglineFr: program.tagline.fr,
    taglineEn: program.tagline.en,
    descFr: program.description.fr,
    descEn: program.description.en,
    objFr: program.objectives.fr.join('\n'),
    objEn: program.objectives.en.join('\n'),
    weeks: String(program.durationWeeks),
    perWeek: String(program.sessionsPerWeek),
    minutes: String(program.sessionMinutes),
    rating: String(program.rating),
    image: program.image,
    coachId: program.coachId,
    visible: initialVisible,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const field = (key: keyof FormState, label: string, node: ReactNode) => (
    <div key={key}>
      <label htmlFor={`${ids}-${key}`} className={labelClass}>
        {label}
      </label>
      <div className="mt-1.5">{node}</div>
    </div>
  );

  const handleSave = async () => {
    const weeks = boundedInt(form.weeks, 1, 52);
    const perWeek = boundedInt(form.perWeek, 1, 7);
    const minutes = boundedInt(form.minutes, 10, 240);
    const rating = boundedFloat(form.rating, 0, 5);
    if (!form.nameFr.trim() || !form.nameEn.trim() || weeks === null || perWeek === null || minutes === null || rating === null) {
      setError(t.admin.programs.invalid);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveProgramOverride(
        program.id,
        {
          name: { fr: form.nameFr.trim(), en: form.nameEn.trim() },
          tagline: { fr: form.taglineFr.trim(), en: form.taglineEn.trim() },
          description: { fr: form.descFr.trim(), en: form.descEn.trim() },
          objectives: { fr: lines(form.objFr), en: lines(form.objEn) },
          durationWeeks: weeks,
          sessionsPerWeek: perWeek,
          sessionMinutes: minutes,
          rating,
          image: form.image.trim() || program.image,
          coachId: form.coachId,
        },
        form.visible,
      );
      onSaved('saved');
    } catch {
      setError(t.admin.programs.saveError);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetProgramOverride(program.id);
      onSaved('reset');
    } catch {
      setError(t.admin.programs.resetError);
    } finally {
      setBusy(false);
    }
  };

  const textInput = (key: keyof FormState, placeholder?: string) => (
    <input
      id={`${ids}-${key}`}
      value={String(form[key])}
      placeholder={placeholder}
      onChange={(event) => set(key, event.target.value as FormState[typeof key])}
      className={inputClass}
    />
  );

  const textArea = (key: keyof FormState, rows: number, placeholder?: string) => (
    <textarea
      id={`${ids}-${key}`}
      value={String(form[key])}
      rows={rows}
      placeholder={placeholder}
      onChange={(event) => set(key, event.target.value as FormState[typeof key])}
      className={cn(inputClass, 'h-auto min-h-24 resize-y py-3 leading-relaxed')}
    />
  );

  const previewImage = form.image.trim() || program.image;
  const previewName = form.nameFr.trim() || program.name.fr;
  const previewTagline = form.taglineFr.trim() || program.tagline.fr;

  return (
    <Modal open onClose={onClose} title={t.admin.programs.editTitle} description={t.admin.programs.editHint} size="lg">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <PlanBadge plan={program.plan} />
            <Tag tone="default">{t.goals[program.goal]}</Tag>
            <Tag tone="light">{loc(program.name)}</Tag>
          </div>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>Identité · FR/EN</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field('nameFr', `${t.admin.programs.fields.name} · FR`, textInput('nameFr'))}
              {field('nameEn', `${t.admin.programs.fields.name} · EN`, textInput('nameEn'))}
              {field('taglineFr', `${t.admin.programs.fields.tagline} · FR`, textInput('taglineFr'))}
              {field('taglineEn', `${t.admin.programs.fields.tagline} · EN`, textInput('taglineEn'))}
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>Contenus</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field('descFr', `${t.admin.programs.fields.description} · FR`, textArea('descFr', 4))}
              {field('descEn', `${t.admin.programs.fields.description} · EN`, textArea('descEn', 4))}
              {field('objFr', `${t.admin.programs.fields.objectives} · FR`, textArea('objFr', 4))}
              {field('objEn', `${t.admin.programs.fields.objectives} · EN`, textArea('objEn', 4))}
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>Paramètres</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {field('weeks', t.admin.programs.fields.weeks, textInput('weeks'))}
              {field('perWeek', t.admin.programs.fields.perWeek, textInput('perWeek'))}
              {field('minutes', t.admin.programs.fields.minutes, textInput('minutes'))}
              {field('rating', t.admin.programs.fields.rating, textInput('rating'))}
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>Média &amp; coach</h3>
            <div className="mt-4 grid gap-4">
              {field('image', t.admin.programs.fields.image, textInput('image', 'https://…'))}
              {field(
                'coachId',
                t.admin.programs.fields.coach,
                <select id={`${ids}-coachId`} value={form.coachId} onChange={(event) => set('coachId', event.target.value)} className={inputClass}>
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>,
              )}
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className={sectionTitleClass}>Visibilité</h3>
            <div className="mt-4">
              <span className={labelClass}>{t.admin.programs.fields.visible}</span>
              <label className="mt-1.5 flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-edge bg-night-900 px-3.5">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(event) => set('visible', event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-volt"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {form.visible ? t.admin.programs.fields.visible : t.admin.programs.hiddenTag}
                </span>
                {form.visible ? (
                  <Eye className="h-4 w-4 shrink-0 text-volt" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                )}
              </label>
            </div>
          </section>

          {error && (
            <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-5">
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={busy} icon={<RotateCcw aria-hidden />}>
              {confirmReset ? t.admin.programs.confirmReset : t.admin.programs.reset}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="subtle" size="sm" onClick={onClose} disabled={busy}>
                {t.common.cancel}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={busy}>
                {busy ? t.admin.programs.saving : t.common.save}
              </Button>
            </div>
          </div>
        </div>

        <aside className="min-w-0 self-start rounded-2xl border border-edge/70 bg-night-800/70 p-4 sm:p-5 xl:sticky xl:top-4">
          <p className={sectionTitleClass}>Aperçu</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-edge/60 bg-night-900/60">
            <img src={previewImage} alt="" className="h-40 w-full object-cover" />
            <div className="space-y-2.5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <PlanBadge plan={program.plan} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{t.goals[program.goal]}</span>
              </div>
              <p className="truncate font-display text-xl uppercase text-ink">{previewName}</p>
              <p className="line-clamp-2 min-h-10 text-sm text-muted">{previewTagline}</p>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-night-800 px-2.5 py-1 text-xs font-semibold text-muted">
                <Star className="h-3.5 w-3.5 fill-volt text-volt" aria-hidden />
                {form.rating || program.rating}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
