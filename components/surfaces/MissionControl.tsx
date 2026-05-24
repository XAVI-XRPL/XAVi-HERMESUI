'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Mission Control — Dashboard landing surface
// Exact match to hermes-studio.html prototype
// ─────────────────────────────────────────────────────────────────────────────

import { useStudioStore } from '@/stores';
import { PROVIDERS } from '@/types';

// ── Status Dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const m: Record<string, { c: string; glow: boolean }> = {
    connected: { c: '#7FE38E', glow: true },
    working:   { c: '#7FE38E', glow: true },
    idle:      { c: '#9a9a92', glow: false },
    error:     { c: '#FF6B6B', glow: true },
    unknown:   { c: '#5a5a52', glow: false },
    sleeping:  { c: '#5a5a52', glow: false },
  };
  const s = m[status] || m.unknown;
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: s.c, boxShadow: s.glow ? `0 0 6px ${s.c}` : 'none' }}
    />
  );
}

// ── Pulse Row ────────────────────────────────────────────────────────────────

function PulseRow({ label, value, delta }: { label: string; value: string | number; delta: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="hx-mono text-[11px] uppercase tracking-wider text-neutral-500">{label}</span>
        <span className="hx-serif text-[26px] text-neutral-100 leading-none">{value}</span>
      </div>
      <div className="hx-mono text-[9px] hx-amber-dim uppercase tracking-wider mt-1 text-right">{delta}</div>
    </div>
  );
}

// ── Sub Label ────────────────────────────────────────────────────────────────

function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="hx-mono text-[9.5px] uppercase tracking-[0.2em] hx-amber-dim mb-3">{children}</div>;
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MissionControl() {
  const profiles = useStudioStore((s) => s.profiles);
  const sessions = useStudioStore((s) => s.sessions);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  const allTurns = Object.values(sessions).reduce((a, s) => a + s.turns.length, 0);

  return (
    <div className="px-10 grid grid-cols-12 gap-5">
      {/* ── Today Card ──────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 hx-fade-up">
        <div className="hx-glass-elevated rounded-3xl p-7">
          <SubLabel>Today</SubLabel>
          <div className="hx-serif text-[34px] leading-tight text-neutral-100 mt-1">
            Hand the studio to Hermes.{' '}
            <span className="italic hx-amber-dim">Let it finish itself.</span>
          </div>
          <div className="hx-mono text-[10px] uppercase tracking-[0.18em] hx-amber-dim mt-4">
            {allTurns} turns across {profiles.length} profiles · local-only
          </div>
        </div>
      </div>

      {/* ── Pulse Card ──────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-4 hx-fade-up">
        <div className="hx-glass-elevated rounded-3xl p-6 h-full">
          <SubLabel>Pulse</SubLabel>
          <div className="space-y-4 mt-3">
            <PulseRow
              label="Profiles"
              value={profiles.length}
              delta={`${profiles.filter((p) => p.status === 'connected').length} connected`}
            />
            <PulseRow
              label="Sessions"
              value={Object.keys(sessions).length}
              delta={`${allTurns} turns`}
            />
            <PulseRow
              label="Storage"
              value="local"
              delta="browser only · export to keep"
            />
          </div>
        </div>
      </div>

      {/* ── Fleet Grid ──────────────────────────────────────────── */}
      <div className="col-span-12 hx-fade-up">
        <SubLabel>Fleet</SubLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setModeAndNavigate('profile', p.id)}
              className="hx-glass rounded-2xl p-4 hover:bg-white/[0.03] transition text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 hx-orb hx-glow-on-hover"
                  style={{ '--accent': p.accent, '--accent-rgb': p.accentRGB } as React.CSSProperties}
                />
                <StatusDot status={p.status} />
              </div>
              <div className="hx-serif text-[20px] text-neutral-100 leading-none">{p.name}</div>
              <div className="hx-mono text-[9px] uppercase tracking-wider text-neutral-500 mt-1">
                {p.role}
              </div>
              <div className="hx-mono text-[10px] hx-amber-dim mt-3 truncate">
                {PROVIDERS[p.connection.provider]?.label || p.connection.provider}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t hx-hairline">
                <span className="hx-mono text-[9px] uppercase tracking-wider text-neutral-500">
                  {Object.values(sessions).filter((s) => s.profileId === p.id).length} threads
                </span>
                <span className="hx-mono text-[9px] uppercase tracking-wider" style={{ color: p.accent }}>
                  {p.connection.modelId?.split('-')[0] || '—'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
