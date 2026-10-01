import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Dumbbell,
  Lock,
  LogIn,
  Receipt,
  Salad,
  ShieldAlert,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { ADMIN_EMAIL, useAuth } from '../hooks/useAuth';
import { articles } from '../data/articles';
import { exercises } from '../data/exercises';
import { mealPlans } from '../data/nutrition';
import { recipes } from '../data/nutrition';
import { planPricing, programs } from '../data/programs';
import type { MemberStatus, OrderStatus } from '../data/admin';
import { adminMembers, adminOrders } from '../data/admin';
import { ADMIN_SECTIONS, AdminSidebar } from '../components/features/admin/AdminSidebar';
import type { AdminSection } from '../components/features/admin/AdminSidebar';
import { RevenueChart, SignupsChart, TierSplit } from '../components/features/admin/AdminCharts';
import { Chip, PlanBadge, Tag } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ScrollTable } from '../components/ui/ScrollTable';
import type { Tier } from '../types';

const VALID_SECTIONS = ADMIN_SECTIONS.map((item) => item.key);
const labelClass = 'text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted';

const memberTone: Record<MemberStatus, 'volt' | 'default' | 'light'> = {
  active: 'volt',
  trial: 'default',
  expired: 'light',
};

const orderTone: Record<OrderStatus, 'volt' | 'default' | 'light'> = {
  paid: 'volt',
  pending: 'default',
  failed: 'light',
};

export default function AdminPage() {
  const { section: rawSection } = useParams();
  const section: AdminSection = VALID_SECTIONS.includes(rawSection as AdminSection) ? (rawSection as AdminSection) : 'overview';
  const { t } = useLanguage();
  const { user } = useAuth();
  usePageTitle(t.admin.title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  if (!user) return <AdminGuestScreen />;
  if (user.role !== 'admin') return <AdminDeniedScreen />;
  return <AdminShell section={section} />;
}

/* ---------- Guest (not logged in) ---------- */
function AdminGuestScreen() {
  const { t } = useLanguage();
  const location = useLocation();
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge bg-night-800 p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-full border border-volt/40 bg-volt/10 text-volt">
          <Lock className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase">{t.admin.guestTitle}</h1>
        <p className="mt-3 text-muted">{t.admin.guestText}</p>
        <p className="mt-4 rounded-lg border border-edge bg-night-900 px-4 py-3 text-sm">
          <span className="text-muted">{t.admin.guestHint} </span>
          <span className="font-bold text-volt">{ADMIN_EMAIL}</span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/connexion" state={{ from: location.pathname }} icon={<LogIn />}>
            {t.admin.guestLogin}
          </ButtonLink>
        </div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.dashboard.guest.back}
        </Link>
      </div>
    </section>
  );
}

/* ---------- Signed in, but not an admin ---------- */
function AdminDeniedScreen() {
  const { t } = useLanguage();
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night-900 px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-10 pattern-grid fade-mask-radial" />
      <div className="w-full max-w-lg animate-fade-up rounded-2xl border border-edge bg-night-800 p-8 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-danger/40 bg-danger/10 text-danger">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase">{t.admin.deniedTitle}</h1>
        <p className="mt-3 text-muted">{t.admin.deniedText}</p>
        <p className="mt-4 rounded-lg border border-edge bg-night-900 px-4 py-3 text-sm">
          <span className="text-muted">{t.admin.guestHint} </span>
          <span className="font-bold text-volt">{ADMIN_EMAIL}</span>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink to="/dashboard" iconRight={<ArrowRight />}>
            {t.admin.deniedCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ---------- Shell ---------- */
function AdminShell({ section }: { section: AdminSection }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-night-900">
      <AdminSidebar active={section} />
      <div className="lg:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <p className={cn(labelClass, 'flex items-center gap-3')}>
            <span aria-hidden className="font-display text-base tracking-[-0.04em] text-volt">
              ///
            </span>
            {t.admin.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {t.admin.nav[section]}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">{t.admin.subtitle}</p>
          <div className="mt-8">
            {section === 'overview' && <OverviewView />}
            {section === 'members' && <MembersView />}
            {section === 'orders' && <OrdersView />}
            {section === 'programs' && <ProgramsView />}
            {section === 'content' && <ContentView />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- KPI card ---------- */
function KpiCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-edge bg-night-800 p-5">
      <div className="flex items-center justify-between">
        <p className={labelClass}>{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-volt/30 bg-volt/10 text-volt">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold text-muted">{sub}</p>
    </div>
  );
}

/* ---------- Overview ---------- */
function OverviewView() {
  const { t, fmtNumber, fmtPrice } = useLanguage();
  const activeMembers = adminMembers.filter((member) => member.status === 'active');
  const monthly = (tier: Tier) => (tier === 'free' ? 0 : (planPricing['muscle-gain'][tier]?.monthly ?? 0));
  const mrr = activeMembers.reduce((sum, member) => sum + monthly(member.tier), 0);
  const paidOrders = adminOrders.filter((order) => order.status === 'paid');
  const collected = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const avgRating = programs.reduce((sum, program) => sum + program.rating, 0) / programs.length;
  const latest = [...adminOrders].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} label={t.admin.kpi.members} value={fmtNumber(adminMembers.length)} sub={t.admin.kpi.membersSub(fmtNumber(activeMembers.length))} />
        <KpiCard icon={TrendingUp} label={t.admin.kpi.revenue} value={fmtPrice(mrr)} sub={t.admin.kpi.revenueSub} />
        <KpiCard icon={Receipt} label={t.admin.kpi.orders} value={fmtNumber(paidOrders.length)} sub={t.admin.kpi.ordersSub(fmtPrice(collected))} />
        <KpiCard
          icon={Star}
          label={t.admin.kpi.rating}
          value={fmtNumber(avgRating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          sub={t.admin.kpi.ratingSub(fmtNumber(programs.length))}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <TierSplit />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SignupsChart />
        </div>
        <article className="rounded-xl border border-edge bg-night-800 p-5 sm:p-6">
          <h2 className="font-display text-2xl uppercase">{t.admin.latestTitle}</h2>
          <ul className="mt-4 divide-y divide-edge">
            {latest.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-bold">{order.member}</p>
                  <p className="text-xs text-muted">{order.reference}</p>
                </div>
                <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

/* ---------- Members ---------- */
function MembersView() {
  const { t, fmtNumber, fmtDate } = useLanguage();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | Tier>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminMembers.filter((member) => {
      const matchesQuery = !q || member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
      const matchesTier = tier === 'all' || member.tier === tier;
      return matchesQuery && matchesTier;
    });
  }, [query, tier]);

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
      <p className="text-sm font-semibold text-muted">{t.admin.members.count(fmtNumber(filtered.length))}</p>
      <ScrollTable className="rounded-xl border border-edge">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge bg-night-800 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="px-5 py-4">{t.admin.members.table.name}</th>
              <th scope="col" className="px-5 py-4">{t.admin.members.table.plan}</th>
              <th scope="col" className="px-5 py-4">{t.admin.members.table.goal}</th>
              <th scope="col" className="px-5 py-4">{t.admin.members.table.sessions}</th>
              <th scope="col" className="px-5 py-4">{t.admin.members.table.joined}</th>
              <th scope="col" className="px-5 py-4">{t.admin.members.table.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge bg-night-900">
            {filtered.map((member) => (
              <tr key={member.id} className="transition-colors hover:bg-night-800/60">
                <td className="px-5 py-4">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-xs text-muted">{member.email}</p>
                </td>
                <td className="px-5 py-4">
                  <PlanBadge plan={member.tier === 'free' ? 'standard' : member.tier} />
                </td>
                <td className="px-5 py-4 text-ink/85">{t.goals[member.goal]}</td>
                <td className="px-5 py-4 font-bold">{fmtNumber(member.sessions)}</td>
                <td className="px-5 py-4 text-muted">{fmtDate(member.joined)}</td>
                <td className="px-5 py-4">
                  <Tag tone={memberTone[member.status]}>{t.admin.memberStatus[member.status]}</Tag>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted">
                  {t.admin.members.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollTable>
    </div>
  );
}

/* ---------- Orders ---------- */
function OrdersView() {
  const { t, fmtNumber, fmtPrice, fmtDate } = useLanguage();
  const [status, setStatus] = useState<'all' | OrderStatus>('all');

  const filtered = useMemo(
    () => adminOrders.filter((order) => status === 'all' || order.status === status),
    [status],
  );
  const total = filtered.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['all', 'paid', 'pending', 'failed'] as const).map((option) => (
          <Chip
            key={option}
            active={status === option}
            onClick={() => setStatus(option)}
            count={option === 'all' ? adminOrders.length : adminOrders.filter((order) => order.status === option).length}
          >
            {option === 'all' ? t.admin.orders.allStatuses : t.admin.orderStatus[option]}
          </Chip>
        ))}
      </div>
      <ScrollTable className="rounded-xl border border-edge">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-edge bg-night-800 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.ref}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.member}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.plan}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.amount}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.method}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.date}</th>
              <th scope="col" className="px-5 py-4">{t.admin.orders.table.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge bg-night-900">
            {filtered.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-night-800/60">
                <td className="px-5 py-4 font-mono text-xs font-bold text-volt">{order.reference}</td>
                <td className="px-5 py-4 font-bold">{order.member}</td>
                <td className="px-5 py-4">{t.tiers[order.plan]}</td>
                <td className="px-5 py-4 font-bold">{fmtPrice(order.amount)}</td>
                <td className="px-5 py-4 text-muted">{t.admin.methods[order.method]}</td>
                <td className="px-5 py-4 text-muted">{fmtDate(order.date)}</td>
                <td className="px-5 py-4">
                  <Tag tone={orderTone[order.status]}>{t.admin.orderStatus[order.status]}</Tag>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted">
                  {t.admin.orders.empty}
                </td>
              </tr>
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t border-edge bg-night-800 text-sm">
                <td colSpan={3} className="px-5 py-4 font-extrabold uppercase tracking-[0.12em] text-muted">
                  {t.admin.orders.total}
                </td>
                <td className="px-5 py-4 font-display text-xl text-volt">{fmtPrice(total)}</td>
                <td colSpan={3} className="px-5 py-4 text-right text-xs text-muted">
                  {t.admin.orders.count(fmtNumber(filtered.length))}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </ScrollTable>
    </div>
  );
}

/* ---------- Programs ---------- */
function ProgramsView() {
  const { t, loc, fmtNumber } = useLanguage();
  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-muted">{t.admin.programs.count(fmtNumber(programs.length))}</p>
      <ul className="grid gap-4 md:grid-cols-2">
        {programs.map((program) => (
          <li key={program.id} className="flex gap-4 rounded-xl border border-edge bg-night-800 p-4 transition-colors hover:border-edge-strong">
            <img src={program.image} alt="" loading="lazy" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <PlanBadge plan={program.plan} />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{t.goals[program.goal]}</span>
              </div>
              <p className="mt-1.5 truncate font-display text-xl uppercase">{loc(program.name)}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-volt text-volt" aria-hidden />
                  {fmtNumber(program.rating, { minimumFractionDigits: 1 })}
                </span>
                <span>{fmtNumber(program.enrolled)} · {t.common.weeks(program.durationWeeks)}</span>
              </p>
              <Link
                to={`/programmes/${program.id}`}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-volt underline-offset-4 hover:underline"
              >
                {t.admin.programs.view}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Content ---------- */
function ContentView() {
  const { t, fmtNumber } = useLanguage();
  const cards = [
    { icon: Dumbbell, label: t.admin.content.exercises, count: exercises.length, to: '/exercices' },
    { icon: Salad, label: t.admin.content.recipes, count: recipes.length + mealPlans.length, to: '/nutrition' },
    { icon: BookOpen, label: t.admin.content.articles, count: articles.length, to: '/conseils' },
    { icon: Dumbbell, label: t.admin.content.programs, count: programs.length, to: '/programmes' },
  ];
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-muted">{t.admin.content.subtitle}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, label, count, to }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-4 rounded-xl border border-edge bg-night-800 p-5 transition-colors hover:border-volt/50"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-volt/30 bg-volt/10 text-volt">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-3xl leading-none">{fmtNumber(count)}</span>
              <span className="mt-1 block text-sm font-semibold text-muted">{label}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-volt" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
