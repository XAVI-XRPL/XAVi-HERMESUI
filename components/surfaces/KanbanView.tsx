'use client';
import { useState } from 'react';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

interface Card {
  id: string;
  title: string;
  desc?: string;
}

export default function KanbanView() {
  const [columns, setColumns] = useState<Record<string, Card[]>>({
    'To Do': [
      { id: '1', title: 'Connect Ollama provider', desc: 'Set OLLAMA_ORIGINS="*" and test streaming' },
      { id: '2', title: 'Wire telemetry sidecar to Studio · Substrate', desc: 'VRAM + RAM meters go live here' },
    ],
    'In Progress': [
      { id: '3', title: 'Port Command Palette ⌘K', desc: 'Profile switcher + surface jumper' },
    ],
    'Review': [],
    'Done': [
      { id: '4', title: 'Scaffold Next.js 15 project', desc: '' },
      { id: '5', title: 'Port CSS design system verbatim from prototype', desc: '' },
    ],
  });
  const [newCard, setNewCard] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);

  function addCard(col: string) {
    if (!newCard.trim()) return;
    setColumns((c) => ({ ...c, [col]: [...(c[col] ?? []), { id: Date.now().toString(), title: newCard }] }));
    setNewCard('');
  }

  // Drag-to-move between columns
  function onDrop(col: string, e: React.DragEvent) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;
    setColumns((c) => {
      let moved: Card | undefined;
      const next = { ...c };
      for (const key of Object.keys(next)) {
        next[key] = (next[key] ?? []).filter((x) => { if (x.id === cardId) { moved = x; } return x.id !== cardId; });
      }
      if (moved) { next[col] = [...(next[col] ?? []), moved]; }
      return next;
    });
    setDragOver(null);
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('cardId', id);
  }

  return (
    <div className="px-10 pb-16">
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col}
               onDragOver={(e) => { e.preventDefault(); setDragOver(col); }}
               onDragLeave={() => setDragOver(null)}
               onDrop={(e) => onDrop(col, e)}
               className={`rounded-2xl p-4 hx-glass transition-all ${dragOver === col ? 'ring-1 ring-brass/30' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="hx-mono text-[10px] uppercase tracking-wider text-neutral-400">{col}</span>
              <span className="hx-mono text-[9.5px] hx-amber-dim bg-white/5 px-2 py-0.5 rounded-full">{(columns[col] ?? []).length}</span>
            </div>
            <div className="space-y-2 min-h-[80px]">
              {(columns[col] ?? []).map((card) => (
                <div key={card.id} draggable onDragStart={(e) => onDragStart(e, card.id)}
                     className="hx-glass rounded-xl px-3 py-2.5 text-left cursor-grab active:cursor-grabbing hover:bg-white/[0.03] transition">
                  <div className="text-[12.5px] text-neutral-100">{card.title}</div>
                  {card.desc && <div className="hx-mono text-[9.5px] hx-amber-dim mt-1 leading-snug">{card.desc}</div>}
                </div>
              ))}
            </div>
            <input
              placeholder={`+ add to ${col}`}
              value={newCard}
              onChange={(e) => setNewCard(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCard(col); }}
              className="mt-3 w-full bg-black/20 border hx-hairline rounded-lg px-2 py-1.5 text-[11px] text-neutral-300 placeholder:text-neutral-600 focus:border-brass/30 outline-none transition"
            />
          </div>
        ))}
      </div>

      {/* Wire hint */}
      <div className="mt-6 hx-mono text-[9.5px] uppercase tracking-wider text-neutral-700 text-center">
        kanban cards persist in sessionStorage · wire to hermes sessions for full automation
      </div>
    </div>
  );
}
