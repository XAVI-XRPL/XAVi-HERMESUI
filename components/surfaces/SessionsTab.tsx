'use client';
import { useStudioStore } from '@/stores';
import type { Profile, Session } from '@/types';

function relTime(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return 'now';
  if (d < 3.6e6) return Math.floor(d / 60_000) + 'm';
  if (d < 8.64e7) return Math.floor(d / 3.6e6) + 'h';
  return Math.floor(d / 8.64e7) + 'd';
}

interface Props { profile: Profile; }

export default function SessionsTab({ profile }: Props) {
  const sessions = useStudioStore((s) => s.sessions);
  const setModeAndNavigate = useStudioStore((s) => s.setModeAndNavigate);
  const setActiveSessionForProfile = useStudioStore((s) => s.setActiveSessionForProfile);

  const profileSessions: Session[] = Object.values(sessions)
    .filter((s) => s.profileId === profile.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  function open(id: string) {
    setActiveSessionForProfile(profile.id, id);
    setModeAndNavigate('profile', profile.id, 'console');
  }

  return (
    <div className="px-10 pb-16 hx-fade-up">
      <div className="grid grid-cols-12 gap-6">
        {/* Session list */}
        <div className="col-span-8 space-y-2">
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Recent · {profileSessions.length}</div>
          {profileSessions.length === 0 ? (
            <div className="hx-glass rounded-2xl p-8 text-center">
              <div className="hx-serif italic text-[18px] text-neutral-500">No sessions yet.</div>
              <div className="hx-mono text-[9.5px] uppercase tracking-wider hx-amber-dim mt-1">open the console to begin</div>
            </div>
          ) : profileSessions.map((s) => (
            <button key={s.id} onClick={() => open(s.id)}
                    className="hx-glass w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.03] transition">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: profile.accent, boxShadow: `0 0 6px ${profile.accent}` }} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-neutral-100 truncate">{s.title}</div>
                <div className="hx-mono text-[9.5px] uppercase tracking-wider text-neutral-500">{s.turns.length} turns</div>
              </div>
              <span className="hx-mono text-[10px] hx-amber-dim shrink-0">{relTime(s.updatedAt)}</span>
            </button>
          ))}
        </div>

        {/* Cadence panel */}
        <div className="col-span-4">
          <div className="hx-glass rounded-2xl p-5">
            <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Cadence</div>
            <div className="hx-serif text-[44px] leading-none text-neutral-100">{profileSessions.length}<span className="hx-amber-dim text-[18px] ml-1">sessions</span></div>
            <div className="hx-mono text-[10px] uppercase tracking-wider hx-amber-dim mt-1">
              {profileSessions.reduce((a, s) => a + s.turns.length, 0)} turns · all time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
