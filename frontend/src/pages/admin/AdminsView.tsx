import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAsync } from '../../hooks/useAsync';
import { fetchAdminEmails, createBackendAdmin, removeAdminEmail } from '../../services/adminApi';
import { refreshAdminEmails, isValidEmail } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ErrorState, Skeleton } from '../../components/ui/States';

export function AdminsView() {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useAsync(fetchAdminEmails, []);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const create = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail) || !firstName.trim()) {
      setMessage('Prénom et email valide requis.');
      return;
    }
    if (password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await createBackendAdmin({ email: cleanEmail, password, firstName: firstName.trim() });
      await refreshAdminEmails();
      setFirstName('');
      setEmail('');
      setPassword('');
      refetch();
      setMessage(
        result.promoted
          ? `${result.email ?? cleanEmail} avait déjà un compte : ajouté comme administrateur.`
          : `${cleanEmail} créé comme administrateur (mot de passe défini, compte actif).`,
      );
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
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted">Créer un administrateur</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-new-firstname" className="sr-only">Prénom</label>
            <input
              id="admin-new-firstname"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Prénom"
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-edge bg-night-900/60 px-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="admin-new-email" className="sr-only">Email administrateur</label>
            <input
              id="admin-new-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@exemple.com"
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-edge bg-night-900/60 px-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="admin-new-password" className="sr-only">Mot de passe</label>
            <input
              id="admin-new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe (8 caractères minimum)"
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-edge bg-night-900/60 px-4 text-sm font-semibold text-ink placeholder:text-muted/60 focus:border-volt focus:outline-none"
            />
          </div>
        </div>
        <Button onClick={create} disabled={busy} className="mt-4">
          Créer l’administrateur
        </Button>
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