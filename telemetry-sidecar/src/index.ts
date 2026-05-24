#!/usr/bin/env tsx
/**
 * Hermes Studio — Node.js Telemetry Sidecar
 * Collects GPU/RAM/VRAM/system stats and streams them via SSE.
 *
 * Run:  npm run dev   (port 18973)
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';

const PORT = parseInt(process.env.TELEMETRY_PORT || '18973', 10);
const POLL_MS = 4000;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SystemStats {
  cpuPercent: number;
  memoryUsedGB: number; memoryTotalGB: number; memoryPercent: number;
  uptimeSeconds: number;
}

interface GPUInfo {
  name: string;
  vramUsedGB: number; vramTotalGB: number;
  utilizationPercent: number; temperatureC: number | null;
  clockSpeedMhz: number | null;
  type: 'nvidia' | 'apple-metal' | 'unknown';
}

interface ModelInfo {
  name: string; provider: string;
}

// ── System stats (node-os-utils) ─────────────────────────────────────────────

async function getSystemStats(): Promise<SystemStats> {
  try {
    const { cpu, mem } = await import('node-os-utils');
    const [cpuPct, memInfo] = await Promise.all([cpu.usage(), mem.info()]);
    return {
      cpuPercent:     Math.round(cpuPct * 10) / 10,
      memoryUsedGB:   parseFloat((memInfo.usedMemMb / 1024).toFixed(2)),
      memoryTotalGB:  parseFloat((memInfo.totalMemMb / 1024).toFixed(2)),
      memoryPercent:  Math.round(memInfo.usedMemPct * 10) / 10,
      uptimeSeconds:  Math.floor(process.uptime()),
    };
  } catch {
    // Linux fallback via /proc/meminfo
    try {
      const text = readFileSync('/proc/meminfo', 'utf8');
      const totalMatch = text.match(/MemTotal:\s+(\d+)/);
      const availMatch = text.match(/MemAvailable:\s+(\d+)/);
      if (totalMatch) {
        const totalKB = parseInt(totalMatch[1]);
        const availKB = availMatch ? parseInt(availMatch[1]) : 0;
        const usedKB  = totalKB - availKB;
        return {
          cpuPercent:     0,
          memoryUsedGB:   parseFloat((usedKB / 1024 / 1024).toFixed(2)),
          memoryTotalGB:  parseFloat((totalKB / 1024 / 1024).toFixed(2)),
          memoryPercent:  Math.round((usedKB / totalKB) * 1000) / 10,
          uptimeSeconds:  0,
        };
      }
    } catch { /* ignore */ }
    return { cpuPercent: 0, memoryUsedGB: 0, memoryTotalGB: 0, memoryPercent: 0, uptimeSeconds: Math.floor(process.uptime()) };
  }
}

// ── GPU stats ────────────────────────────────────────────────────────────────

async function getGPUs(): Promise<GPUInfo[]> {
  const gpus: GPUInfo[] = [];

  // nvidia-smi (NVIDIA GPUs on macOS/Linux)
  try {
    const { execSync } = await import('child_process');
    const out = execSync(
      'nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu,temperature.gpu,clocks.current.sm --format=csv,noheader,nounits',
      { timeout: 4000 }
    ).toString();
    for (const line of out.trim().split('\n')) {
      if (!line.trim()) continue;
      const parts = line.split(',').map((s) => s.trim());
      const [idx, name, memUsed, memTotal, util, temp, clock] = parts;
      gpus.push({
        name: `${name} (#${idx})`,
        vramUsedGB:         parseFloat(memUsed) / 1024,
        vramTotalGB:        parseFloat(memTotal) / 1024,
        utilizationPercent: parseInt(util ?? '0', 10),
        temperatureC:       temp ? parseInt(temp, 10) : null,
        clockSpeedMhz:      clock ? parseInt(clock, 10) : null,
        type:               'nvidia',
      });
    }
  } catch { /* nvidia-smi not available */ }

  // Apple Silicon GPU (macOS fallback)
    if (gpus.length === 0 && process.platform === 'darwin') {
    try {
      const { execSync } = await import('child_process');
      const out = execSync(
        'system_profiler SPDisplaysDataType -json 2>/dev/null',
        { timeout: 5000 }
      ).toString();
      const data = JSON.parse(out) as Record<string, unknown>;
      // data.displays is an array of display objects
      const displays = (data.displays ?? []) as Array<Record<string, string>>;
      for (const d of displays) {
        if (d['Chipset Model']) {
          gpus.push({
            name:     d['Chipset Model'],
            vramUsedGB: 0, vramTotalGB: 0,
            utilizationPercent: 0, temperatureC: null, clockSpeedMhz: null,
            type: 'apple-metal',
          });
        }
      }
    } catch { /* not available */ }

    // Generic fallback for macOS
    if (gpus.length === 0) {
      gpus.push({
        name:     'Apple Silicon GPU',
        vramUsedGB: 0, vramTotalGB: 0,
        utilizationPercent: 0, temperatureC: null, clockSpeedMhz: null,
        type: 'apple-metal',
      });
    }
  }

  return gpus;
}

// ── Model discovery from local providers ─────────────────────────────────────

async function getModels(): Promise<ModelInfo[]> {
  const models: ModelInfo[] = [];

  // Ollama at :11434
  try {
    const r = await fetch('http://localhost:11434/api/ps', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const j = await r.json() as { models?: Array<{ name: string }> };
      for (const m of (j.models ?? [])) {
        models.push({ name: m.name, provider: 'ollama' });
      }
    }
  } catch { /* Ollama not running */ }

  // LM Studio at :1234
  try {
    const r = await fetch('http://localhost:1234/v1/models', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const j = await r.json() as { data?: Array<{ id: string }> };
      for (const m of (j.data ?? [])) {
        models.push({ name: m.id, provider: 'lmstudio' });
      }
    }
  } catch { /* LM Studio not running */ }

  // vLLM at :8000
  try {
    const r = await fetch('http://localhost:8000/v1/models', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const j = await r.json() as { data?: Array<{ id: string }> };
      for (const m of (j.data ?? [])) {
        models.push({ name: m.id, provider: 'vllm' });
      }
    }
  } catch { /* vLLM not running */ }

  return models;
}

// ── SSE broadcast loop ───────────────────────────────────────────────────────

interface Telemetry { ts: number; system?: SystemStats; gpu?: GPUInfo[]; models?: ModelInfo[]; }

let lastTelemetry: Telemetry = { ts: Date.now() };
const clients = new Set<express.Response>();

async function poll() {
  try {
    const [system, gpu, models] = await Promise.all([
      getSystemStats(), getGPUs(), getModels(),
    ]);
    lastTelemetry = { ts: Date.now(), system, gpu, models };
    for (const res of clients) {
      try { res.write(`data: ${JSON.stringify(lastTelemetry)}\n\n`); } catch { /* client gone */ }
    }
  } catch (e) {
    console.error('[telemetry] poll error:', e);
  }
}

// ── Express app ─────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: '*' }));

// SSE stream
app.get('/api/telemetry', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify(lastTelemetry)}\n\n`);
  clients.add(res);
  req.on('close', () => { clients.delete(res); });
});

// REST snapshot
app.get('/api/telemetry/snapshot', (_req, res) => {
  res.json(lastTelemetry);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now(), uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`[Hermes Telemetry] SSE running on http://localhost:${PORT}`);
  poll();
  setInterval(poll, POLL_MS);
});