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

// ── Profile Tab Pills (exact match to prototype) ──────────────────────────

function ProfileTabPills({ profile, activeTab, onTabChange, onEditProfile }: {
  profile: Profile;
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  onEditProfile: () => void;
}) {
  return (
    <div className="px-10 mb-8">
      <div className="flex items-center gap-1.5 flex-wrap">
        {PROFILE_TABS.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id as ProfileTabId)}
              className={`hx-pill px-4 py-1.5 rounded-full flex items-center gap-2 text-[12px] ${active ? 'hx-pill-active' : 'text-neutral-400'}`}
              style={active ? { '--accent': profile.accent, '--accent-rgb': profile.accentRGB } as React.CSSProperties : {}}
            >
              <span className="hx-mono text-[9px] opacity-60">{t.numeral}</span>
              {t.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={onEditProfile}
          className="hx-pill px-3 py-1.5 rounded-full text-[11px] text-neutral-400 flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
          </svg>
          Edit profile
        </button>
      </div>
    </div>
  );
}

// ── Main Shell ───────────────────────────────────────────────────────────────

export default function StudioShell({ time, day }: StudioShellProps) {
  const settings = useStudioStore((s) => s.settings);
  const profiles = useStudioStore((s) => s.profiles);
  const setActiveProfileTab = useStudioStore((s) => s.setActiveProfileTab);

  // ── Local overlay state
  const [paletteOpen, setPaletteOpen] = useState(false);
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

  // ── Dynamic ambient accent ────────────────────────────────────────────
  const ambientAccent = settings.mode === 'profile' && activeProfile
    ? { accent: activeProfile.accent, rgb: activeProfile.accentRGB }
    : { accent: '#c9a76c', rgb: '201,167,108' };

  // ── Render shared surfaces ──────────────────────────────────────────────
  function renderSharedSurface() {
    const { activeShared } = settings;

    if (activeShared === 'mission') {
      return (
        <>
          <ChapterHeader numeral="I" kicker="MISSION CONTROL · THE BRIDGE"
            title="Bridge" italic="today"
            subtitle="The view from above. Every agent, every thread, every signal — at a glance."
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
          <ChapterHeader numeral="IX" kicker="SELF · STUDIO"
            title="Studio" italic="the workshop"
            subtitle="Substrate, models, lifecycle. The view beneath the agents."
            day={day} time={time}
          />
          <StudioSubstrate />
        </>
      );
    }
    if (activeShared === 'kanban') {
      return (
        <>
          <ChapterHeader numeral="VI" kicker="SELF · KANBAN"
            title="Kanban" italic="task board"
            subtitle="Project tracking across all profiles."
            day={day} time={time}
          />
          <KanbanView />
        </>
      );
    }
    if (activeShared === 'journal') {
      return (
        <>
          <ChapterHeader numeral="VII" kicker="SELF · JOURNAL"
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
          <ChapterHeader numeral="VIII" kicker="SELF · GOALS"
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
          <ChapterHeader numeral="X" kicker="SELF · SKILLS"
            title="Skills" italic="atelier"
            subtitle="Every capability across the fleet."
            day={day} time={time}
          />
          <SharedSkillsView />
        </>
      );
    }
    if (activeShared === 'settings') {
      return (
        <>
          <ChapterHeader numeral="XI" kicker="SELF · SETTINGS"
            title="Settings" italic="the controls"
            subtitle="Provider defaults, persistence, export."
            day={day} time={time}
          />
          <SettingsView />
        </>
      );
    }
    if (activeShared === 'claw3d') {
      return (
        <>
          <ChapterHeader numeral="XII" kicker="WIRED · CLAW3D"
            title="Office" italic="an office for your agents"
            subtitle="The Claw3D 3D workspace, embedded."
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
    const tabMeta = PROFILE_TABS.find((t) => t.id === tab) || PROFILE_TABS[0];

    const subtitle =
      tab === 'console' ? 'Speak. The console saves itself.' :
      tab === 'sessions' ? 'Every thread, every turn.' :
      tab === 'skills' ? "What this agent can do for you." :
      tab === 'memory' ? 'What this agent remembers about you.' :
      'How this agent thinks, what it runs on.';

    return (
      <>
        {/* Profile header — exact match to prototype */}
        <ChapterHeader
          numeral={tabMeta.numeral}
          kicker={`${activeProfile.name.toUpperCase()} · ${tab.toUpperCase()}`}
          title={activeProfile.name}
          italic={activeProfile.role.toLowerCase()}
          subtitle={subtitle}
          day={day}
          time={time}
          accent={activeProfile.accent}
        />

        {/* Tab pills */}
        <ProfileTabPills
          profile={activeProfile}
          activeTab={tab}
          onTabChange={(t) => setActiveProfileTab(activeProfile.id, t)}
          onEditProfile={() => setEditingProfile(activeProfile)}
        />

        {/* Tab content */}
        <div className="px-10">
          {tab === 'console' && <ProfileConsole profile={activeProfile} />}
          {tab === 'sessions' && <SessionsTab profile={activeProfile} />}
          {tab === 'skills' && <ProfileSkillsTab profile={activeProfile} />}
          {tab === 'memory' && <ProfileMemoryTab profile={activeProfile} />}
          {tab === 'config' && (
            <ProfileConfigTab profile={activeProfile} onEdit={() => setEditingProfile(activeProfile)} />
          )}
        </div>
      </>
    );
  }

  return (
    <div
      className="relative h-screen w-full overflow-hidden text-neutral-200"
      style={{
        background: '#0A0A0E',
        '--accent': ambientAccent.accent,
        '--accent-rgb': ambientAccent.rgb,
      } as React.CSSProperties}
    >
      {/* Ambient bg layers */}
      <div className="hx-ambient" aria-hidden="true" />
      <div className="hx-grain" aria-hidden="true" />

      <div className="relative flex h-full z-10">
        {/* Sidebar */}
        <Sidebar
          time={time}
          day={day}
          onForgeProfile={() => setEditingProfile('new')}
        />

        {/* Main content area */}
        <main className="flex-1 relative min-w-0 overflow-hidden">
          {/* Floating command palette trigger */}
          <TopChrome onCmdK={() => setPaletteOpen((o) => !o)} />

          {/* Scrollable content */}
          <div className="h-full overflow-y-auto hx-scroll">
            {settings.mode === 'profile' && activeProfile
              ? renderProfilePage()
              : renderSharedSurface()
            }
          </div>
        </main>
      </div>

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
