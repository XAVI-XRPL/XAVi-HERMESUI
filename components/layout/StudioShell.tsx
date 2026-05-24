'use client';

import { useState, useEffect } from 'react';
import { useStudioStore } from '@/stores';
import type { Profile, ProfileTabId } from '@/types';
import { PROFILE_TABS } from '@/types';

// Layout components
import Sidebar from '@/components/layout/Sidebar';
import TopChrome from '@/components/layout/TopChrome';
import ChapterHeader from '@/components/layout/ChapterHeader';
// Overlays
import CommandPalette from '@/components/layout/CommandPalette';
import ProfileDrawer from '@/components/layout/ProfileDrawer';

// Shared surfaces
import MissionControl from '@/components/surfaces/MissionControl';
import SharedMemoryView from '@/components/surfaces/SharedMemoryView';
import StudioSubstrate from '@/components/surfaces/StudioSubstrate';
import KanbanView from '@/components/surfaces/KanbanView';
import JournalView from '@/components/surfaces/JournalView';
import GoalsView from '@/components/surfaces/GoalsView';
import SharedSkillsView from '@/components/surfaces/SharedSkillsView';
import SettingsView from '@/components/surfaces/SettingsView';
import Claw3DView from '@/components/surfaces/Claw3DView';

// Per-profile surfaces
import ProfileConsole from '@/components/surfaces/ProfileConsole';
import SessionsTab from '@/components/surfaces/SessionsTab';
import ProfileSkillsTab from '@/components/surfaces/ProfileSkillsTab';
import ProfileMemoryTab from '@/components/surfaces/ProfileMemoryTab';
import ProfileConfigTab from '@/components/surfaces/ProfileConfigTab';

interface StudioShellProps {
  time: string;
  day: string;
}

// ── Profile Tab Pills ────────────────────────────────────────────────────────

function ProfileTabPills({ profile, activeTab, onTabChange, onEditProfile }: {
  profile: Profile;
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  onEditProfile: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-10 mt-6 mb-0">
      <div className="flex items-center gap-2">
        {PROFILE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ProfileTabId)}
              className="hx-pill rounded-full px-4 py-2 text-[12px] font-medium transition-all duration-200"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                color: isActive ? profile.accent : '#7a7a72',
                ...(isActive ? {
                  background: `linear-gradient(180deg, rgba(${profile.accentRGB},.2) 0%, rgba(${profile.accentRGB},.06) 100%)`,
                  border: `1px solid rgba(${profile.accentRGB},.4)`,
                  borderTopColor: `rgba(${profile.accentRGB},.55)`,
                  boxShadow: `0 1px 0 rgba(${profile.accentRGB},.3) inset, 0 0 16px rgba(${profile.accentRGB},.2), 0 1px 2px rgba(0,0,0,.3)`,
                } : {}),
              }}
            >
              <span className="hx-mono" style={{ fontSize: '10px', opacity: 0.6 }}>{tab.numeral} </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Edit profile button */}
      <button
        onClick={onEditProfile}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] transition-all duration-200 hover:bg-white/[0.05]"
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          color: '#7a7a72',
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                fill="currentColor" stroke="none" opacity=".7" />
        </svg>
        Edit profile
      </button>
    </div>
  );
}

// ── Main Shell ───────────────────────────────────────────────────────────────

export default function StudioShell({ time, day }: StudioShellProps) {
  const settings = useStudioStore((s) => s.settings);
  const profiles = useStudioStore((s) => s.profiles);
  const setActiveProfileTab = useStudioStore((s) => s.setActiveProfileTab);

  // ── Local overlay state
  const [paletteOpen, setPaletteOpen]     = useState(false);
  const [editingProfile, setEditingProfile] = useState<null | 'new' | Profile>(null);

  // ── Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); }
      if (e.key === 'Escape') { setPaletteOpen(false); setEditingProfile(null); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Active profile lookup
  const activeProfile = settings.activeProfileId
    ? profiles.find((p) => p.id === settings.activeProfileId)
    : null;

  // ── Render shared surfaces ──────────────────────────────────────────────
  function renderSharedSurface() {
    const { activeShared } = settings;

    if (activeShared === 'mission') {
      return (
        <>
          <ChapterHeader numeral="I" kicker="SELF · SHARED"
            title="Mission Control" italic="the cockpit"
            subtitle="Live telemetry, active sessions, and system status at a glance."
            day={day} time={time}
          />
          <MissionControl />
        </>
      );
    }
    if (activeShared === 'memory') {
      return (
        <>
          <ChapterHeader numeral="V" kicker="SELF · MEMORY"
            title="Memory" italic="atlas of self"
            subtitle="Cross-agent recall. Wired in v0.2."
            day={day} time={time}
          />
          <SharedMemoryView />
        </>
      );
    }
    if (activeShared === 'studio') {
      return (
        <>
          <ChapterHeader numeral="IX" kicker="SELF · SHARED"
            title="Studio" italic="the workshop"
            subtitle="Live GPU/RAM/VRAM telemetry — models, compute, substrate."
            day={day} time={time}
          />
          <StudioSubstrate />
        </>
      );
    }
    if (activeShared === 'kanban') {
      return (
        <>
          <ChapterHeader numeral="VI" kicker="SELF · SHARED"
            title="Kanban" italic="task board"
            subtitle="Project tracking across all profiles — drag, drop, ship."
            day={day} time={time}
          />
          <KanbanView />
        </>
      );
    }
    if (activeShared === 'journal') {
      return (
        <>
          <ChapterHeader numeral="VII" kicker="SELF · SHARED"
            title="Journal" italic="the logbook"
            subtitle="Chronological record of sessions, decisions, and reflections."
            day={day} time={time}
          />
          <JournalView />
        </>
      );
    }
    if (activeShared === 'goals') {
      return (
        <>
          <ChapterHeader numeral="VIII" kicker="SELF · SHARED"
            title="Goals" italic="the roadmap"
            subtitle="Quarterly objectives and key results — shared across the fleet."
            day={day} time={time}
          />
          <GoalsView />
        </>
      );
    }
    if (activeShared === 'skills') {
      return (
        <>
          <ChapterHeader numeral="X" kicker="SELF · SHARED"
            title="Skills" italic="the arsenal"
            subtitle="Capabilities catalogue — web, vision, code exec, and more."
            day={day} time={time}
          />
          <SharedSkillsView />
        </>
      );
    }
    if (activeShared === 'settings') {
      return (
        <>
          <ChapterHeader numeral="XI" kicker="SELF · SHARED"
            title="Settings" italic="the control room"
            subtitle="Global preferences, provider configuration, and workspace options."
            day={day} time={time}
          />
          <SettingsView />
        </>
      );
    }
    if (activeShared === 'claw3d') {
      return (
        <>
          <ChapterHeader numeral="XII" kicker="SELF · SHARED"
            title="Claw3D" italic="office"
            subtitle="Three-dimensional spatial workspace — shared office environment."
            day={day} time={time}
          />
          <Claw3DView url={settings.claw3dUrl} />
        </>
      );
    }
    return null;
  }

  // ── Render profile page ─────────────────────────────────────────────────
  function renderProfilePage() {
    if (!activeProfile) return null;

    const tab = (settings.profileTabs?.[activeProfile.id] ?? 'console') as ProfileTabId;

    return (
      <>
        {/* Profile header */}
        <div className="px-10 pt-10 pb-2 relative hx-fade-up">
          {/* Numeral + kicker */}
          <div className="flex items-center gap-3 mb-4">
            <span className="hx-serif italic text-[18px]" style={{ color: activeProfile.accent }}>
              II.
            </span>
            <span className="w-8 h-px" style={{ background: 'rgba(255,255,255,.18)' }} />
            <span className="hx-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: '#5a5a52' }}>
              {activeProfile.name.toUpperCase()} · CONSOLE
            </span>
          </div>

          {/* Title */}
          <h1 className="hx-serif text-[58px] leading-[1.02] tracking-tight" style={{ color: '#e8e8e3' }}>
            {activeProfile.name}
            <span className="italic ml-3" style={{ color: '#c9a76c', fontStyle: 'italic' }}>
              {activeProfile.role.toLowerCase()}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hx-serif italic text-[19px] mt-3" style={{ color: '#7a7a72' }}>
            Speak. The console saves itself.
          </p>

          {/* Timestamp */}
          <div className="hx-mono text-[10px] uppercase tracking-[0.22em] mt-5" style={{ color: '#c9a76c' }}>
            {time} • {day.toUpperCase()} • NEW YORK
          </div>
        </div>

        {/* Tab pills */}
        <ProfileTabPills
          profile={activeProfile}
          activeTab={tab}
          onTabChange={(t) => setActiveProfileTab(activeProfile.id, t)}
          onEditProfile={() => setEditingProfile(activeProfile)}
        />

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'sessions' && <SessionsTab profile={activeProfile} />}
          {tab === 'skills' && <ProfileSkillsTab profile={activeProfile} />}
          {tab === 'memory' && <ProfileMemoryTab profile={activeProfile} />}
          {tab === 'config' && (
            <ProfileConfigTab profile={activeProfile} onEdit={() => setEditingProfile(activeProfile)} />
          )}
          {!['sessions', 'skills', 'memory', 'config'].includes(tab) && (
            <ProfileConsole profile={activeProfile} />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="relative h-full w-full flex overflow-hidden" style={{ background: '#0A0A0E' }}>
      {/* Ambient bg layers */}
      <div className="hx-ambient" aria-hidden="true" />
      <div className="hx-grain"  aria-hidden="true" />

      {/* Sidebar */}
      <Sidebar
        time={time}
        day={day}
        onForgeProfile={() => setEditingProfile('new')}
      />

      {/* Main content area */}
      <main
        className="flex-1 relative min-w-0 flex flex-col overflow-hidden"
        style={{ background: 'var(--bg, #0A0A0E)' }}
      >
        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto hx-scroll">
          {settings.mode === 'profile' && activeProfile
            ? renderProfilePage()
            : renderSharedSurface()
          }
        </div>
      </main>

      {/* Floating command palette trigger */}
      <TopChrome onCmdK={() => setPaletteOpen((o) => !o)} />

      {/* Overlays */}
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onEditProfile={(p) => { setEditingProfile(p); setPaletteOpen(false); }}
        />
      )}

      {editingProfile !== null && (
        <ProfileDrawer
          profile={editingProfile === 'new' ? null : editingProfile}
          onClose={() => setEditingProfile(null)}
        />
      )}
    </div>
  );
}
