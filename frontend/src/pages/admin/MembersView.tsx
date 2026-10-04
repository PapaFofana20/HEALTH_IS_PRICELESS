import { useState, useMemo } from 'react';
import { Trash2, Users as UsersIcon } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { deleteBackendMember, fetchAdminMembers } from '../../services/adminApi';
import type { AdminMember, MemberStatus } from '../../services/adminApi';
import type { Tier } from '../../types';
import { getProgramById } from '../../data/programs';
import { Chip, PlanBadge, Tag } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ScrollTable } from '../../components/ui/ScrollTable';
import { ErrorState, Skeleton } from '../../components/ui/States';

const memberTone: Record<MemberStatus, 'volt' | 'default' | 'light'> = {
  active: 'volt',
  trial: 'default',
  expired: 'light',
};

export function MembersView() {
  const { t, loc, fmtNumber, fmtDate } = useLanguage();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | Tier>('all');
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const { data, loading, error, refetch } = useAsync(fetchAdminMembers, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((member) => {
      const matchesQuery = !q || member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
      const matchesTier = tier === 'all' || member.tier === tier;
      return matchesQuery && matchesTier;
    });
  }, [data, query, tier]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="admin-member-search" className="sr-only">
              {t.admin.members.searchLabel}
            </label>
            <input
              id="admin-member-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.admin.members.searchPlaceholder}
              className="h-12 w-full rounded-xl border border-edge bg-night-900 pl-4 pr-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'premium', 'standard', 'free'] as const).map((option) => (
              <Chip key={option} active={tier === option} onClick={() => setTier(option)}>
                {option === 'all' ? t.admin.members.allTiers : t.tiers[option]}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      {!loading && !error && <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.members.count(fmtNumber(filtered.length))}</p>}
      {loading ? (
        <div className="space-y-3" role="status">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
      <>
        <div className="hidden md:block">
          <ScrollTable className="rounded-2xl border border-edge/70 bg-night-800/70">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-edge/70 bg-night-800/80 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.name}</th>
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.plan}</th>
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.goal}</th>
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.program}</th>
                  <th scope="col" className="px-5 py-4">Semaine</th>
                  <th scope="col" className="px-5 py-4">Obj. poids</th>
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.joined}</th>
                  <th scope="col" className="px-5 py-4">{t.admin.members.table.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60 bg-night-900/40">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="cursor-pointer transition-colors hover:bg-night-800/70"
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full border border-edge/60 object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-volt/15 text-volt ring-1 ring-volt/20">
                            <UsersIcon className="h-4 w-4" aria-hidden />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{member.name}</p>
                          <p className="truncate text-xs font-medium text-muted">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <PlanBadge plan={member.tier === 'free' ? 'standard' : member.tier} />
                    </td>
                    <td className="px-5 py-4 text-sm text-ink/85">{t.goals[member.goal]}</td>
                    <td className="px-5 py-4 text-sm text-ink/85">
                      {member.programId ? loc(getProgramById(member.programId)?.name ?? { fr: '—', en: '—' }) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-muted">{member.currentWeek}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-muted">{member.weightGoal ? `${fmtNumber(member.weightGoal)} kg` : '—'}</td>
                    <td className="px-5 py-4 text-sm text-muted">{fmtDate(member.joined)}</td>
                    <td className="px-5 py-4">
                      <Tag tone={memberTone[member.status]}>{t.admin.memberStatus[member.status]}</Tag>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm text-muted">
                      {t.admin.members.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollTable>
        </div>
        <div className="grid gap-3 md:hidden">
          {filtered.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedMember(member)}
              className="w-full rounded-2xl border border-edge/70 bg-night-800/70 p-4 text-left transition-colors active:bg-night-800"
            >
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img src={member.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full border border-edge/60 object-cover" />
                ) : (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-volt/15 text-volt ring-1 ring-volt/20">
                    <UsersIcon className="h-5 w-5" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{member.name}</p>
                  <p className="truncate text-xs font-medium text-muted">{member.email}</p>
                </div>
                <Tag tone={memberTone[member.status]}>{t.admin.memberStatus[member.status]}</Tag>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.members.table.plan}</dt>
                  <dd className="mt-1.5"><PlanBadge plan={member.tier === 'free' ? 'standard' : member.tier} /></dd>
                </div>
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.members.table.goal}</dt>
                  <dd className="mt-1 truncate font-semibold text-ink/85">{t.goals[member.goal]}</dd>
                </div>
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.members.table.program}</dt>
                  <dd className="mt-1 truncate font-semibold text-ink/85">{member.programId ? loc(getProgramById(member.programId)?.name ?? { fr: '—', en: '—' }) : '—'}</dd>
                </div>
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Semaine</dt>
                  <dd className="mt-1 font-semibold text-muted">{member.currentWeek}</dd>
                </div>
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Obj. poids</dt>
                  <dd className="mt-1 font-semibold text-muted">{member.weightGoal ? `${fmtNumber(member.weightGoal)} kg` : '—'}</dd>
                </div>
                <div className="rounded-xl border border-edge/60 bg-night-900/60 px-3 py-2.5">
                  <dt className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">{t.admin.members.table.joined}</dt>
                  <dd className="mt-1 font-semibold text-muted">{fmtDate(member.joined)}</dd>
                </div>
              </dl>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-edge/70 bg-night-800/70 px-5 py-12 text-center text-sm text-muted">
              {t.admin.members.empty}
            </p>
          )}
        </div>
      </>
      )}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onDeleted={() => {
            setSelectedMember(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function MemberDetailModal({ member, onClose, onDeleted }: { member: AdminMember; onClose: () => void; onDeleted: () => void }) {
  const { t, loc, fmtDate, fmtNumber } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const destroy = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBackendMember(member.id);
      setConfirmDelete(false);
      onDeleted();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Suppression impossible');
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night-900/80 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-edge/70 bg-night-800/95 p-5 shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {member.avatar ? (
              <img src={member.avatar} alt="" className="h-16 w-16 shrink-0 rounded-full border border-edge/60 object-cover" />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-volt/15 text-volt ring-1 ring-volt/20">
                <UsersIcon className="h-7 w-7" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl uppercase text-ink">{member.name}</h2>
              <p className="truncate text-sm text-muted">{member.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-edge/70 text-muted transition-colors hover:bg-night-700 hover:text-ink"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Plan</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{t.tiers[member.tier]}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Statut</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{t.admin.memberStatus[member.status]}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Objectif</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{t.goals[member.goal]}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Membre depuis</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{fmtDate(member.joined)}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Programme</p>
            <p className="mt-1.5 text-sm font-bold text-ink">
              {member.programId ? loc(getProgramById(member.programId)?.name ?? { fr: '—', en: '—' }) : '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Semaine actuelle</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{member.currentWeek}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Objectif de poids</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{member.weightGoal ? `${fmtNumber(member.weightGoal)} kg` : '—'}</p>
          </div>
          <div className="rounded-2xl border border-edge/70 bg-night-900/60 p-3.5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Favoris</p>
            <p className="mt-1.5 break-words text-sm font-bold text-ink">{member.favorites.length > 0 ? member.favorites.join(', ') : '—'}</p>
          </div>
        </div>
        {deleteError && (
          <p role="alert" className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-danger">
            {deleteError}
          </p>
        )}
        <Button
          variant="outline"
          fullWidth
          className="mt-4 border-danger/40 text-danger hover:border-danger hover:bg-danger/10 hover:text-danger"
          icon={<Trash2 />}
          onClick={() => setConfirmDelete(true)}
          disabled={deleting}
        >
          Supprimer ce compte
        </Button>
        <ConfirmDialog
          open={confirmDelete}
          title={`Supprimer ${member.name} ?`}
          text={`Le compte ${member.email} sera définitivement supprimé (profil et commandes inclus). Cette action est irréversible.`}
          onConfirm={destroy}
          onClose={() => {
            if (!deleting) setConfirmDelete(false);
          }}
        />
      </div>
    </div>
  );
}
