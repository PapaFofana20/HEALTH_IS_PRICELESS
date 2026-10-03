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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="admin-new-email" className="sr-only">Email administrateur</label>
        <input
          id="admin-new-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@exemple.com"
          className="h-11 flex-1 rounded-lg border border-edge bg-night-800 px-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
        />
        <Button onClick={add} disabled={busy}>Ajouter un admin</Button>
      </div>
      {message && <p className="text-sm text-muted">{message}</p>}
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ul className="divide-y divide-edge rounded-xl border border-edge">
          {(data ?? []).map((adminEmail) => (
            <li key={adminEmail} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="truncate text-sm font-semibold text-ink/90">{adminEmail}</span>
              <button
                type="button"
                onClick={() => remove(adminEmail)}
                disabled={busy}
                className="text-muted transition-colors hover:text-red-400 disabled:opacity-50"
                aria-label={`Retirer ${adminEmail}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
          {(data ?? []).length === 0 && <li className="px-5 py-4 text-sm text-muted">Aucun administrateur enregistré.</li>}
        </ul>
      )}
      <p className="text-xs text-muted/80">
        {t.admin.guestHint} {'admin@hip.app'} — la nouvelle whitelist est appliquée via la table <code>admin_emails</code> (RLS : seuls les admins y accèdent).
      </p>
    </div>
  );
}