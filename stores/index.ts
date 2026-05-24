// ─────────────────────────────────────────────────────────────────────────────
// Hermes Studio — Combined Zustand Store
// Persists profiles, sessions, and settings to localStorage on every change.
// Mirrors the prototype's useState+useEffect pattern but in a global store.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { create } from 'zustand';
import type {
  Profile,
  Session,
  Settings,
  SkillId,
  SharedSurfaceId,
  ProfileTabId,
} from '@/types';
import { DEFAULT_PROFILES, STORAGE_KEYS } from '@/types';

// ── State shape ─────────────────────────────────────────────────────────────

interface StudioState {
  profiles: Profile[];
  sessions: Record<string, Session>;
  settings: Settings;

  // Profile mutations
  upsertProfile: (p: Profile) => void;
  deleteProfile: (id: string) => void;
  updateProfileStatus: (id: string, status: Profile['status']) => void;

  // Session mutations
  upsertSession: (s: Session) => void;
  clearSession: (sessionId: string) => void;

  // Settings mutations
  setModeAndNavigate: (mode: 'profile' | 'shared', targetId: string, tab?: ProfileTabId) => void;
  setActiveProfileTab: (profileId: string, tab: ProfileTabId) => void;
  setActiveSessionForProfile: (profileId: string, sessionId: string | null) => void;

  // Computed helpers
  getProfileById: (id: string) => Profile | undefined;
  getSessionsForProfile: (profileId: string) => Session[];
}

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  mode: 'shared',
  activeProfileId: null,
  activeShared: 'mission',
  profileTabs: {},
  activeSessionId: {},
  claw3dUrl: 'http://localhost:3000/office',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function persist<T extends object>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[store] persist failed:', e);
  }
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useStudioStore = create<StudioState>((set, get) => ({
  profiles: load(STORAGE_KEYS.profiles, DEFAULT_PROFILES),
  sessions: load(STORAGE_KEYS.sessions, {}),
  settings: {
    ...DEFAULT_SETTINGS,
    activeProfileId:
      load<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS).activeProfileId ??
      DEFAULT_PROFILES[0]?.id ?? null,
  },

  // ── Profiles ───────────────────────────────────────────────────────────────

  upsertProfile: (p) => {
    set((s) => {
      const existing = s.profiles.findIndex((x) => x.id === p.id);
      const next =
        existing === -1
          ? [...s.profiles, { ...p, updatedAt: Date.now() }]
          : s.profiles.map((x) =>
              x.id === p.id ? { ...p, updatedAt: Date.now() } : x
            );
      persist(STORAGE_KEYS.profiles, next);
      return { profiles: next };
    });
  },

  deleteProfile: (id) => {
    set((s) => {
      if (s.profiles.length <= 1) return {};
      const next = s.profiles.filter((p) => p.id !== id);
      // also prune sessions for this profile
      const sessionsNext: Record<string, Session> = {};
      Object.entries(s.sessions).forEach(([k, v]) => {
        if (v.profileId !== id) sessionsNext[k] = v;
      });
      const fallback =
        next.find((p) => p.id !== id)?.id ?? next[0]?.id ?? null;
      persist(STORAGE_KEYS.profiles, next);
      persist(STORAGE_KEYS.sessions, sessionsNext);
      return {
        profiles: next,
        sessions: sessionsNext,
        settings: { ...s.settings, activeProfileId: fallback },
      };
    });
  },

  updateProfileStatus: (id, status) => {
    set((s) => {
      const next = s.profiles.map((p) =>
        p.id === id ? { ...p, status } : p
      );
      persist(STORAGE_KEYS.profiles, next);
      return { profiles: next };
    });
  },

  // ── Sessions ───────────────────────────────────────────────────────────────

  upsertSession: (session) => {
    set((s) => {
      const next = { ...s.sessions, [session.id]: session };
      persist(STORAGE_KEYS.sessions, next);
      return { sessions: next };
    });
  },

  clearSession: (id) => {
    set((s) => {
      if (!s.sessions[id]) return {};
      const updated = { ...s.sessions[id], turns: [], title: 'New session', updatedAt: Date.now() };
      const sessionsNext = { ...s.sessions, [id]: updated };
      persist(STORAGE_KEYS.sessions, sessionsNext);
      return { sessions: sessionsNext };
    });
  },

  // ── Navigation / Settings ───────────────────────────────────────────────────

  setModeAndNavigate: (mode, targetId, tab) => {
    set((s) => {
      const next: Partial<Settings> = {};
      if (mode === 'profile') {
        next.mode = 'profile';
        next.activeProfileId = targetId;
        if (tab !== undefined) {
          next.profileTabs = { ...(s.settings.profileTabs ?? {}), [targetId]: tab };
        }
      } else {
        next.mode = 'shared';
        next.activeShared = targetId as SharedSurfaceId;
      }
      const mergedSettings = { ...s.settings, ...next };
      persist(STORAGE_KEYS.settings, mergedSettings);
      return { settings: mergedSettings };
    });
  },

  setActiveProfileTab: (profileId, tab) => {
    set((s) => {
      const next = {
        ...s.settings,
        profileTabs: { ...(s.settings.profileTabs ?? {}), [profileId]: tab },
      };
      persist(STORAGE_KEYS.settings, next);
      return { settings: next };
    });
  },

  setActiveSessionForProfile: (profileId, sessionId) => {
    set((s) => {
      const next = {
        ...s.settings,
        activeSessionId: { ...(s.settings.activeSessionId ?? {}), [profileId]: sessionId ?? '' },
      };
      persist(STORAGE_KEYS.settings, next);
      return { settings: next };
    });
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  getProfileById: (id) => get().profiles.find((p) => p.id === id),

  getSessionsForProfile: (profileId) =>
    Object.values(get().sessions)
      .filter((s) => s.profileId === profileId)
      .sort((a, b) => b.updatedAt - a.updatedAt),
}));