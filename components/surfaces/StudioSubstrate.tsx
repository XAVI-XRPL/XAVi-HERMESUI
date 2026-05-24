'use client';
// Studio · Substrate — live stat cards for GPU/RAM/VRAM
// These read from the Node.js telemetry sidecar at localhost:18973 when available.
// Until then, show "— not wired" placeholder with branded copy.
import { useState, useEffect } from 'react';

interface Telemetry {
  ts?: number;
  system?: { cpuPercent: number; memoryUsedGB: number; memoryTotalGB: number; memoryPercent: number };
  gpu?: {
    name: string;
    vramUsedGB: number; vramTotalGB: number;
    utilizationPercent: number; temperatureC: number | null;
    clockSpeedMhz: number | null;
    type: 'nvidia' | 'apple-metal' | 'unknown';
  };
  models?: { name: string; provider: string }[];
}

function StatCard({ label, value, unit, accent = '#c9a76c', rgb = '201,167,108', sub }: {
  label: string; value: string | number; unit: string; accent?: string; rgb?: string; sub?: string;
}) {
  return (
    <div className="hx-glass rounded-2xl p-5 relative overflow-hidden" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
      {/* Accent blur orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
           style={{ background: accent }} />
      <div className="hx-mono text-[9.5px] uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="hx-serif text-[42px] leading-none" style={{ color: accent }}>{value}</span>
        <span className="hx-mono text-[10px] text-neutral-500">{unit}</span>
      </div>
      {sub && <div className="hx-mono text-[9.5px] hx-amber-dim mt-1 uppercase tracking-wider">{sub}</div>}
    </div>
  );
}

function tempColor(c: number | null) {
  if (c === null) return '#c9a76c';
  if (c < 60)     return '#7FE38E';
  if (c < 80)     return '#F5B041';
  return '#FF6B6B';
}

export default function StudioSubstrate() {
  const [t, setT] = useState<Telemetry | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let es: EventSource;
    function connect() {
      es = new EventSource('http://localhost:18973/api/telemetry');
      es.onmessage = (e) => {
        try { setT(JSON.parse(e.data)); setConnected(true); } catch {}
      };
      es.onerror = () => { setConnected(false); es.close(); setTimeout(connect, 5000); };
    }
    connect();
    return () => es?.close();
  }, []);

  const gpuName = t?.gpu?.name ?? '—';
  const vramUsed = t?.gpu ? `${t.gpu.vramUsedGB.toFixed(1)} / ${t.gpu.vramTotalGB.toFixed(1)} GB` : '—';
  const ramUsed  = t?.system
    ? `${t.system.memoryUsedGB.toFixed(1)} / ${t.system.memoryTotalGB.toFixed(1)} GB`
    : '—';
  const gpuTemp  = t?.gpu?.temperatureC ?? null;
  const modelsHot = t?.models?.length ?? (connected ? 0 : undefined);

  return (
    <div className="px-10 pb-16">
      {/* Connection status */}
      {!t && !connected && (
        <div className="hx-glass rounded-3xl p-8 text-center mb-4 hx-fade-up">
          <div className="hx-serif italic text-[22px] text-neutral-400">Substrate telemetry needs the sidecar.</div>
          <div className="hx-mono text-[10px] uppercase tracking-[0.2em] hx-amber-dim mt-2">node telemetry-sidecar/src/index.ts · port 18973</div>
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="VRAM" value={vramUsed.split('/')[0].trim() || '—'} unit={t?.gpu ? `/${t.gpu.vramTotalGB.toFixed(0)} GB` : ''} accent="#5DADE2" rgb="93,173,226"
                  sub={connected && t?.gpu ? `${((t.gpu.vramUsedGB / t.gpu.vramTotalGB) * 100).toFixed(0)}% used` : !t ? 'sidecar offline' : ''} />
        <StatCard label="System RAM" value={ramUsed.split('/')[0].trim() || '—'} unit="" accent="#7FE38E" rgb="127,227,142"
                  sub={connected && t?.system ? `${t.system.memoryPercent.toFixed(0)}% of total` : ''} />
        <StatCard label="GPU Temp" value={gpuTemp !== null ? gpuTemp + '°' : (connected ? '—' : '?')} unit={gpuTemp !== null ? 'C' : ''}
                  accent={tempColor(gpuTemp)} rgb={
                    gpuTemp === null ? '201,167,108'
                    : gpuTemp < 60 ? '127,227,142'
                    : gpuTemp < 80 ? '245,176,65' : '255,107,107'
                  }
                  sub={connected && t?.gpu?.name ? t.gpu.name.slice(0, 24) : !t ? 'start sidecar first' : ''} />
        <StatCard label="Models Hot" value={
          modelsHot !== undefined
            ? (modelsHot as number).toString()
            : connected ? '—' : '?'
        } unit="" accent="#D96AB5" rgb="217,106,181"
                  sub={connected && t?.models?.length ? `${t.models.length} loaded` : !t ? 'sidecar offline' : ''} />
      </div>

      {/* Active models list */}
      {t?.models && t.models.length > 0 && (
        <div className="hx-glass rounded-2xl p-5 hx-fade-up">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Active Models</span>
          <div className="space-y-2">
            {t.models.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                <span className="hx-mono text-[11px] text-neutral-200">{m.name}</span>
                <span className="hx-mono text-[9.5px] hx-amber-dim uppercase tracking-wider">{m.provider}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GPU utilization bar */}
      {t?.gpu && (
        <div className="mt-4 hx-glass rounded-xl p-5 hx-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim">GPU Compute</span>
            <span className="hx-serif text-[20px]" style={{ color: '#F5B041' }}>{t.gpu.utilizationPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${t.gpu.utilizationPercent}%`, background: '#F5B041' }} />
          </div>
        </div>
      )}
    </div>
  );
}
