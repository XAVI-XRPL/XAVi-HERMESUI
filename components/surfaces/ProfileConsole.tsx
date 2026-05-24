'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Profile Console — Glass card chat surface
// - Rendered inside the profile page (not full-screen)
// - Glass card container with profile header inside
// - Centered message column with premium glassmorphic styling
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useStudioStore } from '@/stores';
import type { Profile, Session, Turn } from '@/types';
import { streamChat } from '@/lib/providers';

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(ts));
}

interface Props { profile: Profile; }

export default function ProfileConsole({ profile }: Props) {
  const sessions   = useStudioStore((s) => s.sessions);
  const upsertSession = useStudioStore((s) => s.upsertSession);
  const clearSession  = useStudioStore((s) => s.clearSession);

  // Active session state
  const [activeSid, setActiveSid]   = useState<string | null>(null);
  const [input, setInput]           = useState('');
  const [busy, setBusy]             = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const abortRef                    = useRef<AbortController | null>(null);
  const scrollRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);

  // All sessions for this profile
  const allSessions = Object.values(sessions)
    .filter((s) => s.profileId === profile.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const activeSession = activeSid ? sessions[activeSid] : null;

  // Auto-select most recent session
  useEffect(() => {
    if (!activeSid && allSessions.length > 0) setActiveSid(allSessions[0].id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeSession?.turns.length, busy]);

  function ensureSession(): Session {
    if (activeSession) return activeSession;
    const now  = Date.now();
    const id   = 'sess_' + now.toString(36) + Math.random().toString(36).slice(2, 6);
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

    // User turn
    const userTurn: Turn = { id: uid, role: 'user', content: userText, ts: now };
    upsertSession({ ...s,
      turns: [...s.turns, userTurn],
      title: s.title === 'New session' ? userText.slice(0, 60) : s.title,
      updatedAt: now,
    });

    // Assistant placeholder
    const asstTurn: Turn = { id: aid, role: 'assistant', content: '', ts: now, streaming: true };
    upsertSession({ ...s, turns: [...s.turns, userTurn, asstTurn] });

    setBusy(true);
    abortRef.current = new AbortController();

    try {
      let acc = '';
      for await (const delta of streamChat(profile, [{ role: 'user', content: userText }], abortRef.current.signal)) {
        acc += delta;
        upsertSession({ ...s,
          turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) =>
            t.id === aid ? { ...t, content: acc } : t
          ),
          updatedAt: Date.now(),
        });
      }
      // Finalize
      upsertSession({ ...s,
        turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) =>
          t.id === aid ? { ...t, streaming: false, content: acc } : t
        ),
        updatedAt: Date.now(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      upsertSession({ ...s,
        turns: [...(sessions[s.id]?.turns ?? s.turns)].map((t) =>
          t.id === aid ? { ...t, streaming: false, content: '\u26a0\ufe0f ' + msg, error: true } : t
        ),
        updatedAt: Date.now(),
      });
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() { abortRef.current?.abort(); setBusy(false); }

  // ── Render messages ─────────────────────────────────────────────────────────

  const turns = activeSession?.turns ?? [];

  return (
    <div className="px-10 pb-10 pt-6">
      {/* ── Glass Card Container ──────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(140deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.015) 100%)',
          backdropFilter: 'blur(22px) saturate(160%)',
          border: '1px solid rgba(255,255,255,.06)',
          boxShadow: '0 1px 0 rgba(255,255,255,.06) inset, 0 8px 32px rgba(0,0,0,.32), 0 1px 2px rgba(0,0,0,.4)',
          minHeight: 'calc(100vh - 280px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-3 px-5 py-3 shrink-0"
          style={{
            borderBottom: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(0,0,0,.2)',
          }}
        >
          {/* Profile orb */}
          <div
            className="w-6 h-6 rounded-full shrink-0"
            style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
              boxShadow: `0 0 12px rgba(${profile.accentRGB},.4)`,
            }}
          />
          <span className="text-[13px] font-medium" style={{ color: profile.accent }}>
            {profile.name}
          </span>
          <span className="hx-mono text-[10px]" style={{ color: '#5a5a52' }}>
            {activeSession ? activeSession.title.slice(0, 35) : 'NEW SESSION'}
          </span>
          <span className="hx-mono text-[9px] uppercase tracking-wider" style={{ color: '#4a4a42' }}>
            • {profile.connection.provider === 'lm-studio' ? 'LM STUDIO' : profile.connection.provider.toUpperCase()}
          </span>

          <div className="flex-1" />

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: busy ? profile.accent : (profile.status === 'connected' ? '#7FE38E' : '#5a5a52'),
                boxShadow: busy ? `0 0 6px rgba(${profile.accentRGB},.5)` : 'none',
              }}
            />
            <span className="hx-mono text-[10px]" style={{ color: '#4a4a42' }}>
              {busy ? 'thinking...' : profile.connection.modelId || 'idle'}
            </span>
          </div>

          {/* New session button */}
          <button
            onClick={() => setActiveSid(null)}
            className="hx-mono text-[10px] px-2.5 py-1 rounded-lg transition hover:bg-white/[0.06]"
            style={{ color: '#7a7a72' }}
          >
            NEW
          </button>
        </div>

        {/* Messages area */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto hx-scroll">
          <div className="mx-auto" style={{ maxWidth: 768, padding: '24px 24px 8px' }}>
            {turns.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-start pt-16 pb-8">
                <div
                  className="w-14 h-14 rounded-full mb-5"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
                    boxShadow: `0 0 40px rgba(${profile.accentRGB},.25)`,
                  }}
                />
                <h1 className="hx-serif text-[28px] text-center mb-2" style={{ color: '#e8e8e3' }}>
                  {profile.role || profile.name}
                </h1>
                <p className="text-[13.5px] text-center max-w-sm leading-relaxed" style={{ color: '#7a7a72' }}>
                  Ask anything — or press <kbd className="hx-key mx-0.5">⏎</kbd> to send.
                </p>
              </div>
            ) : (
              /* Message thread */
              <div className="py-4 space-y-6">
                {turns.map((t) =>
                  t.role === 'user' ? (
                    /* User message */
                    <div key={t.id} className="flex justify-end">
                      <div
                        className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-3"
                        style={{
                          background: 'rgba(255,255,255,.07)',
                          border: '1px solid rgba(255,255,255,.1)',
                        }}
                      >
                        <p className="text-[14px] leading-[1.65] whitespace-pre-wrap" style={{ color: '#e8e8e3' }}>
                          {t.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant message */
                    <div key={t.id} className="flex gap-0 justify-start">
                      <div
                        className="w-7 h-7 rounded-full shrink-0 mt-1 mr-3"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
                        }}
                      />
                      <div className="flex-1 min-w-0 max-w-[85%]">
                        <p className="text-[14.5px] leading-[1.75] whitespace-pre-wrap" style={{ color: t.error ? '#fca5a5' : '#e8e8e3' }}>
                          {t.content}
                          {t.streaming && (
                            <span
                              className="inline-block w-2 h-3.5 ml-0.5 align-middle animate-pulse"
                              style={{ background: profile.accent, borderRadius: 2, opacity: 0.8 }}
                            />
                          )}
                        </p>
                        {t.latencyMs && !t.streaming && (
                          <span className="hx-mono text-[10px] mt-1 block" style={{ color: '#5a5a52' }}>
                            {(t.latencyMs / 1000).toFixed(2)}s
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Error banner */}
                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-[13px]"
                    style={{
                      background: 'rgba(239,68,68,.12)',
                      border: '1px solid rgba(239,68,68,.25)',
                      color: '#fca5a5',
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>
        </main>

        {/* Input area */}
        <footer
          className="shrink-0 px-5 py-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(0,0,0,.15)',
          }}
        >
          <div className="flex items-end gap-2 rounded-2xl px-4 py-3"
               style={{
                 background: 'rgba(255,255,255,.04)',
                 border: '1px solid rgba(255,255,255,.08)',
               }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                  if (inputRef.current) inputRef.current.style.height = 'auto';
                }
              }}
              placeholder={`Message ${profile.name}...`}
              className="flex-1 bg-transparent outline-none resize-none text-[14.5px] leading-relaxed placeholder:text-neutral-600"
              style={{ color: '#e8e8e3', maxHeight: 200, minHeight: 24 }}
            />

            {busy ? (
              <button
                onClick={stop}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{
                  background: 'rgba(239,68,68,.2)',
                  border: '1px solid rgba(239,68,68,.3)',
                }}
              >
                <span className="block w-2.5 h-2.5 rounded-sm" style={{ background: '#fca5a5' }} />
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!input.trim()}
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-25"
                style={{
                  background: `linear-gradient(180deg, ${profile.accent}, rgba(${profile.accentRGB},.7))`,
                  boxShadow: `0 2px 8px rgba(${profile.accentRGB},.35)`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="#000" strokeWidth={2} className="translate-y-[-1px]">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>

          <p className="text-center mt-2 hx-mono" style={{ fontSize: '10px', color: '#3a3a36' }}>
            {profile.connection.modelId || profile.connection.provider} • enter send • shift+enter newline
          </p>
        </footer>
      </div>
    </div>
  );
}
