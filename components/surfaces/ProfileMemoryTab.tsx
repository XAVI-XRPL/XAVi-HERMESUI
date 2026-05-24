'use client';
import type { Profile } from '@/types';

function MemoryGraph({ accent, accentRGB }: { accent: string; accentRGB: string }) {
  const nodes = Array.from({ length: 60 }, () => ({
    x: 60 + Math.random() * 580,
    y: 40 + Math.random() * 400,
    r: 3 + Math.random() * 8,
    c: Math.random() > 0.2 ? accent : (Math.random() > 0.6 ? '#9B7BFF' : '#c9a76c'),
  }));
  const edges = Array.from({ length: 80 }, () => {
    const a = Math.floor(Math.random() * nodes.length);
    const b = Math.floor(Math.random() * nodes.length);
    return [a, b];
  });

  return (
    <svg viewBox="0 0 700 460" className="w-full mt-4" style={{ height: 440 }}>
      <defs>
        <filter id="ng"><feGaussianBlur stdDeviation={2} /></filter>
        <radialGradient id={`bg-${accent.replace('#','')}`}>
          <stop offset="0%" stopColor={accent} stopOpacity=".06" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="700" height="460" fill={`url(#bg-${accent.replace('#','')})`} />
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
              stroke="rgba(255,255,255,.06)" strokeWidth=".5" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 1.8} fill={n.c} opacity=".15" filter="url(#ng)" />
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.c} opacity=".85" />
        </g>
      ))}
    </svg>
  );
}

interface Props { profile: Profile; }

export default function ProfileMemoryTab({ profile }: Props) {
  return (
    <div className="px-10 pb-16 hx-fade-up grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <div className="hx-glass rounded-2xl p-6 relative overflow-hidden" style={{ minHeight: 520 }}>
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim">Vector store · {profile.name.toLowerCase()}</div>
          <div className="hx-serif text-[28px] leading-none text-neutral-100 mt-1">
            <span className="hx-mono text-[14px] hx-amber mr-2">—</span>chunks · not yet wired
          </div>
          <MemoryGraph accent={profile.accent} accentRGB={profile.accentRGB} />
        </div>
      </div>
      <div className="col-span-4 space-y-3">
        <div className="hx-glass rounded-2xl p-5">
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Scope</div>
          {[['Vector store', `${profile.id}-store`], ['Source paths', '—'], ['Re-embed', 'manual']].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b hx-hairline last:border-0 text-[12px]">
              <span className="text-neutral-500">{k}</span>
              <span className="hx-mono text-[11px] text-neutral-200">{v}</span>
            </div>
          ))}
        </div>
        <div className="hx-glass rounded-2xl p-5">
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Scratchpad</div>
          <div className="hx-serif italic text-[14px] text-neutral-400 leading-snug">
            Hermes builds this surface next: vector store browser + chunk inspector.
          </div>
        </div>
      </div>
    </div>
  );
}
