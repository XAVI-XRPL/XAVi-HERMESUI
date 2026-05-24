'use client';
import { useState } from 'react';

interface Goal {
  id: string;
  title: string;
  desc?: string;
  progress: number; // 0-100
  status: 'active' | 'done' | 'deferred';
}

export default function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Ship Hermes Studio v0.1', desc: 'Next.js + Tauri 2 app matching the prototype spec', progress: 65, status: 'active' },
    { id: '2', title: 'Wire telemetry sidecar — live GPU/RAM meters', progress: 20, status: 'active' },
    { id: '3', title: 'Daily Bankr Ecosystem digest via Hermes cron', desc: 'Base L2 AI coin news at 9am EST to Telegram', progress: 80, status: 'done' },
  ]);
  const [newGoal, setNewGoal] = useState('');

  function add() {
    if (!newGoal.trim()) return;
    setGoals((g) => [...g, { id: Date.now().toString(), title: newGoal, progress: 0, status: 'active' }]);
    setNewGoal('');
  }

  const STATUS_COLORS = { active: '#c9a76c', done: '#7FE38E', deferred: '#5a5a52' };
  const STATUS_LABELS = { active: 'Active', done: 'Completed', deferred: 'Deferred' };

  return (
    <div className="px-10 pb-16 hx-fade-up">
      {/* Add goal */}
      <div className="flex gap-3 mb-6">
        <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
               placeholder="New goal…"
               className="flex-1 bg-black/30 border hx-hairline rounded-xl px-4 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-brass/25 transition" />
        <button onClick={add} disabled={!newGoal.trim()} className="hx-pill px-4 py-2 rounded-xl text-[12px] text-neutral-200 disabled:opacity-30 hx-pill-active">
          + Add
        </button>
      </div>

      {/* Goal list */}
      <div className="space-y-3">
        {goals.map((g) => (
          <div key={g.id} className="hx-glass rounded-xl p-5 hover:bg-white/[0.02] transition">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[14px] text-neutral-100 font-medium">{g.title}</span>
                {g.desc && <p className="hx-mono text-[10px] hx-amber-dim mt-1 leading-snug">{g.desc}</p>}
              </div>
              <span className="shrink-0 hx-pill rounded-full px-2.5 py-1 text-[9px] uppercase tracking-wider"
                    style={{ color: STATUS_COLORS[g.status], background: `${STATUS_COLORS[g.status]}18`, borderColor: `${STATUS_COLORS[g.status]}40` }}>
                {STATUS_LABELS[g.status]}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                   style={{ width: `${g.progress}%`, background: STATUS_COLORS[g.status] }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="hx-mono text-[9px] hx-amber-dim uppercase tracking-wider">{g.progress}%</span>
              {/* Progress controls */}
              {g.status === 'active' && (
                <div className="flex gap-2">
                  {[25, 50, 75].filter(v => v > g.progress).map(v => (
                    <button key={v} onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, progress: v } : x))}
                            className="hx-mono text-[8.5px] uppercase tracking-wider hx-amber-dim hover:text-brass transition">
                      +{v}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status toggle */}
            <div className="flex gap-2 mt-3">
              {(['active', 'done', 'deferred'] as const).map((s) => (
                <button key={s} onClick={() => setGoals(gs => gs.map(x => x.id === g.id ? { ...x, status: s } : x))}
                        className={`hx-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded transition ${g.status === s ? 'text-neutral-100' : 'hx-amber-dim hover:text-brass'}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="hx-glass rounded-2xl p-12 text-center">
            <div className="hx-serif italic text-[20px] text-neutral-500">No goals yet.</div>
            <div className="hx-mono text-[10px] hx-amber-dim uppercase tracking-wider mt-2">add one above to begin</div>
          </div>
        )}
      </div>
    </div>
  );
}
