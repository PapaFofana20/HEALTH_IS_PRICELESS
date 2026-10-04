import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { fetchAdminEmails, addAdminEmail, removeAdminEmail } from '../../services/adminApi';
import { refreshAdminEmails } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ErrorState, Skeleton } from '../../components/ui/States';

export function AdminsView() {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useAsync(fetchAdminEmails, []);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const add = async () => {
    const value = email.trim().toLowerCase();
    if (!value || !value.includes('@')) return;
    setBusy(true);
    setMessage(null);
    try {
      await addAdminEmail(value);
      await refreshAdminEmails();
      setEmail('');
      refetch();
      setMessage(`${value} ajouté comme administrateur.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (value: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await removeAdminEmail(value);
      await refreshAdminEmails();
      refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-2xl border border-edge/70 bg-night-800/70 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="admin-new-email" className="sr-only">Email administrateur</label>
          <input
            id="admin-new-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@exemple.com"
            className="h-12 flex-1 rounded-xl border border-edge bg-night-900/60 px-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
          />
          <Button onClick={add} disabled={busy}>Ajouter un admin</Button>
        </div>
        {message && <p className="mt-4 text-sm leading-relaxed text-muted">{message}</p>}
      </div>
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-edge/70 bg-night-800/40">
          {(data ?? []).map((adminEmail) => (
            <li key={adminEmail} className="flex min-h-[3.75rem] items-center justify-between gap-4 border-b border-edge/60 px-5 py-3 last:border-b-0 sm:px-6">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-ink/90">{adminEmail}</span>
              <button
                type="button"
                onClick={() => remove(adminEmail)}
                disabled={busy}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-transparent text-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                aria-label={`Retirer ${adminEmail}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
          {(data ?? []).length === 0 && <li className="px-5 py-5 text-sm font-semibold text-muted sm:px-6">Aucun administrateur enregistré.</li>}
        </ul>
      )}
      <p className="max-w-3xl text-xs leading-relaxed text-muted/80">
        {t.admin.guestHint} {'admin@hip.app'} — la nouvelle whitelist est appliquée via la table <code>admin_emails</code> (RLS : seuls les admins y accèdent).
      </p>
    </div>
  );
}