import { useState, useMemo } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { fetchAdminMembers } from '../../services/adminApi';
import type { AdminMember, MemberStatus } from '../../services/adminApi';
import type { Tier } from '../../types';
import { getProgramById } from '../../data/programs';
import { Chip, PlanBadge, Tag } from '../../components/ui/Badge';
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
            className="h-11 w-full rounded-lg border border-edge bg-night-800 pl-4 pr-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
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
      {!loading && !error && <p className="text-sm font-semibold text-muted">{t.admin.members.count(fmtNumber(filtered.length))}</p>}
      {loading ? (
        <div className="space-y-3" role="status">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
      <ScrollTable className="rounded-xl border border-edge">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge bg-night-800 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
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
          <tbody className="divide-y divide-edge bg-night-900">
            {filtered.map((member) => (
              <tr
                key={member.id}
                className="cursor-pointer transition-colors hover:bg-night-800/60"
                onClick={() => setSelectedMember(member)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-volt/15 text-volt">
                        <UsersIcon className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-bold">{member.name}</p>
                      <p className="truncate text-xs text-muted">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <PlanBadge plan={member.tier === 'free' ? 'standard' : member.tier} />
                </td>
                <td className="px-5 py-4 text-ink/85">{t.goals[member.goal]}</td>
                <td className="px-5 py-4 text-ink/85">
                  {member.programId ? loc(getProgramById(member.programId)?.name ?? { fr: '—', en: '—' }) : '—'}
                </td>
                <td className="px-5 py-4 text-muted">{member.currentWeek}</td>
                <td className="px-5 py-4 text-muted">{member.weightGoal ? `${fmtNumber(member.weightGoal)} kg` : '—'}</td>
                <td className="px-5 py-4 text-muted">{fmtDate(member.joined)}</td>
                <td className="px-5 py-4">
                  <Tag tone={memberTone[member.status]}>{t.admin.memberStatus[member.status]}</Tag>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-muted">
                  {t.admin.members.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollTable>
      )}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

function MemberDetailModal({ member, onClose }: { member: AdminMember; onClose: () => void }) {
  const { t, loc, fmtDate, fmtNumber } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-edge bg-night-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {member.avatar ? (
              <img src={member.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-volt/15 text-volt">
                <UsersIcon className="h-7 w-7" aria-hidden />
              </span>
            )}
            <div>
              <h2 className="font-display text-2xl uppercase">{member.name}</h2>
              <p className="text-sm text-muted">{member.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-night-700 hover:text-ink"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Plan</p>
            <p className="mt-1 font-bold">{t.tiers[member.tier]}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Statut</p>
            <p className="mt-1 font-bold">{t.admin.memberStatus[member.status]}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Objectif</p>
            <p className="mt-1 font-bold">{t.goals[member.goal]}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Membre depuis</p>
            <p className="mt-1 font-bold">{fmtDate(member.joined)}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Programme</p>
            <p className="mt-1 font-bold">
              {member.programId ? loc(getProgramById(member.programId)?.name ?? { fr: '—', en: '—' }) : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Semaine actuelle</p>
            <p className="mt-1 font-bold">{member.currentWeek}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Objectif de poids</p>
            <p className="mt-1 font-bold">{member.weightGoal ? `${fmtNumber(member.weightGoal)} kg` : '—'}</p>
          </div>
          <div className="rounded-lg border border-edge bg-night-900 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Favoris</p>
            <p className="mt-1 font-bold">{member.favorites.length > 0 ? member.favorites.join(', ') : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}