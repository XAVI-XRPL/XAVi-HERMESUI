#!/usr/bin/env tsx
/**
 * Hermes Studio — Node.js Telemetry Sidecar
 * Collects GPU/RAM/VRAM/system stats and streams them via SSE to the renderer.
 * Polls: Ollama /api/ps · LM Studio /v1/models · psutil (node-os-utils)
 *
 * Run:  npm run dev   (port 18973)
 */

import express from 'express';
import cors from 'cors';

const PORT = parseInt(process.env.TELEMETRY_PORT || '18973', 10);
const POLL_MS = 4000;

// ── Types ───────────────────────────────────────────────────────────────────

interface Telemetry {
  ts: number;
  system?: SystemStats;
  gpu?: GPUInfo[];
  models?: ModelInfo[];
}

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
  name: string; provider: string; contextLength?: number;
}

// ── System stats (no external deps) ─────────────────────────────────────────

async function getSystemStats(): Promise<SystemStats> {
  try {
    // Use `os` utils via node-os-utils
    const { cpu, mem, osCmd } = await import('node-os-utils');
    const [cpuPct, memInfo] = await Promise.all([
      cpu.usage(),
      mem.info(),
    ]);
    return {
      cpuPercent: Math.round(cpuPct * 10) / 10,
      memoryUsedGB:   parseFloat((memInfo.usedMemMb / 1024).toFixed(2)),
      memoryTotalGB:  parseFloat((memInfo.totalMemMb / 1024).toFixed(2)),
      memoryPercent:  Math.round(memInfo.usedMemPct * 10) / 10,
      uptimeSeconds:  Math.floor(process.uptime()),
    };
  } catch {
    // Fallback — read /proc/meminfo on Linux
    try {
      const text = await Deno.readTextFile('/proc/meminfo').catch(() => '');
      const match = text.match(/MemTotal:\s+(\d+)/);
      if (match) return { cpuPercent: 0, memoryUsedGB: 0, memoryTotalGB: parseInt(match[1]) / 1024 / 1024, memoryPercent: 0, uptimeSeconds: 0 };
    } catch {}
    return { cpuPercent: 0, memoryUsedGB: 0, memoryTotalGB: 0, memoryPercent: 0, uptimeSeconds: 0 };
  }
}

// ── GPU stats ────────────────────────────────────────────────────────────────

async function getGPUs(): Promise<GPUInfo[]> {
  const gpus: GPUInfo[] = [];

  // Try NVIDIA nvidia-smi (macOS/Linux)
  try {
    const { execSync } = await import('child_process');
    const out = execSync('nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu,temperature.gpu,clocks.current.sm --format=csv,noheader,nounits', { timeout: 4000 }).toString();
    for (const line of out.trim().split('\n')) {
      const [idx, name, memUsed, memTotal, util, temp, clock] = line.split(',').map((s) => s.trim());
      if (!name) continue;
      gpus.push({
        name: `${name} (#${idx})`,
        vramUsedGB:    parseFloat(memUsed) / 1024,
        vramTotalGB:   parseFloat(memTotal) / 1024,
        utilizationPercent: parseInt(util, 10),
        temperatureC:  temp ? parseInt(temp, 10) : null,
        clockSpeedMhz: clock ? parseInt(clock, 10) : null,
        type: 'nvidia',
      });
    }
  } catch { /* nvidia-smi not available */ }

  // Try Apple Metal via system_profiler (macOS)
  if (gpus.length === 0) {
    try {
      const { execSync } = await import('child_process');
      const out = execSync('system_profiler SPDisplaysDataType -json 2>/dev/null', { timeout: 5000 }).toString();
      const data = JSON.parse(out);
      const displays: Array<{ "Chipset Model": string; VRAM?: string }> =
        data?.displays?.[0] ? [data.displays[0]] : [];
      for (const d of displays) {
        gpus.push({
          name:     d["Chipset Model"] || 'Apple GPU',
          vramUsedGB: 0, // Apple doesn't expose this easily
          vramTotalGB: 0,
          utilizationPercent: 0,
          temperatureC: null,
          clockSpeedMhz: null,
          type: 'apple-metal',
        });
      }
    } catch { /* system_profiler not available */ }

    // Fallback for macOS without GPU monitoring
    if (gpus.length === 0 && process.platform === 'darwin') {
      gpus.push({
        name:     'Apple Silicon GPU',
        vramUsedGB: 0, vramTotalGB: 0,
        utilizationPercent: 0,
        temperatureC: null,
        clockSpeedMhz: null,
        type: 'apple-metal',
      });
    }
  }

  return gpus;
}

// ── Model discovery from local providers ─────────────────────────────────────

async function getModels(): Promise<ModelInfo[]> {
  const models: ModelInfo[] = [];

  // Ollama — http://localhost:11434
  try {
    const r = await fetch('http://localhost:11434/api/ps', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const j = await r.json() as { models?: Array<{ name: string }> };
      for (const m of (j.models ?? [])) {
        models.push({ name: m.name, provider: 'ollama' });
      }
    }
  } catch { /* Ollama not running */ }

  // LM Studio — http://localhost:1234/v1/models
  try {
    const r = await fetch('http://localhost:1234/v1/models', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const j = await r.json() as { data?: Array<{ id: string }> };
      for (const m of (j.data ?? [])) {
        models.push({ name: m.id, provider: 'lmstudio' });
      }
    }
  } catch { /* LM Studio not running */ }

  // vLLM — http://localhost:8000/v1/models
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

// ── SSE polling loop ─────────────────────────────────────────────────────────

let lastTelemetry: Telemetry = { ts: Date.now() };
let clients: Set<express.Response> = new Set();

async function poll() {
  try {
    const [system, gpu, models] = await Promise.all([
      getSystemStats(),
      getGPUs(),
      getModels(),
    ]);
    lastTelemetry = { ts: Date.now(), system, gpu, models };
    // Broadcast to all SSE clients
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
app.set('json spaces', 2);

// SSE stream endpoint
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

// REST snapshot endpoint (for initial page load)
app.get('/api/telemetry/snapshot', (_req, res) => {
  res.json(lastTelemetry);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now(), uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`[Hermes Telemetry] SSE server running on http://localhost:${PORT}`);
  // Start polling
  poll();
  setInterval(poll, POLL_MS);
});