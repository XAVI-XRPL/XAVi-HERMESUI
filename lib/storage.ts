// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers — localStorage read/write (matches prototype keys)
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_KEYS } from '@/types';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[storage] write failed:', e);
  }
}

// Convenience wrappers for the three canonical stores
export const profilesStore = {
  load: <T>(fallback: T) => load<T>(STORAGE_KEYS.profiles, fallback),
  save: (v: unknown) => save(STORAGE_KEYS.profiles, v),
};

export const sessionsStore = {
  load: <T>(fallback: T) => load<T>(STORAGE_KEYS.sessions, fallback),
  save: (v: unknown) => save(STORAGE_KEYS.sessions, v),
};

export const settingsStore = {
  load: <T>(fallback: T) => load<T>(STORAGE_KEYS.settings, fallback),
  save: (v: unknown) => save(STORAGE_KEYS.settings, v),
};