import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Trash2, Pencil, Star, Ellipsis } from 'lucide-react';
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
          {t.admin.programs.deleteError}
        </p>
      )}
      <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.programs.count(fmtNumber(all.length))}</p>
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
            const menuOpen = openMenu === program.id;
            return (
              <li key={program.id} className="group flex gap-4 rounded-2xl border border-edge/70 bg-night-800/70 p-4 transition-colors hover:border-edge-strong sm:p-5">
                <img src={program.image} alt="" loading="lazy" className="h-28 w-28 shrink-0 rounded-xl border border-edge/60 object-cover sm:h-32 sm:w-32" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <PlanBadge plan={program.plan} />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">{t.goals[program.goal]}</span>
                      {!visible && <Tag tone="light">{t.admin.programs.hiddenTag}</Tag>}
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenu(menuOpen ? null : program.id)}
                        className="grid h-12 w-12 place-items-center rounded-xl border border-edge/70 text-muted transition-colors hover:border-edge-strong hover:text-ink"
                        aria-label="…"
                        aria-expanded={menuOpen}
                      >
                        <Ellipsis className="h-5 w-5" aria-hidden />
                      </button>
                      {menuOpen && (
                        <>
                          <button
                            type="button"
                            aria-label="Fermer le menu"
                            onClick={() => setOpenMenu(null)}
                            className="fixed inset-0 z-10 cursor-default bg-transparent"
                          />
                          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-edge/70 bg-night-900 p-1.5 shadow-2xl">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                if (!armed) {
                                  setArmedDelete(program.id);
                                  window.setTimeout(() => setArmedDelete((current) => (current === program.id ? null : current)), 4000);
                                  return;
                                }
                                setOpenMenu(null);
                                void run(() => deleteProgram(program.id), 'deleted');
                              }}
                              className={cn(
                                'flex min-h-12 w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors disabled:opacity-60',
                                armed
                                  ? 'bg-danger/15 text-danger'
                                  : 'text-muted hover:bg-night-800 hover:text-danger',
                              )}
                            >
                              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                              {armed ? t.admin.programs.confirmDelete : t.admin.programs.delete}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 truncate font-display text-xl uppercase text-ink">{loc(program.name)}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-night-900/60 px-2.5 py-1">
                      <Star className="h-3.5 w-3.5 fill-volt text-volt" aria-hidden />
                      {fmtNumber(program.rating, { minimumFractionDigits: 1 })}
                    </span>
                    <span>{fmtNumber(enrolledCount(program.id))} · {t.common.weeks(program.durationWeeks)}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-edge/60 pt-3">
                    <Link
                      to={`/programmes/${program.id}`}
                      className="inline-flex min-h-12 items-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt underline-offset-4 hover:underline"
                    >
                      {t.admin.programs.view}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditing(program)}
                      className="inline-flex min-h-12 items-center gap-1.5 rounded-xl bg-volt px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-night-900 transition-colors hover:bg-volt-light"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      {t.admin.programs.edit}
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
