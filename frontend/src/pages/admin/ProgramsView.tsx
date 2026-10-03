import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Trash2, Pencil, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { fetchAdminMembers } from '../../services/adminApi';
import { deleteAllPrograms, deleteProgram, getAllPrograms, hasDeletedPrograms, isProgramVisible, restoreDeletedPrograms } from '../../data/programs';
import type { Program } from '../../types';
import { PlanBadge, Tag } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgramEditModal } from '../../components/features/admin/ProgramEditModal';
import { EmptyState } from '../../components/ui/States';

export function ProgramsView() {
  const { t, loc, fmtNumber } = useLanguage();
  const { data: members } = useAsync(fetchAdminMembers, []);
  const [editing, setEditing] = useState<Program | null>(null);
  const [flash, setFlash] = useState<'saved' | 'reset' | 'deleted' | 'restored' | null>(null);
  const [armedDelete, setArmedDelete] = useState<string | null>(null);
  const [armedDeleteAll, setArmedDeleteAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setVersion] = useState(0);
  const enrolledCount = (programId: string) => (members ?? []).filter((member) => member.programId === programId).length;
  const all = getAllPrograms();
  const deletedCount = hasDeletedPrograms();

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const run = async (action: () => Promise<void>, kind: 'deleted' | 'restored') => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      setVersion((version) => version + 1);
      setFlash(kind);
      setArmedDelete(null);
      setArmedDeleteAll(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const flashText =
    flash === 'saved'
      ? t.admin.programs.saved
      : flash === 'reset'
        ? t.admin.programs.resetDone
        : flash === 'deleted'
          ? t.admin.programs.deletedDone
          : flash === 'restored'
            ? t.admin.programs.restoredDone
            : null;

  return (
    <div className="space-y-6">
      {flashText && (
        <p
          role="status"
          className="inline-flex rounded-xl border border-volt/40 bg-volt/10 px-4 py-2.5 text-sm font-bold text-volt"
        >
          {flashText}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm font-semibold text-danger">
          {t.admin.programs.deleteError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">{t.admin.programs.count(fmtNumber(all.length))}</p>
        <div className="flex flex-wrap gap-2">
          {deletedCount && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              icon={<RotateCcw aria-hidden />}
              onClick={() => void run(() => restoreDeletedPrograms(), 'restored')}
            >
              {t.admin.programs.restore}
            </Button>
          )}
          {all.length > 0 && (
            <Button
              variant={armedDeleteAll ? 'primary' : 'outline'}
              size="sm"
              disabled={busy}
              className={armedDeleteAll ? '' : 'border-danger/40 text-danger hover:border-danger'}
              icon={<Trash2 aria-hidden />}
              onClick={() => {
                if (!armedDeleteAll) {
                  setArmedDeleteAll(true);
                  window.setTimeout(() => setArmedDeleteAll(false), 4000);
                  return;
                }
                void run(() => deleteAllPrograms(), 'deleted');
              }}
            >
              {armedDeleteAll ? t.admin.programs.confirmDeleteAll : t.admin.programs.deleteAll}
            </Button>
          )}
        </div>
      </div>
      {all.length === 0 ? (
        <EmptyState
          title={t.admin.programs.emptyTitle}
          text={t.admin.programs.emptyText}
          action={
            deletedCount ? (
              <Button
                variant="outline"
                disabled={busy}
                icon={<RotateCcw aria-hidden />}
                onClick={() => void run(() => restoreDeletedPrograms(), 'restored')}
              >
                {t.admin.programs.restore}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {all.map((program) => {
            const visible = isProgramVisible(program.id);
            const armed = armedDelete === program.id;
            return (
              <li key={program.id} className="flex gap-4 rounded-xl border border-edge bg-night-800 p-4 transition-colors hover:border-edge-strong">
                <img src={program.image} alt="" loading="lazy" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PlanBadge plan={program.plan} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{t.goals[program.goal]}</span>
                    {!visible && <Tag tone="light">{t.admin.programs.hiddenTag}</Tag>}
                  </div>
                  <p className="mt-1.5 truncate font-display text-xl uppercase">{loc(program.name)}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-volt text-volt" aria-hidden />
                      {fmtNumber(program.rating, { minimumFractionDigits: 1 })}
                    </span>
                    <span>{fmtNumber(enrolledCount(program.id))} · {t.common.weeks(program.durationWeeks)}</span>
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Link
                      to={`/programmes/${program.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt underline-offset-4 hover:underline"
                    >
                      {t.admin.programs.view}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditing(program)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:border-volt hover:text-volt"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      {t.admin.programs.edit}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!armed) {
                          setArmedDelete(program.id);
                          window.setTimeout(() => setArmedDelete((current) => (current === program.id ? null : current)), 4000);
                          return;
                        }
                        void run(() => deleteProgram(program.id), 'deleted');
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors disabled:opacity-60',
                        armed
                          ? 'border-danger bg-danger/15 text-danger'
                          : 'border-edge text-muted hover:border-danger/50 hover:text-danger',
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      {armed ? t.admin.programs.confirmDelete : t.admin.programs.delete}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && (
        <ProgramEditModal
          key={editing.id}
          program={editing}
          initialVisible={isProgramVisible(editing.id)}
          onClose={() => setEditing(null)}
          onSaved={(kind) => {
            setVersion((version) => version + 1);
            setFlash(kind);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}