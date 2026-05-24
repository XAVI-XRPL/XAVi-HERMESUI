'use client';
// Profile Console — streaming chat tab (port of prototype ConsoleTab)
// Uses: useStudioStore, streamChat from @/lib/providers
import { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '@/stores';
import type { Profile, Session, Turn } from '@/types';
import { streamChat } from '@/lib/providers';

function relTime(ts: number) {
  const d = Date.now() - ts;
  if (d < 60_000) return 'now';
  if (d < 3.6e6) return Math.floor(d / 60_000) + 'm';
  if (d < 8.64e7) return Math.floor(d / 3.6e6) + 'h';
  return Math.floor(d / 8.64e7) + 'd';
}

interface Props { profile: Profile; }

export default function ProfileConsole({ profile }: Props) {
  const sessions   = useStudioStore((s) => s.sessions);
  const upsertSession = useStudioStore((s) => s.upsertSession);
  const clearSession  = useStudioStore((s) => s.clearSession);

  const sessionIdKey = `activeSessionId.${profile.id}`;
  // We'll manage active session in local state only
  const [activeSid, setActiveSid] = useState<string | null>(null);
  const [input, setInput]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const abortRef            = useRef<AbortController | null>(null);
  const scrollRef           = useRef<HTMLDivElement>(null);

  // All sessions for this profile sorted newest-first
  const allSessions = Object.values(sessions)
    .filter((s) => s.profileId === profile.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const activeSession = activeSid ? sessions[activeSid] : null;

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeSession?.turns.length, busy]);

  // Auto-select most recent session on mount
  useEffect(() => {
    if (!activeSid && allSessions.length > 0) {
      setActiveSid(allSessions[0].id);
    }
  }, [allSessions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function ensureSession(): Session {
    const now = Date.now();
    if (activeSession) return activeSession;
    const id = 'sess_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
    const s: Session = { id, profileId: profile.id, title: 'New session', createdAt: now, updatedAt: now, turns: [] };
    upsertSession(s);
    setActiveSid(id);
    return s;
  }

  async function send() {
    if (!input.trim() || busy) return;
    const userText = input.trim();
    setInput('');
    setError(null);

    const s   = ensureSession();
    const uid = 'turn_' + Date.now().toString(36);
    const aid = 'turn_' + (Date.now() + 1).toString(36);
    const now = Date.now();

    // Append user turn immediately
    const userTurn: Turn = { id: uid, role: 'user', content: userText, ts: now };
    upsertSession({ ...s, turns: [...s.turns, userTurn], title: s.title === 'New session' ? userText.slice(0, 60) : s.title, updatedAt: now });

    // Append empty assistant turn
    const asstTurn: Turn = { id: aid, role: 'assistant', content: '', ts: now, streaming: true };
    upsertSession({ ...s, turns: [...s.turns, userTurn, asstTurn] });

    setBusy(true);
    abortRef.current = new AbortController();
    const t0 = performance.now();

    try {
      const history = [userText]; // simplified — just current message for now
      let acc = '';
      for await (const delta of streamChat(profile, [{ role: 'user', content: userText }], abortRef.current.signal)) {
        acc += delta;
        setActiveSid((prev) => prev); // trigger re-render by switching ref
        upsertSession({ ...s, turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) => t.id === aid ? { ...t, content: acc } : t), updatedAt: Date.now() });
      }
      // Finalize turn with latency + stop streaming
      const finalTurn = (sessions[s.id]?.turns ?? []).find((t) => t.id === aid);
      if (finalTurn) {
        upsertSession({ ...s, turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) => t.id === aid ? { ...t, streaming: false, latencyMs: Math.round(performance.now() - t0), content: acc } : t), updatedAt: Date.now() });
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      setError(err);
      upsertSession({ ...s, turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) => t.id === aid ? { ...t, streaming: false, content: '⚠️ ' + err, error: true } : t), updatedAt: Date.now() });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() { abortRef.current?.abort(); setBusy(false); }

  return (
    <div className="px-10 pb-16 hx-fade-up">
      {/* Session list + console split */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sessions sidebar (col-span-3) */}
        <div className="col-span-3">
          <button
            onClick={() => { setActiveSid(null); }}
            className="hx-pill w-full rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-[12px] mb-3 hx-amber-dim"
          >
            + New session
          </button>
          <div className="space-y-1">
            {allSessions.map((s) => {
              const active = s.id === activeSid;
              return (
                <button key={s.id} onClick={() => setActiveSid(s.id)}
                  className={"w-full rounded-xl px-3 py-2.5 text-left transition-all " + (active ? "hx-glass hx-pill-active" : "hover:bg-white/[0.03]")}>
                  <div className="text-[12px] truncate">{s.title}</div>
                  <div className="hx-mono text-[9.5px] uppercase tracking-wider hx-amber-dim mt-0.5">
                    {s.turns.length} turns · {relTime(s.updatedAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main chat area (col-span-9) */}
        <div className="col-span-9 hx-glass-elevated rounded-3xl overflow-hidden flex flex-col"
             style={{ maxHeight: '72vh' }}>
          {/* Chat header */}
          <div className="px-6 py-4 border-b hx-hairline flex items-center justify-between"
               style={{ background: `linear-gradient(180deg, rgba(${profile.accentRGB},.04), transparent)` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 hx-orb shrink-0" style={{ '--accent': profile.accent, '--accent-rgb': profile.accentRGB } as React.CSSProperties} />
              <div>
                <div className="text-[14px] font-medium" style={{ color: profile.accent }}>{profile.name}</div>
                <div className="hx-mono text-[9.5px] uppercase tracking-wider text-neutral-500">
                  {activeSession?.title ?? 'New session'} · {profile.connection.modelId || profile.connection.provider}
                </div>
              </div>
            </div>
            <button onClick={() => activeSid && clearSession(activeSid)} className="hx-mono text-[10px] uppercase tracking-wider text-neutral-500 hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-white/5">
              Clear
            </button>
          </div>

          {/* Message scroll area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto hx-scroll px-8 py-6 space-y-5"
               style={{ maxHeight: '56vh' }}>
            {!activeSession || activeSession.turns.length === 0 ? (
              <div className="text-center py-10">
                <div className="hx-serif italic text-[20px] text-neutral-500">Empty page.</div>
                <div className="hx-mono text-[10px] hx-amber-dim uppercase tracking-[0.2em] mt-2">say anything to begin</div>
              </div>
            ) : activeSession.turns.map((t) =>
              t.role === 'user' ? (
                <div key={t.id} className="flex justify-end">
                  <div className="max-w-[80%] flex items-start gap-2">
                    <div className="hx-glass rounded-2xl rounded-tr-md px-4 py-2.5 text-[13.5px] text-neutral-100 leading-relaxed whitespace-pre-wrap">{t.content}</div>
                    <div className="hx-pill rounded-md px-1.5 py-0.5 hx-mono text-[9px] uppercase tracking-wider text-neutral-500 mt-1 shrink-0">you</div>
                  </div>
                </div>
              ) : (
                <div key={t.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 hx-orb shrink-0 mt-0.5" style={{ '--accent': profile.accent, '--accent-rgb': profile.accentRGB } as React.CSSProperties} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-medium" style={{ color: profile.accent }}>{profile.name}</span>
                      {t.latencyMs && <span className="hx-mono text-[9px] hx-amber-dim uppercase tracking-wider">· {(t.latencyMs / 1000).toFixed(2)}s</span>}
                    </div>
                    <div className={"text-[14px] leading-[1.65] whitespace-pre-wrap " + (t.error ? 'text-red-300' : 'text-neutral-200')}>
                      {t.content}{t.streaming && <span className="hx-caret" style={{ color: profile.accent }} />}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Error bar */}
          {error && (
            <div className="px-8 py-3 border-t hx-hairline">
              <div className="hx-mono text-[10px] uppercase tracking-wider text-red-400">⚠ {error}</div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4">
            <div className="hx-glass rounded-2xl p-3 flex items-end gap-3"
                 style={{ boxShadow: `0 0 0 1px rgba(${profile.accentRGB},.08), 0 8px 24px rgba(0,0,0,.3)` }}>
              <textarea rows={2} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send(); } }}
                placeholder={`Message ${profile.name}…  (⌘+⏎)`}
                className="flex-1 bg-transparent outline-none resize-none text-[14px] text-neutral-100 placeholder:text-neutral-600 pt-1.5" />
              {busy ? (
                <button onClick={stop} className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/30 border border-red-400/40">
                  <span className="block w-2.5 h-2.5 bg-red-300" />
                </button>
              ) : (
                <button onClick={send} disabled={!input.trim()}
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-30"
                        style={{ background: `linear-gradient(180deg, ${profile.accent}, rgba(${profile.accentRGB},.7))`, boxShadow: `0 4px 12px rgba(${profile.accentRGB},.4), inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 1px rgba(0,0,0,.2)` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-black/80">
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
