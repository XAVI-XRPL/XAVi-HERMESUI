'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — Minimal ChatGPT-style left rail
// - Thin, always-visible rail (no heavy chrome)
// - Profiles at top → shared nav below
// - Active item: accent-colored background pill + left indicator bar
// - No Roman numerals in nav items (kept only on ChapterHeaders)
// ─────────────────────────────────────────────────────────────────────────────

import { useStudioStore } from '@/stores';
import type { SharedSurfaceId } from '@/types';

const SHARED_SURFACES: Array<{ id: SharedSurfaceId; label: string }> = [
  { id: 'mission',   label: 'Mission Control' },
  { id: 'studio',    label: 'Studio'           },
  { id: 'memory',    label: 'Memory'            },
  { id: 'kanban',    label: 'Kanban'            },
  { id: 'journal',   label: 'Journal'           },
  { id: 'goals',     label: 'Goals'             },
  { id: 'skills',    label: 'Skills'            },
  { id: 'settings',  label: 'Settings'          },
];

// ── Icons (inline SVG, no dep) ───────────────────────────────────────────────

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

function IconStudio({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
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

const SURFACE_ICONS: Record<SharedSurfaceId, React.ReactNode> = {
  mission: <IconMission size={14} />,
  studio:  <IconStudio size={14} />,
  memory:  <IconMemory size={14} />,
  kanban:  <IconKanban size={14} />,
  journal: <IconJournal size={14} />,
  goals:   <IconGoals size={14} />,
  skills:  <IconSkills size={14} />,
  settings:<IconSettings size={14} />,
  claw3d:  null, // rarely used
};

// ── Main component ───────────────────────────────────────────────────────────

interface SidebarProps {
  time: string;
  day: string;
}

export default function Sidebar({ time }: SidebarProps) {
  const profiles         = useStudioStore((s) => s.profiles);
  const settings         = useStudioStore((s) => s.settings);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  const { mode, activeProfileId } = settings;
  const activeShared = settings.activeShared;

  function navItem(
    id: string,
    label: string,
    icon?: React.ReactNode,
    isActive = false,
    accentRGB = '201,167,108',
    onClick?: () => void
  ) {
    return (
      <button
        key={id}
        onClick={onClick}
        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 text-left group relative"
        style={{
          background: isActive ? `rgba(${accentRGB},.1)` : 'transparent',
          borderLeft: isActive ? `2px solid rgba(${accentRGB},.7)` : '2px solid transparent',
        }}
      >
        {icon && (
          <span
            className="shrink-0 transition-colors"
            style={{ color: isActive ? '#e8e8e3' : '#5a5a52' }}
          >
            {icon}
          </span>
        )}
        <span
          className="text-[13px] truncate transition-colors"
          style={{
            color: isActive ? '#e8e8e3' : '#7a7a72',
            fontWeight: isActive ? 450 : 400,
          }}
        >
          {label}
        </span>
      </button>
    );
  }

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col relative z-20"
      style={{
        background: 'rgba(9,9,13,.95)',
        borderRight: '1px solid rgba(255,255,255,.05)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Header — wordmark only ─────────────────────────────── */}
      <div
        className="shrink-0 px-4 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}
      >
        <span
          className="hx-serif text-[18px] tracking-tight leading-none"
          style={{ color: '#e8e8e3' }}
        >
          Hermes<span style={{ color: 'var(--accent, #c9a76c)', fontStyle: 'italic', fontSize: 14 }}> studio</span>
        </span>
        <span
          className="hx-mono text-[9px] uppercase tracking-wider"
          style={{ color: '#3a3a36' }}
        >
          {time}
        </span>
      </div>

      {/* ── Scrollable nav area ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">

        {/* Fleet — profiles */}
        <div>
          <p
            className="px-3 pb-2 hx-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: '#3a3a36' }}
          >
            Profiles
          </p>
          {profiles.map((p) => {
            const active = mode === 'profile' && p.id === activeProfileId;
            return navItem(
              p.id,
              p.name,
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${p.accent} 0%, ${p.accent}88)`,
                }}
              />,
              active,
              p.accentRGB,
              () => setModeAndNavigate('profile', p.id)
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.04)' }} />

        {/* Shared surfaces */}
        <div>
          <p
            className="px-3 pb-2 hx-mono text-[9.5px] uppercase tracking-[0.2em]"
            style={{ color: '#3a3a36' }}
          >
            Shared
          </p>
          {SHARED_SURFACES.map(({ id, label }) =>
            navItem(id, label, SURFACE_ICONS[id], mode === 'shared' && activeShared === id,
              '201,167,108', () => setModeAndNavigate('shared', id))
          )}
        </div>

      </nav>

      {/* ── Footer — Claw3D link ─────────────────────────────────── */}
      <div
        className="shrink-0 px-2 pb-4 pt-1"
        style={{ borderTop: '1px solid rgba(255,255,255,.04)' }}
      >
        {navItem('claw3d', 'Claw3D · Office', SURFACE_ICONS.claw3d,
          mode === 'shared' && activeShared === 'claw3d',
          '201,167,108', () => setModeAndNavigate('shared', 'claw3d'))}
      </div>
    </aside>
  );
}