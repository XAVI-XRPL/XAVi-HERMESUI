'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Mission Control — Dashboard landing surface (ChatGPT-home style)
// Stat row at top + quick-access grid below
// ─────────────────────────────────────────────────────────────────────────────

import { useStudioStore } from '@/stores';

function StatCard({ label, value, accent = '#c9a76c', rgb = '201,167,108' }: {
  label: string; value: string | number; accent?: string; rgb?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      {/* Subtle accent glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: accent }}
      />
      <p className="hx-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: '#4a4a42' }}>
        {label}
      </p>
      <p
        className="hx-serif text-[38px] leading-none"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}

function QuickCard({ label, sub, icon, onClick }: {
  label: string; sub?: string; icon?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-all duration-150 hover:bg-white/[0.035] group"
      style={{
        background: 'rgba(255,255,255,.025)',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      {icon && (
        <div className="mb-3 text-neutral-500 group-hover:text-neutral-300 transition-colors">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-medium mb-1" style={{ color: '#d4d4cc' }}>{label}</p>
      {sub && (
        <p className="hx-mono text-[10.5px]" style={{ color: '#3a3a36' }}>{sub}</p>
      )}
    </button>
  );
}

export default function MissionControl() {
  const profiles = useStudioStore((s) => s.profiles);
  const sessions = useStudioStore((s) => s.sessions);

  const totalSessions   = Object.keys(sessions).length;
  const activeConnected = profiles.filter((p) => p.status === 'connected' || p.status === 'working').length;

  // Quick actions
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);
  const firstProfile       = profiles[0];
  const defaultProfile     = firstProfile?.id ?? null;

  return (
    <div className="px-10 pb-16">
      {/* ── Stat row (4 cards, like ChatGPT home stats) ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 hx-fade-up" style={{ animationDelay: '0ms' }}>
        <StatCard label="Profiles" value={profiles.length} accent="#c9a76c" rgb="201,167,108" />
        <StatCard label="Sessions" value={totalSessions}  accent="#5DADE2" rgb="93,173,226" />
        <StatCard label="Connected" value={`${activeConnected}/${profiles.length}`} accent="#7FE38E" rgb="127,227,142" />
        <StatCard
          label="Runtime"
          value={Math.floor((Date.now() - (Object.values(sessions)[0]?.createdAt ?? Date.now())) / 86400000) + 'd'}
          accent="#D96AB5" rgb="217,106,181"
        />
      </div>

      {/* ── Quick access grid ─────────────────────────────────────── */}
      <p className="hx-mono text-[10px] uppercase tracking-wider mb-3" style={{ color: '#3a3a36' }}>
        Jump in
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 hx-fade-up" style={{ animationDelay: '80ms' }}>

        {/* New chat */}
        <QuickCard
          label={firstProfile ? `Chat with ${firstProfile.name}` : 'Start a session'}
          sub={firstProfile?.connection.modelId || firstProfile?.connection.provider || 'No profile yet'}
          onClick={() => {
            if (defaultProfile) setModeAndNavigate('profile', defaultProfile);
          }}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    fill="currentColor" stroke="none" opacity=".6" />
            </svg>
          }
        />

        {/* Studio */}
        <QuickCard
          label="Studio · Substrate"
          sub={activeConnected > 0 ? `${activeConnected} provider${activeConnected > 1 ? 's' : ''} hot` : 'No providers'}
          onClick={() => setModeAndNavigate('shared', 'studio')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          }
        />

        {/* Kanban */}
        <QuickCard
          label="Kanban"
          sub="Task board"
          onClick={() => setModeAndNavigate('shared', 'kanban')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <rect x="3" y="3" width="7" height="18" rx="2" />
              <rect x="14" y="3" width="7" height="10" rx="2" />
            </svg>
          }
        />

        {/* Journal */}
        <QuickCard
          label="Journal"
          sub="Session log"
          onClick={() => setModeAndNavigate('shared', 'journal')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                    fill="currentColor" stroke="none" opacity=".6" />
            </svg>
          }
        />

        {/* Memory */}
        <QuickCard
          label="Memory"
          sub="Vector store"
          onClick={() => setModeAndNavigate('shared', 'memory')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          }
        />

        {/* Goals */}
        <QuickCard
          label="Goals"
          sub="Roadmap"
          onClick={() => setModeAndNavigate('shared', 'goals')}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth={1.6}>
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" opacity=".7" />
            </svg>
          }
        />

      </div>

      {/* ── Profile status grid (like ChatGPT's model selector row) ─── */}
      {profiles.length > 0 && (
        <>
          <p className="hx-mono text-[10px] uppercase tracking-wider mt-8 mb-3" style={{ color: '#3a3a36' }}>
            Fleet · {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setModeAndNavigate('profile', p.id, 'console')}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-white/[0.025]"
                style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${p.accent} 0%, ${p.accent}88)`,
                  }}
                />
                <div className="flex-1 text-left">
                  <span className="text-[13px] font-medium" style={{ color: '#d4d4cc' }}>{p.name}</span>
                  {p.role && (
                    <span className="hx-mono text-[10.5px] ml-2" style={{ color: '#3a3a36' }}>
                      · {p.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: p.status === 'connected' ? '#7FE38E' : '#3a3a36', boxShadow: p.status === 'connected' ? '0 0 6px #7FE38E' : 'none' }}
                  />
                  <span className="hx-mono text-[10.5px]" style={{ color: '#4a4a42' }}>
                    {p.connection.modelId || p.connection.provider}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}