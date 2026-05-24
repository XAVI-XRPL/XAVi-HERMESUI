'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Premium glassmorphic left panel
// Exact match to hermes-studio.html prototype
// ─────────────────────────────────────────────────────────────────────────────

import { useStudioStore } from '@/stores';
import type { SharedSurfaceId } from '@/types';

// ── Inline SVG Icons (matching prototype) ───────────────────────────────────

const Icon = ({ d, className = '', size = 16, strokeWidth = 1.6 }: {
  d: React.ReactNode; className?: string; size?: number; strokeWidth?: number;
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
       className={className}>{d}</svg>
);

const I = {
  compass: <Icon d={<><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></>} />,
  book: <Icon d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>} />,
  kanban: <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7v10" /><path d="M16 7v6" /></>} />,
  edit: <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" /></>} />,
  target: <Icon d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>} />,
  map: <Icon d={<><path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" /></>} />,
  wrench: <Icon d={<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4L15 12l-3-3z" />} />,
  cog: <Icon d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>} />,
  cube: <Icon d={<><path d="m21 16-9 5-9-5" /><path d="m21 8-9-5-9 5 9 5z" /><path d="M3 8v8" /><path d="M21 8v8" /><path d="M12 13v8" /></>} />,
  plus: <Icon d={<><path d="M12 5v14" /><path d="M5 12h14" /></>} />,
};

// Shared surfaces shown in sidebar (matching mockup - ALL 9)
const SIDEBAR_SHARED: Array<{ id: SharedSurfaceId; label: string; numeral: string; icon: React.ReactNode }> = [
  { id: 'mission',  label: 'MISSION CONTROL', icon: I.compass, numeral: 'I'   },
  { id: 'memory',   label: 'MEMORY',          icon: I.book,    numeral: 'V'   },
  { id: 'kanban',   label: 'KANBAN',          icon: I.kanban,  numeral: 'VI'  },
  { id: 'journal',  label: 'JOURNAL',         icon: I.edit,    numeral: 'VII' },
  { id: 'goals',    label: 'GOALS',           icon: I.target,  numeral: 'VIII'},
  { id: 'studio',   label: 'STUDIO',          icon: I.map,     numeral: 'IX'  },
  { id: 'skills',   label: 'SKILLS',          icon: I.wrench,  numeral: 'X'   },
  { id: 'settings', label: 'SETTINGS',        icon: I.cog,     numeral: 'XI'  },
  { id: 'claw3d',   label: 'CLAW3D · OFFICE', icon: I.cube,    numeral: 'XII' },
];

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

// ── Section Label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-2 pb-2 hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim">
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface SidebarProps {
  time: string;
  day: string;
  onForgeProfile: () => void;
}

export default function Sidebar({ time, onForgeProfile }: SidebarProps) {
  const profiles = useStudioStore((s) => s.profiles);
  const settings = useStudioStore((s) => s.settings);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  const { mode, activeProfileId, activeShared } = settings;

  return (
    <aside
      className="w-[280px] shrink-0 flex flex-col relative z-20"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,14,.85) 0%, rgba(10,10,14,.7) 100%)',
        borderRight: '1px solid rgba(255,255,255,.05)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5">
        <div className="hx-mono text-[10px] uppercase tracking-[0.18em] hx-amber-dim mb-2">
          {time} EST · NEW YORK
        </div>
        <div className="hx-serif text-[28px] leading-none text-neutral-100">
          Hermes{' '}
          <span className="italic hx-amber" style={{ fontSize: '22px' }}>
            studio
          </span>
        </div>
      </div>

      {/* ── Scrollable nav ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hx-scroll px-3 pb-3">
        {/* ── FLEET ──────────────────────────────────────────────── */}
        <SectionLabel>Fleet</SectionLabel>
        <div className="space-y-1 mb-5">
          {profiles.map((p) => {
            const active = mode === 'profile' && p.id === activeProfileId;
            return (
              <button
                key={p.id}
                onClick={() => setModeAndNavigate('profile', p.id)}
                className="w-full relative rounded-xl px-3 py-2.5 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: active
                    ? `linear-gradient(135deg, rgba(${p.accentRGB},.14) 0%, rgba(${p.accentRGB},.04) 100%)`
                    : 'transparent',
                  border: active ? `1px solid rgba(${p.accentRGB},.25)` : '1px solid transparent',
                  boxShadow: active
                    ? `0 0 24px rgba(${p.accentRGB},.12), inset 0 1px 0 rgba(${p.accentRGB},.15)`
                    : 'none',
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-3 bottom-3 w-[2px] rounded-r"
                    style={{ background: p.accent, boxShadow: `0 0 8px ${p.accent}` }}
                  />
                )}
                <div
                  className="hx-orb shrink-0 hx-glow-on-hover"
                  style={{ width: '28px', height: '28px', '--accent': p.accent, '--accent-rgb': p.accentRGB } as React.CSSProperties}
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[14px] font-medium truncate"
                      style={{ color: active ? '#fff' : '#d4d4cc' }}
                    >
                      {p.name}
                    </span>
                    <StatusDot status={p.status} />
                  </div>
                  <div className="hx-mono text-[9.5px] uppercase tracking-[0.1em] text-neutral-500 truncate">
                    {p.connection.provider === 'lm-studio' ? 'LM STUDIO' :
                     p.connection.provider === 'ollama' ? 'OLLAMA' :
                     p.connection.provider === 'mlx-lm' ? 'MLX (MLX_LM.SERVER)' :
                     p.connection.provider === 'mlx-vlm' ? 'MLX-VLM' :
                     p.connection.provider === 'inferencer' ? 'INFERENCE' :
                     p.connection.provider.toUpperCase()}
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={onForgeProfile}
            className="hx-pill w-full rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-[12px] text-neutral-400 hover:text-neutral-200"
          >
            {I.plus} Forge profile
          </button>
        </div>

        {/* ── SHARED ─────────────────────────────────────────────── */}
        <SectionLabel>Shared</SectionLabel>
        <div className="space-y-0.5 mb-5">
          {SIDEBAR_SHARED.map((s) => {
            const active = mode === 'shared' && s.id === activeShared;
            return (
              <button
                key={s.id}
                onClick={() => setModeAndNavigate('shared', s.id)}
                className="w-full relative rounded-lg px-3 py-2 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(201,167,108,.12), rgba(201,167,108,.03))'
                    : 'transparent',
                  border: active ? '1px solid rgba(201,167,108,.25)' : '1px solid transparent',
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r"
                    style={{ background: '#c9a76c', boxShadow: '0 0 8px #c9a76c' }}
                  />
                )}
                <span
                  className="shrink-0"
                  style={{ color: active ? '#c9a76c' : '#7a7a72' }}
                >
                  {s.icon}
                </span>
                <span
                  className="hx-mono text-[10.5px] uppercase tracking-[0.13em] flex-1 text-left"
                  style={{ color: active ? '#e8d4a8' : '#9a9a92' }}
                >
                  {s.label}
                </span>
                <span className="hx-mono text-[9px] hx-amber-dim opacity-60">
                  {s.numeral}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── WIRED footer ─────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t hx-hairline">
        <div className="hx-mono text-[9px] uppercase tracking-[0.2em] hx-amber-dim mb-2">
          Wired
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="hx-mono text-[10px] text-neutral-500">
            localStorage · {profiles.length} profiles
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hx-breathe" />
        </div>
        <div className="hx-mono text-[9px] hx-amber-dim">
          single-file build · v0.1
        </div>
      </div>
    </aside>
  );
}
