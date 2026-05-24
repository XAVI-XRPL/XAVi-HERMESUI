'use client';

import { useState, useEffect } from 'react';
import { useStudioStore } from '@/stores';
import type { Profile } from '@/types';

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

export default function StudioShell({ time, day }: StudioShellProps) {
  const settings = useStudioStore((s) => s.settings);
  const profiles = useStudioStore((s) => s.profiles);

  // ── Local overlay state
  const [paletteOpen, setPaletteOpen]     = useState(false);
  const [editingProfile, setEditingProfile] = useState<null | 'new' | Profile>(null);

  // ── Keyboard shortcuts ⌘K / Escape
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

  function renderContent() {
    if (settings.mode === 'profile' && activeProfile) {
      const tab = settings.profileTabs?.[activeProfile.id] ?? 'console';
      switch (tab) {
        case 'sessions':
          return <SessionsTab profile={activeProfile} />;
        case 'skills':
          return <ProfileSkillsTab profile={activeProfile} />;
        case 'memory':
          return <ProfileMemoryTab profile={activeProfile} />;
        case 'config':
          return <ProfileConfigTab profile={activeProfile} onEdit={() => setEditingProfile(activeProfile)} />;
        default: // console + any unknown
          return <ProfileConsole profile={activeProfile} />;
      }
    }

    // Shared surfaces (no ChapterHeader for chatty surfaces — clean look)
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
          <ChapterHeader numeral="V" kicker="SELF · SHARED"
            title="Memory" italic="vector store & scratchpad"
            subtitle="Persistent knowledge base — shared across all profiles."
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

  return (
    <div className="relative h-full w-full flex overflow-hidden" style={{ background: '#0A0A0E' }}>
      {/* Ambient bg layers */}
      <div className="hx-ambient" aria-hidden="true" />
      <div className="hx-grain"  aria-hidden="true" />

      {/* Sidebar — full height left rail */}
      <Sidebar time={time} day={day} />

      {/* Main content area — everything to the right of sidebar */}
      <main
        className="flex-1 relative min-w-0 flex flex-col overflow-hidden"
        style={{ background: 'var(--bg, #0A0A0E)' }}
      >
        {/* Scrollable content region */}
        <div className="relative flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Floating ⌘K — outside main so it's not clipped by overflow:hidden on the shell */}
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