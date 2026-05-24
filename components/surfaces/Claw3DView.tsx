'use client';
import { useState } from 'react';

function IconRefresh({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="shrink-0">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5" />
    </svg>
  );
}
function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="shrink-0">
      <path d="M7 7h10v10M7 17L17 7" />
    </svg>
  );
}

interface Props { url: string; }

export default function Claw3DView({ url }: Props) {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="px-10 pb-4">
      {/* URL bar */}
      <div className="flex items-center gap-2 mb-4 hx-fade-up">
        <div className="hx-glass rounded-xl px-3 py-2 flex items-center gap-2 flex-1 max-w-2xl">
          <span className="hx-mono text-[10px] uppercase tracking-wider hx-amber-dim shrink-0">URL</span>
          <input value={url} readOnly
                 className="flex-1 bg-transparent text-[12px] hx-mono text-neutral-200" />
        </div>
        <button onClick={() => setIframeKey((k) => k + 1)} className="hx-pill rounded-xl p-2">
          <IconRefresh size={14} />
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="hx-pill rounded-xl px-3 py-2 text-[11px] uppercase tracking-wider hx-mono text-neutral-300 flex items-center gap-1.5">
          <IconExternalLink size={12} /> New tab
        </a>
      </div>

      {/* iframe */}
      <div className="hx-glass-elevated rounded-3xl overflow-hidden relative hx-fade-up" style={{ minHeight: 560 }}>
        <iframe key={iframeKey} src={url} className="w-full border-none bg-transparent"
                title="Claw3D Office" style={{ minHeight: 560 }} />
        {/* Status badge */}
        <div className="absolute top-3 left-3 hx-glass rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 hx-breathe" />
          <span className="hx-mono text-[10px] uppercase tracking-wider text-neutral-300">Claw3D · embedded</span>
        </div>
      </div>

      <div className="hx-mono text-[10px] uppercase tracking-[0.2em] hx-amber-dim mt-3 text-center">
        if blank — start Claw3D locally:{' '}
        <span className="hx-amber">git clone github.com/iamlukethedev/Claw3D && npm run dev</span>
      </div>
    </div>
  );
}
