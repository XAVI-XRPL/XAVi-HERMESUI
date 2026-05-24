'use client';
import { useState } from 'react';

interface Entry {
  id: string;
  ts: number; // Date.now()
  content: string;
}

export default function JournalView() {
  const [entries, setEntries] = useState<Entry[]>([
    { id: '1', ts: Date.now() - 86400000, content: 'Hermes Studio scaffolded. Next.js 15 + Tauri 2 foundation laid.' },
    { id: '2', ts: Date.now() - 172800000, content: 'Bankr Ecosystem Pulse cron job activated — daily Base L2 AI coin digest at 9am EST.' },
  ]);
  const [draft, setDraft] = useState('');

  function addEntry() {
    if (!draft.trim()) return;
    setEntries((e) => [{ id: Date.now().toString(), ts: Date.now(), content: draft }, ...e]);
    setDraft('');
  }

  function relDay(ts: number): string {
    const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'long', day: 'numeric' }).format(new Date(ts));
    return d;
  }

  return (
    <div className="px-10 pb-16 hx-fade-up">
      {/* New entry composer */}
      <div className="hx-glass rounded-2xl p-5 mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="What happened today… (Enter to save, Shift+Enter for newline)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addEntry(); }
          }}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-neutral-100 placeholder:text-neutral-600 leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="hx-mono text-[9.5px] hx-amber-dim uppercase tracking-wider">EST · NEW YORK</span>
          <button onClick={addEntry} disabled={!draft.trim()}
                  className="hx-pill px-4 py-1.5 rounded-lg text-[11px] flex items-center gap-2 disabled:opacity-30 hx-amber">
            Save entry
          </button>
        </div>
      </div>

      {/* Entry list */}
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="hx-glass rounded-xl p-5 hover:bg-white/[0.02] transition">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 rounded-full bg-brass/40 inline-block" />
              <span className="hx-mono text-[9.5px] uppercase tracking-wider hx-amber-dim">{relDay(e.ts)}</span>
            </div>
            <p className="text-[13.5px] text-neutral-300 leading-relaxed">{e.content}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="hx-glass rounded-2xl p-12 text-center">
          <div className="hx-serif italic text-[20px] text-neutral-500">No entries yet.</div>
          <div className="hx-mono text-[10px] hx-amber-dim uppercase tracking-wider mt-2">begin your log above</div>
        </div>
      )}
    </div>
  );
}
