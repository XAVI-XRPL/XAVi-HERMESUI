'use client';

import { useStudioStore } from '@/stores';

// Live telemetry cards — "not yet wired" until provider streaming is connected.
// The store gives us profiles + sessions to display.

function StatCard({
  label,
  value,
  sub,
  accent = '#c9a76c',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="hx-glass rounded-2xl p-5 flex flex-col gap-1 min-w-[140px]"
      style={{ borderColor: 'rgba(255,255,255,.06)' }}
    >
      <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim">
        {label}
      </span>
      <span
        className="hx-serif text-4xl leading-none"
        style={{ color: accent }}
      >
        {value}
      </span>
      {sub && (
        <span className="hx-mono text-[9px] text-neutral-500 uppercase tracking-wider">
          {sub}
        </span>
      )}
    </div>
  );
}

export default function MissionControl() {
  const profiles = useStudioStore((s) => s.profiles);
  const sessions = useStudioStore((s) => s.sessions);

  const totalSessions = Object.keys(sessions).length;
  const activeProfiles = profiles.filter(
    (p) => p.status === 'connected' || p.status === 'working'
  ).length;

  return (
    <div className="px-10 pb-12 flex flex-col gap-8">
      {/* ── Stat row ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap hx-fade-up">
        <StatCard label="Fleet" value={profiles.length} sub="agents online" accent="#5DADE2" />
        <StatCard
          label="Sessions"
          value={totalSessions}
          sub={`across ${activeProfiles} active`}
          accent="#9B7BFF"
        />
        <StatCard
          label="Shared Surfaces"
          value={9}
          sub="mission → claw3d"
          accent="#c9a76c"
        />
        <StatCard label="Status" value="READY" sub="est · new york" accent="#7FE38E" />
      </div>

      {/* ── Profile fleet status cards ─────────────────────────────────────────── */}
      <div>
        <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-4">
          Fleet Status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="hx-glass rounded-xl p-4 flex items-start gap-4"
              style={{ borderColor: 'rgba(255,255,255,.06)' }}
            >
              {/* Orb */}
              <div
                className="w-9 h-9 hx-orb shrink-0 mt-0.5"
                style={{
                  '--accent': p.accent,
                  '--accent-rgb': p.accentRGB,
                } as React.CSSProperties}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[14px] font-medium text-neutral-100 truncate">{p.name}</span>
                  <StatusPill status={p.status} />
                </div>
                <div className="hx-mono text-[9.5px] uppercase tracking-wider text-neutral-500 mb-1">
                  {p.role}
                </div>
                <div
                  className="text-[10.5px] hx-mono truncate"
                  style={{ color: 'rgba(255,255,255,.35)' }}
                >
                  {p.connection.provider.replace(/-/g, ' ')} ·{' '}
                  {p.connection.modelId || 'no model'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent sessions ───────────────────────────────────────────────────── */}
      <div>
        <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-4">
          Recent Sessions
        </div>
        {totalSessions === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {Object.values(sessions)
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, 6)
              .map((s) => {
                const profile = profiles.find((p) => p.id === s.profileId);
                return (
                  <div
                    key={s.id}
                    className="hx-glass rounded-xl px-4 py-3 flex items-center gap-4"
                    style={{ borderColor: 'rgba(255,255,255,.06)' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: profile?.accent ?? '#c9a76c',
                        boxShadow: `0 0 6px ${profile?.accent ?? '#c9a76c'}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-neutral-200 truncate font-medium">
                        {s.title}
                      </div>
                      <div className="hx-mono text-[9.5px] uppercase tracking-wider text-neutral-500">
                        {profile?.name ?? 'unknown'} · {s.turns.length} turns
                      </div>
                    </div>
                    <span className="hx-mono text-[9px] hx-amber-dim shrink-0">
                      {relativeTime(s.updatedAt)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Not yet wired notice ─────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-5 py-4 hx-mono text-[10px] uppercase tracking-wider"
        style={{
          background: 'rgba(201,167,108,.06)',
          border: '1px solid rgba(201,167,108,.18)',
          color: '#8c7449',
        }}
      >
        Live telemetry · provider streaming not yet wired — sessions shown from localStorage only
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    connected: { label: 'Connected', color: '#7FE38E' },
    working:   { label: 'Working',   color: '#7FE38E' },
    idle:      { label: 'Idle',      color: '#9a9a92' },
    sleeping:  { label: 'Sleeping',  color: '#5a5a52' },
    error:     { label: 'Error',     color: '#FF6B6B' },
    unknown:   { label: 'Unknown',   color: '#5a5a52' },
  };
  const { label, color } = map[status] ?? map.unknown;
  return (
    <span
      className="hx-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5a5a52" strokeWidth={1.2}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <p className="hx-serif italic text-neutral-500 text-lg">
        No sessions yet
      </p>
      <p className="hx-mono text-[10px] uppercase tracking-wider text-neutral-600">
        Select a profile to begin
      </p>
    </div>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}