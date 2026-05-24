'use client';
import { useState, useEffect, useMemo } from 'react';
import { useStudioStore } from '@/stores';

interface Props {
  onClose: () => void;
  onEditProfile: (p: import('@/types').Profile) => void;
}

const SHARED_SURFACES = [
  { id: 'mission',   label: 'Mission Control' },
  { id: 'memory',    label: 'Memory'           },
  { id: 'kanban',    label: 'Kanban'           },
  { id: 'journal',   label: 'Journal'          },
  { id: 'goals',     label: 'Goals'            },
  { id: 'studio',    label: 'Studio'           },
  { id: 'skills',    label: 'Skills'           },
  { id: 'settings',  label: 'Settings'         },
  { id: 'claw3d',    label: 'Claw3D · Office'  },
] as const;

function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function CommandPalette({ onClose, onEditProfile }: Props) {
  const profiles = useStudioStore((s) => s.profiles);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);

  const [q, setQ] = useState('');

  // Click backdrop to close
  function navigateToProfile(id: string) {
    setModeAndNavigate('profile', id, 'console');
    onClose();
  }
  function navigateToShared(id: string) {
    setModeAndNavigate('shared', id);
    onClose();
  }

  const qLower = q.toLowerCase();
  const filteredProfiles = profiles.filter(
    (p) => p.name.toLowerCase().includes(qLower) || p.role.toLowerCase().includes(qLower)
  );
  const filteredShared = SHARED_SURFACES.filter((s) => s.label.toLowerCase().includes(qLower));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center hx-fade-up"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(10px)' }}
    >
      <div className="w-[600px] max-w-[92vw]" onClick={(e) => e.stopPropagation()}>
        <div className="hx-glass-elevated rounded-2xl overflow-hidden">
          {/* Search input */}
          <div className="px-5 py-4 border-b hx-hairline flex items-center gap-3"
               style={{ background: 'rgba(10,10,14,.85)', backdropFilter: 'blur(20px)' }}>
            <span className="hx-amber-dim shrink-0"><IconSearch size={16} /></span>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Jump anywhere · run anything…"
                   className="flex-1 bg-transparent outline-none text-[15px] text-neutral-100 placeholder:text-neutral-600" />
            <kbd className="hx-key">ESC</kbd>
          </div>

          {/* Results */}
          <div className="p-2 max-h-[460px] overflow-y-auto hx-scroll">
            {filteredProfiles.length > 0 && (
              <>
                <div className="hx-mono text-[10px] uppercase tracking-[0.18em] hx-amber-dim px-3 py-2">Profiles</div>
                {filteredProfiles.map((p) => (
                  <button key={p.id}
                          onClick={() => navigateToProfile(p.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition text-left">
                    <div className="w-7 h-7 hx-orb shrink-0" style={{ '--accent': p.accent, '--accent-rgb': p.accentRGB } as React.CSSProperties} />
                    <div className="flex-1">
                      <div className="text-[13px] text-neutral-100">{p.name}</div>
                      <div className="hx-mono text-[10px] text-neutral-500">{p.role.toLowerCase()} · {p.connection.provider}</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {filteredShared.length > 0 && (
              <>
                <div className="hx-mono text-[10px] uppercase tracking-[0.18em] hx-amber-dim px-3 py-2 mt-1">Shared</div>
                {filteredShared.map((s) => (
                  <button key={s.id}
                          onClick={() => navigateToShared(s.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition text-left">
                    <div className="text-neutral-400 shrink-0">{s.label}</div>
                  </button>
                ))}
              </>
            )}

            {filteredProfiles.length === 0 && filteredShared.length === 0 && q.trim() && (
              <div className="px-3 py-6 text-center hx-serif italic text-[16px] text-neutral-500">
                nothing matched "{q}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
