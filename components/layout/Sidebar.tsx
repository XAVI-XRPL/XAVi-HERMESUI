'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Premium glassmorphic left panel
// - Wide panel (280px) with FLEET / SHARED / WIRED sections
// - Glowing colored orbs for profiles
// - Roman numerals for shared surfaces
// - Active state: blue glass border box
// ─────────────────────────────────────────────────────────────────────────────

import { useStudioStore } from '@/stores';
import type { SharedSurfaceId } from '@/types';
import { SHARED_SURFACES } from '@/types';

// ── Glowing Orb ──────────────────────────────────────────────────────────────

function GlowingOrb({ color, rgb, size = 14 }: { color: string; rgb: string; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full hx-breathe"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 30%), radial-gradient(circle at 50% 50%, ${color} 0%, ${color}88 60%, ${color}33 100%)`,
        boxShadow: `0 0 ${size}px rgba(${rgb},.5), 0 0 ${size * 2}px rgba(${rgb},.25), inset 0 -1px 2px rgba(0,0,0,.3)`,
      }}
    />
  );
}

// ── Shared Surface Icons ─────────────────────────────────────────────────────

function IconMission({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
               fill="currentColor" stroke="none" opacity=".85" />
    </svg>
  );
}

function IconMemory({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconKanban({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 7v10M16 7v5" />
    </svg>
  );
}

function IconJournal({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
            fill="currentColor" stroke="none" opacity=".8" />
    </svg>
  );
}

function IconGoals({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" opacity=".7" />
    </svg>
  );
}

function IconStudio({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconSkills({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4L15 12l-3-3z"
            fill="currentColor" stroke="none" opacity=".8" />
    </svg>
  );
}

function IconSettings({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 16 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 16.68a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 9 6.32a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 16.68 9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 21 12a1.65 1.65 0 0 0 1.51 1H23a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            fill="currentColor" stroke="none" opacity=".6" />
    </svg>
  );
}

const SURFACE_ICONS: Record<string, React.ReactNode> = {
  mission: <IconMission size={14} />,
  memory:  <IconMemory size={14} />,
  kanban:  <IconKanban size={14} />,
  journal: <IconJournal size={14} />,
  goals:   <IconGoals size={14} />,
  studio:  <IconStudio size={14} />,
  skills:  <IconSkills size={14} />,
  settings:<IconSettings size={14} />,
  claw3d:  null,
};

// Shared surfaces shown in sidebar (matching mockup: Mission, Memory, Kanban, Journal)
const SIDEBAR_SHARED: Array<{ id: SharedSurfaceId; label: string; numeral: string }> = [
  { id: 'mission',  label: 'MISSION CONTROL', numeral: 'I'   },
  { id: 'memory',   label: 'MEMORY',          numeral: 'V'   },
  { id: 'kanban',   label: 'KANBAN',          numeral: 'VI'  },
  { id: 'journal',  label: 'JOURNAL',         numeral: 'VII' },
];

// ── Main component ───────────────────────────────────────────────────────────

interface SidebarProps {
  time: string;
  day: string;
  onForgeProfile: () => void;
}

export default function Sidebar({ time, day, onForgeProfile }: SidebarProps) {
  const profiles         = useStudioStore((s) => s.profiles);
  const settings         = useStudioStore((s) => s.settings);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  const { mode, activeProfileId, activeShared } = settings;

  function sharedNavItem(item: typeof SIDEBAR_SHARED[0]) {
    const isActive = mode === 'shared' && activeShared === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setModeAndNavigate('shared', item.id)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative"
        style={{
          background: isActive
            ? 'linear-gradient(180deg, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 100%)'
            : 'transparent',
          border: isActive ? '1px solid rgba(59,130,246,.35)' : '1px solid transparent',
        }}
      >
        <span
          className="shrink-0 transition-colors"
          style={{ color: isActive ? '#60a5fa' : '#5a5a52' }}
        >
          {SURFACE_ICONS[item.id]}
        </span>
        <span
          className="flex-1 text-[11px] font-medium tracking-wider truncate transition-colors"
          style={{
            color: isActive ? '#e8e8e3' : '#7a7a72',
            fontFamily: "'Inter Tight', sans-serif",
          }}
        >
          {item.label}
        </span>
        <span
          className="hx-mono text-[9px] shrink-0"
          style={{ color: isActive ? 'rgba(59,130,246,.6)' : '#3a3a36' }}
        >
          {item.numeral}
        </span>
      </button>
    );
  }

  return (
    <aside
      className="w-[280px] shrink-0 flex flex-col relative z-20"
      style={{
        background: 'linear-gradient(180deg, rgba(9,9,13,.97) 0%, rgba(6,6,10,.97) 100%)',
        borderRight: '1px solid rgba(255,255,255,.05)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        {/* Time + location */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="hx-mono text-[10px] tracking-wider" style={{ color: '#c9a76c' }}>
            {time} EST
          </span>
          <span className="hx-mono text-[10px]" style={{ color: '#5a5a52' }}>•</span>
          <span className="hx-mono text-[10px] tracking-wider" style={{ color: '#c9a76c' }}>
            NEW YORK
          </span>
        </div>

        {/* Wordmark */}
        <div className="hx-serif tracking-tight leading-none" style={{ fontSize: '22px', color: '#e8e8e3' }}>
          Hermes<span style={{ color: '#c9a76c', fontStyle: 'italic', fontSize: '16px', marginLeft: '2px' }}>studio</span>
        </div>
      </div>

      {/* ── Scrollable nav ─────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto hx-scroll py-2 px-3 space-y-5">

        {/* ── FLEET ──────────────────────────────────────────────── */}
        <div>
          <p
            className="px-3 pb-2 hx-mono text-[9px] uppercase tracking-[0.25em]"
            style={{ color: '#4a4a42' }}
          >
            Fleet
          </p>
          <div className="space-y-0.5">
            {profiles.map((p) => {
              const active = mode === 'profile' && p.id === activeProfileId;
              return (
                <button
                  key={p.id}
                  onClick={() => setModeAndNavigate('profile', p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group"
                  style={{
                    background: active
                      ? 'linear-gradient(180deg, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 100%)'
                      : 'transparent',
                    border: active ? '1px solid rgba(59,130,246,.35)' : '1px solid transparent',
                  }}
                >
                  <GlowingOrb color={p.accent} rgb={p.accentRGB} size={16} />
                  <div className="flex-1 min-w-0 text-left">
                    <div
                      className="text-[13px] font-medium truncate transition-colors"
                      style={{
                        color: active ? '#e8e8e3' : '#9a9a92',
                        fontFamily: "'Inter Tight', sans-serif",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="hx-mono text-[9px] uppercase tracking-wider truncate transition-colors"
                      style={{ color: active ? 'rgba(148,163,184,.6)' : '#4a4a42' }}
                    >
                      {p.connection.provider === 'lm-studio' ? 'LM STUDIO' :
                       p.connection.provider === 'ollama' ? 'OLLAMA' :
                       p.connection.provider === 'mlx-lm' ? 'MLX' :
                       p.connection.provider === 'mlx-vlm' ? 'MLX-VLM' :
                       p.connection.provider === 'inferencer' ? 'INFERENCE' :
                       p.connection.provider.toUpperCase()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Forge profile button */}
          <button
            onClick={onForgeProfile}
            className="w-full mt-2 px-3 py-2 rounded-xl text-[11px] transition-all duration-200 hover:bg-white/[0.04] flex items-center gap-2"
            style={{ color: '#7a7a72', fontFamily: "'Inter Tight', sans-serif" }}
          >
            <span style={{ color: '#5a5a52' }}>+</span> Forge profile
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.04)' }} />

        {/* ── SHARED ─────────────────────────────────────────────── */}
        <div>
          <p
            className="px-3 pb-2 hx-mono text-[9px] uppercase tracking-[0.25em]"
            style={{ color: '#4a4a42' }}
          >
            Shared
          </p>
          <div className="space-y-0.5">
            {SIDEBAR_SHARED.map(sharedNavItem)}
          </div>
        </div>
      </nav>

      {/* ── WIRED footer ─────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-4 space-y-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,.04)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#7FE38E', boxShadow: '0 0 6px rgba(127,227,142,.5)' }}
          />
          <span className="hx-mono text-[9px]" style={{ color: '#5a5a52' }}>
            localStorage • {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="hx-mono text-[9px]" style={{ color: '#3a3a36' }}>
          single-file build • v0.1
        </div>
      </div>
    </aside>
  );
}
