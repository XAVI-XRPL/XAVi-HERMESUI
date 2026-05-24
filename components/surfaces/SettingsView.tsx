'use client';
// Settings view — provider config, Claw3D URL, export/import data
'use client';

import { useState } from 'react';
import { useStudioStore } from '@/stores';
import type { Profile } from '@/types';
import { load, save } from '@/lib/storage';
import { STORAGE_KEYS } from '@/types';

function KVRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b hx-hairline last:border-0 text-[12px]">
      <span className="text-neutral-500">{k}</span>
      <span className="hx-mono text-[11px] text-neutral-200">{v}</span>
    </div>
  );
}

export default function SettingsView() {
  const profiles = useStudioStore((s) => s.profiles);
  const settings = useStudioStore((s) => s.settings);

  // We'll manage claw3d URL via a local copy and push to store on commit
  const [claw3dUrl, setClaw3dUrl] = useState(settings.claw3dUrl ?? 'http://localhost:3000/office');
  const [exportData, setExportData] = useState('');

  function doExport() {
    const allSessions = load('object', {});
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.sessions);
      if (raw) { /* already loaded */ }
    } catch {}
    // Simple full export
    setExportData(JSON.stringify({ profiles, settings }, null, 2));
  }

  function doImport() {
    const txt = prompt('Paste full export JSON:');
    if (!txt) return;
    try {
      const p = JSON.parse(txt);
      if (p.profiles) save(STORAGE_KEYS.profiles, p.profiles);
      if (p.settings) save(STORAGE_KEYS.settings, p.settings);
      alert('Imported. Refresh the page.');
      location.reload();
    } catch (e: unknown) {
      alert('Bad JSON: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  function doReset() {
    if (!confirm('Reset ALL profiles and sessions? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEYS.profiles);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    location.reload();
  }

  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  function editProfile(p: Profile) {
    setModeAndNavigate('profile', p.id, 'config');
  }

  return (
    <div className="px-10 pb-16 grid grid-cols-12 gap-5">
      {/* Left column */}
      <div className="col-span-8 space-y-4">
        {/* Profiles list */}
        <div className="hx-glass rounded-2xl p-6 hx-fade-up">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Profiles</span>
          <div className="space-y-2">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition">
                <div className="w-7 h-7 hx-orb shrink-0" style={{ '--accent': p.accent, '--accent-rgb': p.accentRGB } as React.CSSProperties} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-neutral-100">{p.name}</div>
                  <div className="hx-mono text-[10px] hx-amber-dim truncate">{p.connection.endpoint} · {p.connection.modelId || '—'}</div>
                </div>
                <button onClick={() => editProfile(p)}
                        className="hx-pill px-3 py-1.5 rounded-md text-[11px] flex items-center gap-1.5 text-neutral-300">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Claw3D URL */}
        <div className="hx-glass rounded-2xl p-6 hx-fade-up">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Claw3D</span>
          <input value={claw3dUrl} onChange={(e) => setClaw3dUrl(e.target.value)}
                 className="w-full bg-black/30 rounded-lg px-3 py-2 border hx-hairline text-neutral-200 text-[12px] hx-mono" />
          <div className="hx-mono text-[10px] uppercase tracking-wider hx-amber-dim mt-2">
            default: http://localhost:3000/office
          </div>
        </div>

        {/* Data panel */}
        <div className="hx-glass rounded-2xl p-6 hx-fade-up">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Data</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={doExport} className="hx-pill px-4 py-2 rounded-lg text-[12px] text-neutral-200">Export JSON</button>
            <button onClick={doImport} className="hx-pill px-4 py-2 rounded-lg text-[12px] text-neutral-200">Import JSON</button>
            <button onClick={doReset}  className="hx-pill px-4 py-2 rounded-lg text-[12px] text-red-300">Reset all</button>
          </div>
          {exportData && (
            <textarea readOnly value={exportData} rows={6}
                      className="mt-3 w-full bg-black/30 rounded-lg p-3 hx-mono text-[11px] text-neutral-300 border hx-hairline" />
          )}
        </div>
      </div>

      {/* Right column — About */}
      <div className="col-span-4">
        <div className="hx-glass rounded-2xl p-5 hx-fade-up sticky top-10">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">About</span>
          <div className="hx-serif italic text-[15px] text-neutral-400 leading-snug">
            Hermes · studio v0.1 — literary control plane for the Hermes agent runtime.
          </div>
          <div className="mt-4 pt-4 border-t hx-hairline space-y-2">
            {[
              ['Storage', 'localStorage'],
              ['Build',   'next.js 16 + tauri'],
              ['Stack',   'OAI-compat providers'],
              ['Timezone','EST · NEW YORK'],
            ].map(([k, v]) => <KVRow key={k} k={k} v={v} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
