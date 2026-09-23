import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Command, Cpu, CreditCard, Grid2X2, Layers3,
  ListFilter, Menu, Mic2, MoreHorizontal, RefreshCw, Search, ShieldCheck, Signal,
  SlidersHorizontal, Sparkles, UsersRound, X, Zap,
} from 'lucide-react';
import {
  getGetRemoteConfigQueryKey, getGetUserQueryKey, getListUsersQueryKey,
  useGetActivityLog, useGetDashboardOverview, useGetRemoteConfig, useGetUsageAnalytics,
  useGetUser, useListUsers, useUpdateRemoteConfig, useUpdateUserSubscription,
} from '@workspace/api-client-react';
import type { SubscriptionUpdatePlan } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

const fmt = (n: number | undefined) => n === undefined ? '—' : new Intl.NumberFormat('en-US').format(n);
const shortDate = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
const timeAgo = (date: string) => {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
const initials = (name: string) => name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();

function Mark() {
  return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--background))] shadow-[0_0_22px_rgba(48,226,243,.22)]"><Sparkles size={16} strokeWidth={2.6} /></div>;
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [
    { href: '/', label: 'Overview', icon: Grid2X2 },
    { href: '/users', label: 'Users', icon: UsersRound },
    { href: '/activity', label: 'Activity', icon: Activity },
    { href: '/config', label: 'Remote config', icon: SlidersHorizontal },
  ];
  return <div className="noise min-h-[100dvh] bg-transparent">
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-4 py-5 transition-transform md:translate-x-0`}>
      <div className="mb-10 flex items-center gap-3 px-2"><Mark /><div><div className="display text-sm font-bold tracking-wide text-slate-100">MITU</div><div className="mono text-[9px] uppercase tracking-[.2em] text-slate-500">control room</div></div></div>
      <div className="mono mb-3 px-3 text-[9px] uppercase tracking-[.18em] text-slate-600">Operations</div>
      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => <Link data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${location === href ? 'bg-[hsl(var(--sidebar-accent))] text-slate-100' : 'text-slate-500 hover:bg-[hsl(var(--sidebar-accent))] hover:text-slate-200'}`}>
          <Icon size={17} className={location === href ? 'text-[hsl(var(--primary))]' : 'text-slate-600 group-hover:text-slate-400'} /><span>{label}</span>{location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_rgba(48,226,243,.8)]" />}
        </Link>)}
      </nav>
      <div className="mt-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
        <div className="mb-2 flex items-center gap-2"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="mono text-[10px] uppercase tracking-wider text-slate-500">System nominal</span></div>
        <div className="mono text-xs text-slate-300">v1.8.4 <span className="text-slate-600">/</span> prod-bd-01</div>
        <div className="mt-2 h-1 rounded-full bg-slate-800"><div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--primary))]" /></div>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close menu" data-testid="button-close-menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/50 md:hidden" />}
    <main className="min-h-[100dvh] md:pl-[250px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[hsl(var(--border))] bg-[rgba(19,18,30,.86)] px-5 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-3"><button data-testid="button-open-menu" onClick={() => setMobileOpen(true)} className="rounded-md p-1 text-slate-400 hover:bg-[hsl(var(--muted))] md:hidden"><Menu size={20} /></button><span className="mono hidden text-[10px] uppercase tracking-[.18em] text-slate-600 sm:block">MITU /</span><span className="display text-sm font-semibold text-slate-300">{location === '/' ? 'Overview' : location.slice(1).replace('-', ' ')}</span></div>
        <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-md border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs text-slate-500 sm:flex"><Command size={12} /> <span className="mono">⌘ K</span></div><button data-testid="button-notifications" className="relative rounded-md p-2 text-slate-500 transition hover:bg-[hsl(var(--muted))] hover:text-slate-200"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /></button><div className="h-7 w-px bg-[hsl(var(--border))]" /><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-bold text-slate-950">AR</div><span className="hidden text-xs font-medium text-slate-300 sm:block">Admin</span><ChevronDown size={13} className="text-slate-600" /></div></div>
      </header>
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">{children}</div>
    </main>
  </div>;
}

function PageTitle({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">{eyebrow}</div><h1 className="display text-3xl font-bold tracking-[-.04em] text-slate-100 sm:text-[38px]">{title}</h1><p className="mt-1 text-sm text-slate-500">{detail}</p></div>{action}</div>;
}

function Skeleton({ className = '' }: { className?: string }) { return <div className={`skeleton rounded-md ${className}`} />; }
function QueryState({ loading, error, onRetry, children, minHeight = 'min-h-[160px]' }: { loading?: boolean; error?: boolean; onRetry?: () => void; children: ReactNode; minHeight?: string }) {
  if (loading) return <div className={`${minHeight} space-y-3 p-5`}><Skeleton className="h-4 w-1/3" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>;
  if (error) return <div className={`${minHeight} flex flex-col items-center justify-center gap-2 p-5 text-center`}><AlertTriangle size={20} className="text-amber-300" /><div className="text-sm text-slate-400">Signal unavailable</div><button data-testid="button-retry" onClick={onRetry} className="text-xs text-[hsl(var(--primary))] hover:underline">Retry connection</button></div>;
  return <>{children}</>;
}

function StatCard({ label, value, note, icon: Icon, tone = 'cyan', trend }: { label: string; value: string; note: string; icon: typeof UsersRound; tone?: 'cyan' | 'violet' | 'pink' | 'amber'; trend?: 'up' | 'down' }) {
  const colors = { cyan: 'text-cyan-300 bg-cyan-400/10', violet: 'text-violet-300 bg-violet-400/10', pink: 'text-fuchsia-300 bg-fuchsia-400/10', amber: 'text-amber-300 bg-amber-400/10' };
  return <div className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-slate-600">
    <div className="mb-5 flex items-start justify-between"><span className="mono text-[10px] uppercase tracking-[.12em] text-slate-500">{label}</span><div className={`rounded-md p-2 ${colors[tone]}`}><Icon size={15} /></div></div>
    <div className="display text-2xl font-bold tracking-tight text-slate-100">{value}</div><div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">{trend && (trend === 'up' ? <ArrowUpRight size={13} className="text-emerald-400" /> : <ArrowDownRight size={13} className="text-rose-400" />)}<span>{note}</span></div>
  </div>;
}

function MiniBars({ points }: { points: { date: string; voiceActions: number; translations: number; gestureSessions: number }[] }) {
  const max = Math.max(...points.map((x) => x.voiceActions + x.translations + x.gestureSessions), 1);
  return <div className="flex h-[190px] items-end gap-1.5 sm:gap-2">{points.map((point, i) => { const total = point.voiceActions + point.translations + point.gestureSessions; return <div key={point.date + i} className="group flex h-full flex-1 flex-col justify-end gap-2"><div className="relative flex min-h-1 flex-1 items-end"><div title={`${total} events`} className="w-full rounded-t-[3px] bg-gradient-to-t from-violet-500/65 to-cyan-300/90 transition-all duration-500 group-hover:from-violet-400 group-hover:to-cyan-200" style={{ height: `${Math.max(5, total / max * 100)}%` }} /></div><span className="mono truncate text-center text-[9px] text-slate-600">{shortDate(point.date)}</span></div>; })}</div>;
}

function Overview() {
  const overview = useGetDashboardOverview();
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const usage = useGetUsageAnalytics({ range });
  const activity = useGetActivityLog({ limit: 6 });
  const data = overview.data;
  const points = usage.data?.points ?? [];
  return <div className="fade-up">
    <PageTitle eyebrow="Live operations / 01" title="Good morning, Arif." detail="Here’s the current pulse of the Mitu assistant network." action={<button data-testid="button-refresh-overview" onClick={() => { overview.refetch(); usage.refetch(); activity.refetch(); }} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-100"><RefreshCw size={14} className={overview.isFetching ? 'animate-spin' : ''} /> Refresh feed</button>} />
    <QueryState loading={overview.isLoading} error={overview.isError} onRetry={() => overview.refetch()} minHeight="min-h-0"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total users" value={fmt(data?.totalUsers)} note="registered accounts" icon={UsersRound} tone="cyan" trend="up" />
      <StatCard label="Pro subscribers" value={fmt(data?.proUsers)} note={`${data && data.totalUsers ? Math.round(data.proUsers / data.totalUsers * 100) : 0}% of total base`} icon={CreditCard} tone="violet" trend="up" />
      <StatCard label="Voice requests" value={fmt(data?.activeVoiceRequests)} note="active right now" icon={Mic2} tone="pink" />
      <StatCard label="Actions today" value={fmt(data?.actionsToday)} note={data ? `uptime ${Math.floor(data.uptimeSeconds / 3600)}h ${Math.floor(data.uptimeSeconds / 60) % 60}m` : 'awaiting telemetry'} icon={Zap} tone="amber" trend="up" />
    </div></QueryState>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Usage telemetry</div><h2 className="display mt-1 text-lg font-semibold text-slate-100">Assistant actions</h2></div><div className="flex rounded-md border border-[hsl(var(--border))] p-0.5">{(['7d', '30d', '90d'] as const).map((r) => <button data-testid={`button-range-${r}`} key={r} onClick={() => setRange(r)} className={`rounded px-2.5 py-1 text-[10px] font-semibold ${range === r ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>{r}</button>)}</div></div>
        <QueryState loading={usage.isLoading} error={usage.isError} onRetry={() => usage.refetch()}>{points.length ? <><div className="chart-grid rounded-lg border border-[hsl(var(--border))] p-3"><MiniBars points={points} /></div><div className="mt-4 flex flex-wrap gap-4 text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-cyan-300" />Voice actions</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-violet-400" />Translations</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-sm bg-fuchsia-400" />Gesture sessions</span></div></> : <div className="flex min-h-[190px] items-center justify-center text-sm text-slate-600">No telemetry in this range.</div>}</QueryState>
      </section>
      <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-5 flex items-start justify-between"><div><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Network status</div><h2 className="display mt-1 text-lg font-semibold text-slate-100">API health</h2></div><Signal size={17} className="text-[hsl(var(--primary))]" /></div><div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[.045] p-4"><div className="flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-emerald-400" /><span className="mono text-xs uppercase tracking-widest text-emerald-300">{data?.apiHealth ?? 'checking'}</span></div><div className="mt-3 display text-3xl font-bold text-slate-100">{data ? `${Math.floor(data.uptimeSeconds / 86400)}d ${Math.floor(data.uptimeSeconds / 3600) % 24}h` : '—'}</div><div className="mt-1 text-xs text-slate-500">service uptime · production cluster</div></div><div className="mt-5 space-y-3">{[['Voice gateway', '99.98%', 'good'], ['Translation provider', '99.94%', 'good'], ['Gesture relay', '99.71%', 'watch']].map(([name, val, status]) => <div className="flex items-center justify-between text-xs" key={name}><span className="text-slate-400">{name}</span><span className="mono flex items-center gap-2 text-slate-300">{val}<span className={`h-1.5 w-1.5 rounded-full ${status === 'good' ? 'bg-emerald-400' : 'bg-amber-300'}`} /></span></div>)}</div></section>
    </div>
    <section className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4"><div><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Event stream</div><h2 className="display mt-1 text-lg font-semibold text-slate-100">Recent activity</h2></div><Link data-testid="link-view-activity" href="/activity" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline">View all</Link></div><QueryState loading={activity.isLoading} error={activity.isError} onRetry={() => activity.refetch()} minHeight="min-h-0"><div className="divide-y divide-[hsl(var(--border))]">{(activity.data ?? []).length ? activity.data?.map((event) => <EventRow key={event.id} event={event} />) : <div className="p-8 text-center text-sm text-slate-600">The event stream is quiet.</div>}</div></QueryState></section>
  </div>;
}

function EventRow({ event }: { event: { id: string; type: string; title: string; description: string; userName?: string | null; createdAt: string } }) {
  const icons: Record<string, typeof Mic2> = { voice: Mic2, translation: Layers3, gesture: Activity, subscription: CreditCard, system: Cpu };
  const Icon = icons[event.type] ?? Cpu;
  return <div data-testid={`row-event-${event.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[.015]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-slate-400"><Icon size={14} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-300">{event.title}</div><div className="truncate text-[11px] text-slate-600">{event.description}{event.userName ? ` · ${event.userName}` : ''}</div></div><span className="mono shrink-0 text-[10px] text-slate-600">{timeAgo(event.createdAt)}</span></div>;
}

function UsersPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<'all' | 'free' | 'pro'>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const params = useMemo(() => ({ query: query || undefined, plan: plan === 'all' ? undefined : plan, page, pageSize: 8 }), [query, plan, page]);
  const users = useListUsers(params);
  const detail = useGetUser(selected ?? '', { query: { enabled: !!selected, queryKey: getGetUserQueryKey(selected ?? '') } });
  const mutation = useUpdateUserSubscription();
  const list = users.data;
  const maxPage = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;
  const changePlan = (id: string, next: SubscriptionUpdatePlan) => mutation.mutate({ id, data: { plan: next } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListUsersQueryKey(params) }); if (selected) qc.invalidateQueries({ queryKey: getGetUserQueryKey(selected) }); } });
  return <div className="fade-up"><PageTitle eyebrow="People / 02" title="Users" detail="Search accounts, inspect usage, and manage access tiers." action={<div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{fmt(list?.total)} accounts indexed</div>} />
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" /><input data-testid="input-user-search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search name or email..." className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-[hsl(var(--primary))]" /></div><div className="flex items-center gap-2"><ListFilter size={15} className="text-slate-600" /><select data-testid="select-user-plan" value={plan} onChange={(e) => { setPlan(e.target.value as typeof plan); setPage(1); }} className="h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs text-slate-300 outline-none"><option value="all">All plans</option><option value="free">Free</option><option value="pro">Pro</option></select></div></div>
    <section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="thin-scroll overflow-x-auto"><div className="min-w-[760px]"><div className="grid grid-cols-[1.8fr_1.2fr_.8fr_1.2fr_1.1fr_40px] gap-3 border-b border-[hsl(var(--border))] px-5 py-3 mono text-[9px] uppercase tracking-wider text-slate-600"><span>Account</span><span>Plan</span><span>Today</span><span>Last active</span><span>Joined</span><span /></div><QueryState loading={users.isLoading} error={users.isError} onRetry={() => users.refetch()} minHeight="min-h-[300px]"><div className="divide-y divide-[hsl(var(--border))]">{list?.items.length ? list.items.map((user) => <div data-testid={`row-user-${user.id}`} key={user.id} onClick={() => setSelected(user.id)} className="grid cursor-pointer grid-cols-[1.8fr_1.2fr_.8fr_1.2fr_1.1fr_40px] items-center gap-3 px-5 py-3.5 transition hover:bg-white/[.025]"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/60 to-cyan-400/60 text-[10px] font-bold text-slate-100">{user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : initials(user.name)}</div><div className="min-w-0"><div className="truncate text-xs font-semibold text-slate-200">{user.name}</div><div className="truncate text-[11px] text-slate-600">{user.email}</div></div></div><div><span className={`rounded border px-2 py-1 mono text-[9px] uppercase tracking-wider ${user.plan === 'pro' ? 'border-violet-400/30 bg-violet-400/10 text-violet-300' : 'border-slate-700 bg-slate-800/40 text-slate-500'}`}>{user.plan}</span></div><div className="mono text-xs text-slate-400">{user.actionsToday}<span className="text-slate-700">/{user.actionLimit}</span></div><div className="text-xs text-slate-500">{timeAgo(user.lastActiveAt)}</div><div className="text-xs text-slate-600">{shortDate(user.createdAt)}</div><MoreHorizontal size={16} className="text-slate-600" /></div>) : <div className="p-14 text-center"><UsersRound size={24} className="mx-auto mb-3 text-slate-700" /><div className="text-sm text-slate-500">No users match those filters.</div><div className="mt-1 text-xs text-slate-700">Try a different name, email, or plan.</div></div>}</div></QueryState></div></div><div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-5 py-3"><span className="mono text-[10px] text-slate-600">{list ? `${(list.page - 1) * list.pageSize + 1}–${Math.min(list.page * list.pageSize, list.total)} of ${list.total}` : '—'}</span><div className="flex gap-1"><button data-testid="button-users-previous" disabled={page <= 1} onClick={() => setPage((x) => x - 1)} className="rounded border border-[hsl(var(--border))] p-1.5 text-slate-500 disabled:opacity-30 hover:text-slate-200"><ChevronLeft size={14} /></button><button data-testid="button-users-next" disabled={page >= maxPage} onClick={() => setPage((x) => x + 1)} className="rounded border border-[hsl(var(--border))] p-1.5 text-slate-500 disabled:opacity-30 hover:text-slate-200"><ChevronRight size={14} /></button></div></div></section>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setSelected(null)}><div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-[390px] overflow-y-auto border-l border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] p-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><div className="mono text-[10px] uppercase tracking-[.18em] text-slate-500">Account detail</div><button data-testid="button-close-user-detail" onClick={() => setSelected(null)} className="rounded-md p-1.5 text-slate-500 hover:bg-[hsl(var(--muted))] hover:text-slate-200"><X size={17} /></button></div><QueryState loading={detail.isLoading} error={detail.isError} onRetry={() => detail.refetch()}>{detail.data && <><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-slate-950">{initials(detail.data.name)}</div><div><h2 className="display text-xl font-bold text-slate-100">{detail.data.name}</h2><p className="text-xs text-slate-500">{detail.data.email}</p></div></div><div className="mt-7 grid grid-cols-2 gap-2">{[['Plan', detail.data.plan], ['Role', detail.data.role], ['Actions today', `${detail.data.actionsToday}/${detail.data.actionLimit}`], ['Joined', shortDate(detail.data.createdAt)]].map(([label, value]) => <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3" key={label}><div className="mono text-[9px] uppercase tracking-wider text-slate-600">{label}</div><div className="mt-1 text-sm font-semibold text-slate-300">{value}</div></div>)}</div><div className="mt-8"><div className="mb-3 text-xs font-semibold text-slate-300">Change subscription</div><div className="flex gap-2"><button data-testid="button-set-free" disabled={mutation.isPending || detail.data.plan === 'free'} onClick={() => changePlan(detail.data!.id, 'free')} className="flex-1 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs text-slate-400 hover:bg-[hsl(var(--muted))] disabled:opacity-40">Free</button><button data-testid="button-set-pro" disabled={mutation.isPending || detail.data.plan === 'pro'} onClick={() => changePlan(detail.data!.id, 'pro')} className="flex-1 rounded-lg bg-violet-400/15 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-400/25 disabled:opacity-40">{mutation.isPending ? 'Saving…' : 'Pro'}</button></div></div></>}</QueryState></div></div>}
  </div>;
}

function ActivityPage() {
  const [limit, setLimit] = useState(20);
  const activity = useGetActivityLog({ limit });
  const eventTypes: Array<[string, any, string]> = [['voice', Mic2, 'cyan'], ['translation', Layers3, 'violet'], ['gesture', Activity, 'pink'], ['subscription', CreditCard, 'amber'], ['system', Cpu, 'slate']];
  // The generated icon tuple is intentionally rendered as a component below.
  // @ts-expect-error lucide's heterogeneous tuple inference is overly narrow here.
  return <div className="fade-up"><PageTitle eyebrow="Event stream / 03" title="Activity" detail="A searchable pulse of actions moving through the assistant." action={<button data-testid="button-refresh-activity" onClick={() => activity.refetch()} className="rounded-lg border border-[hsl(var(--border))] p-2.5 text-slate-500 hover:text-slate-100"><RefreshCw size={15} className={activity.isFetching ? 'animate-spin' : ''} /></button>} /><div className="grid gap-5 xl:grid-cols-[1fr_280px]"><section className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4"><div className="flex items-center gap-2"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" /><span className="mono text-[10px] uppercase tracking-wider text-slate-500">Live feed</span></div><select data-testid="select-activity-limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="rounded border border-[hsl(var(--border))] bg-transparent px-2 py-1 text-[10px] text-slate-500 outline-none"><option value={10}>10 events</option><option value={20}>20 events</option><option value={50}>50 events</option></select></div><QueryState loading={activity.isLoading} error={activity.isError} onRetry={() => activity.refetch()} minHeight="min-h-[400px]"><div className="divide-y divide-[hsl(var(--border))]">{activity.data?.length ? activity.data.map((event) => <EventRow key={event.id} event={event} />) : <div className="p-16 text-center text-sm text-slate-600">No activity recorded yet.</div>}</div></QueryState></section><aside className="h-fit rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Event types</div><div className="mt-5 space-y-3">{[['voice', Mic2, 'cyan'], ['translation', Layers3, 'violet'], ['gesture', Activity, 'pink'], ['subscription', CreditCard, 'amber'], ['system', Cpu, 'slate']].map(([name, Icon, tone]) => <div className="flex items-center justify-between" key={name as string}><div className="flex items-center gap-2 text-xs text-slate-400"><span className={`rounded p-1.5 bg-${tone}-400/10 text-${tone}-300`}><Icon size={13} /></span>{name}</div><span className="mono text-[10px] text-slate-600">—</span></div>)}</div><div className="mt-8 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3"><CircleHelp size={15} className="mb-2 text-slate-500" /><p className="text-[11px] leading-relaxed text-slate-500">Events are retained for 30 days. Times are shown in your local timezone.</p></div></aside></div></div>;
}

function ConfigPage() {
  const qc = useQueryClient();
  const config = useGetRemoteConfig();
  const mutation = useUpdateRemoteConfig();
  const [draft, setDraft] = useState<Record<string, number | boolean> | null>(null);
  const values = (draft ?? config.data) as Record<string, number | boolean> | undefined;
  const setValue = (key: string, value: number | boolean) => setDraft((prev) => ({ ...(prev ?? config.data), [key]: value }));
  const save = () => { if (!values) return; mutation.mutate({ data: values }, { onSuccess: (next) => { setDraft(null); qc.setQueryData(getGetRemoteConfigQueryKey(), next); } }); };
  return <div className="fade-up"><PageTitle eyebrow="Control plane / 04" title="Remote config" detail="Tune the product without shipping a new build." action={<button data-testid="button-save-config" disabled={!draft || mutation.isPending} onClick={save} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--background))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"><Check size={14} />{mutation.isPending ? 'Publishing…' : 'Publish changes'}</button>} /><QueryState loading={config.isLoading} error={config.isError} onRetry={() => config.refetch()} minHeight="min-h-[420px]">{values && <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]"><section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-6"><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Usage policy</div><h2 className="display mt-1 text-lg font-semibold text-slate-100">Free tier limits</h2><p className="mt-1 text-xs text-slate-500">Applied immediately to free accounts.</p></div><div className="space-y-5"><LimitInput label="Daily actions" detail="Maximum assistant actions per day" value={values.freeDailyActionLimit as number} max={1000} onChange={(v) => setValue('freeDailyActionLimit', v)} testId="input-daily-limit" /><LimitInput label="Lock screen actions" detail="Daily lock screen allowance" value={values.freeLockScreenLimit as number} max={100} onChange={(v) => setValue('freeLockScreenLimit', v)} testId="input-lockscreen-limit" /></div></section><section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="mb-6"><div className="mono text-[10px] uppercase tracking-[.15em] text-slate-500">Capability flags</div><h2 className="display mt-1 text-lg font-semibold text-slate-100">Feature toggles</h2><p className="mt-1 text-xs text-slate-500">Control availability across the mobile clients.</p></div><div className="divide-y divide-[hsl(var(--border))]">{[['gesturesEnabled', 'Gesture controls', 'Hands-free gesture sessions'], ['translationEnabled', 'Translation', 'Translate between supported languages'], ['autoSendEnabled', 'Auto-send', 'Send recognized text automatically']].map(([key, label, detail]) => <ToggleRow key={key as string} label={label as string} detail={detail as string} value={Boolean(values[key as string])} onChange={(v) => setValue(key as string, v)} testId={`toggle-${key}`} />)}</div></section></div>}</QueryState><div className="mt-5 flex items-center gap-2 text-[11px] text-slate-600"><ShieldCheck size={14} /> Changes are versioned and can be rolled back by the platform team.</div></div>;
}

function LimitInput({ label, detail, value, max, onChange, testId }: { label: string; detail: string; value: number; max: number; onChange: (n: number) => void; testId: string }) {
  return <label className="block"><div className="mb-2 flex justify-between"><span className="text-sm font-semibold text-slate-300">{label}</span><span className="mono text-[10px] text-slate-600">0–{max}</span></div><div className="flex items-center gap-3"><input data-testid={testId} type="number" min={0} max={max} value={value} onChange={(e) => onChange(Math.min(max, Math.max(0, Number(e.target.value))))} className="h-10 w-28 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 mono text-sm text-slate-200 outline-none focus:border-[hsl(var(--primary))]" /><span className="text-xs text-slate-600">{detail}</span></div></label>;
}
function ToggleRow({ label, detail, value, onChange, testId }: { label: string; detail: string; value: boolean; onChange: (v: boolean) => void; testId: string }) {
  return <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><div className="text-sm font-semibold text-slate-300">{label}</div><div className="mt-1 text-[11px] text-slate-600">{detail}</div></div><button data-testid={testId} role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${value ? 'border-cyan-300/50 bg-cyan-400/25' : 'border-slate-700 bg-slate-800'}`}><span className={`absolute top-1 h-4 w-4 rounded-full transition-transform ${value ? 'translate-x-6 bg-cyan-200' : 'translate-x-1 bg-slate-500'}`} /></button></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={Overview} /><Route path="/users" component={UsersPage} /><Route path="/config" component={ConfigPage} /><Route path="/activity" component={ActivityPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;