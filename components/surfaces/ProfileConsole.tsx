'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Profile Console — ChatGPT-style full-screen chat
// - Centered message column (~768px max)
// - User: right-aligned bubble | Assistant: left-aligned, no bubble
// - Sidebar hidden by default; slide-out drawer via hamburger
// - Minimal top bar: profile name + status dot
// - Clean bottom input fixed to viewport
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          t.id === aid ? { ...t, streaming: false, content: '⚠️ ' + msg, error: true } : t
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
    <div className="flex h-full" style={{ background: 'var(--bg)' }}>
      {/* ── Session Sidebar Drawer ─────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 bottom-0 z-40 w-[280px] overflow-y-auto border-r"
            style={{
              background: '#111115',
              borderColor: 'rgba(255,255,255,.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-5 sticky top-0 z-10"
                 style={{ background: '#111115', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span className="text-[13px] font-medium text-neutral-200">Sessions</span>
              <button
                onClick={() => { setActiveSid(null); setSidebarOpen(false); }}
                className="text-[11px] px-3 py-1.5 rounded-lg transition"
                style={{ color: 'var(--accent)', background: 'rgba(201,167,108,.12)' }}
              >
                + New
              </button>
            </div>

            {/* Session list */}
            <div className="p-2 space-y-0.5">
              {allSessions.map((s) => {
                const active = s.id === activeSid;
                return (
                  <button key={s.id}
                    onClick={() => { setActiveSid(s.id); setSidebarOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl transition"
                    style={{
                      background: active ? 'rgba(201,167,108,.12)' : 'transparent',
                    }}
                  >
                    <div className="text-[12.5px] truncate" style={{ color: active ? '#e8e8e3' : '#9a9a92' }}>
                      {s.title}
                    </div>
                    <div className="hx-mono text-[10px] mt-0.5"
                         style={{ color: 'var(--brass-dim)' }}>
                      {s.turns.length} turns
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear session */}
            {activeSid && (
              <div className="p-3 sticky bottom-0" style={{ background: '#111115' }}>
                <button
                  onClick={() => { clearSession(activeSid); }}
                  className="w-full text-[11px] py-2 rounded-xl transition"
                  style={{ color: '#9a9a92', border: '1px solid rgba(255,255,255,.06)' }}
                >
                  Clear session
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* ── Main Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar — minimal: hamburger + profile name */}
        <header
          className="flex items-center gap-3 px-4 shrink-0"
          style={{
            height: 52,
            borderBottom: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(10,10,14,.8)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg transition hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ color: '#9a9a92' }}>
              {sidebarOpen
                ? <path d="M6 18L18 6M6 6l12 12" />
                : <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
              }
            </svg>
          </button>

          {/* Profile indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full shrink-0"
              style={{
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
              }}
            />
            <div>
              <div className="text-[13px] font-medium" style={{ color: profile.accent }}>{profile.name}</div>
              {activeSession && (
                <div className="hx-mono text-[9.5px]" style={{ color: 'var(--brass-dim)' }}>
                  {activeSession.title.slice(0, 40)}{activeSession.title.length > 40 ? '…' : ''}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1" />

          {/* Status dot */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: busy ? '#c9a76c' : (profile.status === 'connected' ? '#7FE38E' : '#5a5a52') }}
            />
            <span className="hx-mono text-[10px]" style={{ color: 'var(--brass-dim)' }}>
              {busy ? 'thinking…' : profile.connection.modelId || profile.connection.provider}
            </span>
          </div>
        </header>

        {/* Messages — scrollable, centered column */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto">
          <div
            className="mx-auto"
            style={{ maxWidth: 768, padding: '0 16px' }}
          >
            {turns.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-start pt-24 pb-8">
                {/* Profile orb */}
                <div
                  className="w-14 h-14 rounded-full mb-5"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
                    boxShadow: `0 0 40px rgba(${profile.accentRGB},.25)`,
                  }}
                />
                <h1
                  className="hx-serif text-[28px] text-center mb-2"
                  style={{ color: '#e8e8e3' }}
                >
                  {profile.role || profile.name}
                </h1>
                <p
                  className="text-[13.5px] text-center max-w-sm leading-relaxed"
                  style={{ color: 'var(--brass-dim)' }}
                >
                  Ask anything — or press <kbd className="hx-key mx-0.5">⏎</kbd> to send.
                </p>
              </div>
            ) : (
              /* Message thread */
              <div className="py-6 space-y-6">
                {turns.map((t) =>
                  t.role === 'user' ? (
                    /* ── User message — right-aligned bubble ─────────────────── */
                    <div key={t.id} className="flex justify-end">
                      <div
                        className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-3"
                        style={{
                          background: 'rgba(255,255,255,.07)',
                          border: '1px solid rgba(255,255,255,.1)',
                        }}
                      >
                        <p
                          className="text-[14px] leading-[1.65] whitespace-pre-wrap"
                          style={{ color: '#e8e8e3' }}
                        >
                          {t.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ── Assistant message — left-aligned, clean ─────────────── */
                    <div key={t.id} className="flex gap-0 justify-start">
                      {/* Avatar */}
                      <div
                        className="w-7 h-7 rounded-full shrink-0 mt-1 mr-3"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,.9) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${profile.accent} 0%, ${profile.accent}88)`,
                        }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0 max-w-[85%]">
                        <p
                          className="text-[14.5px] leading-[1.75] whitespace-pre-wrap"
                          style={{ color: t.error ? '#fca5a5' : '#e8e8e3' }}
                        >
                          {t.content}
                          {t.streaming && (
                            <span
                              className="inline-block w-2 h-3.5 ml-0.5 align-middle animate-pulse"
                              style={{ background: profile.accent, borderRadius: 2, opacity: 0.8 }}
                            />
                          )}
                        </p>
                        {t.latencyMs && !t.streaming && (
                          <span className="hx-mono text-[10px] mt-1 block" style={{ color: 'var(--brass-dim)' }}>
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

            {/* Bottom padding so input isn't covered on scroll */}
            <div style={{ height: 8 }} />
          </div>
        </main>

        {/* Input area — fixed to bottom of chat column */}
        <footer
          className="shrink-0 px-4 pb-6"
          style={{
            borderTop: '1px solid rgba(255,255,255,.05)',
            background: 'rgba(10,10,14,.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="mx-auto" style={{ maxWidth: 768 }}>
            {/* Input wrapper */}
            <div
              className="flex items-end gap-2 rounded-2xl px-4 py-3 mt-3"
              style={{
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize height
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                    // Reset height
                    if (inputRef.current) inputRef.current.style.height = 'auto';
                  }
                }}
                placeholder={`Message ${profile.name}…`}
                className="flex-1 bg-transparent outline-none resize-none text-[14.5px] leading-relaxed placeholder:text-neutral-600"
                style={{ color: '#e8e8e3', maxHeight: 200, minHeight: 24 }}
              />

              {/* Send / Stop button */}
              {busy ? (
                <button
                  onClick={stop}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition"
                  style={{
                    background: 'rgba(239,68,68,.2)',
                    border: '1px solid rgba(239,68,68,.3)',
                  }}
                >
                  <span
                    className="block w-2.5 h-2.5 rounded-sm"
                    style={{ background: '#fca5a5' }}
                  />
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

            {/* Hint */}
            <p
              className="text-center mt-2 hx-mono"
              style={{ fontSize: '10px', color: '#3a3a36' }}
            >
              {profile.connection.modelId || profile.connection.provider} · ⏎ send · shift+⏎ newline
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}