'use client';

import { useStudioStore } from '@/stores';

// SharedMemoryView — shows entries from the shared per-profile vector store.
// Data comes from localStorage; real implementation would query a vector DB.

interface MemoryEntry {
  id: string;
  content: string;
  ts: number;
  tags: string[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5a5a52" strokeWidth={1.2}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <p className="hx-serif italic text-neutral-500 text-lg">Memory is empty</p>
      <p className="hx-mono text-[10px] uppercase tracking-wider text-neutral-600">
        Memories are created during sessions
      </p>
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span
      className="hx-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded"
      style={{
        background: 'rgba(201,167,108,.12)',
        border: '1px solid rgba(201,167,108,.28)',
        color: '#c9a76c',
      }}
    >
      {label}
    </span>
  );
}

export default function SharedMemoryView() {
  const sessions = useStudioStore((s) => s.sessions);

  // Derive "memory entries" from session titles and first-turn content as a proxy.
  // Real implementation: query vector store with an embedder.
  const entries: MemoryEntry[] = Object.values(sessions)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 20)
    .map((s) => ({
      id: s.id,
      content:
        s.turns[0]?.content ??
        `Session — ${s.title}`,
      ts: s.createdAt,
      tags: [new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short' })],
    }));

  return (
    <div className="px-10 pb-12">
      {/* Not yet wired notice */}
      <div
        className="rounded-xl px-4 py-3 hx-mono text-[9.5px] uppercase tracking-wider mb-8"
        style={{
          background: 'rgba(201,167,108,.06)',
          border: '1px solid rgba(201,167,108,.18)',
          color: '#8c7449',
        }}
      >
        Vector store not yet wired — showing session titles as memory proxies
      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {entries.map((e) => (
            <div
              key={e.id}
              className="hx-glass rounded-xl p-5"
              style={{ borderColor: 'rgba(255,255,255,.06)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-[13px] text-neutral-200 leading-relaxed flex-1">
                  {e.content.length > 160
                    ? e.content.slice(0, 160) + '…'
                    : e.content}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {e.tags.map((t) => (
                  <TagPill key={t} label={t} />
                ))}
                <span className="hx-mono text-[9px] hx-amber-dim ml-auto">
                  {new Date(e.ts).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}