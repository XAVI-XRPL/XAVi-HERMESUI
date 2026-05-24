# Hermes Studio — Telemetry Sidecar

## Purpose
Collects live GPU/RAM/VRAM/system stats and streams them via SSE to the Hermes Studio renderer (Studio · Substrate view).

## What it monitors
- **Ollama** at `localhost:11434` — loaded models, active model name  
- **LM Studio** at `localhost:1234` — loaded model list from `/v1/models`
- **vLLM** at `localhost:8000` — model inventory from `/v1/models`
- **nvidia-smi** (NVIDIA GPUs) — VRAM used/total GB, GPU utilization %, temperature °C, clock speed MHz  
- **system_profiler** (Apple Silicon / macOS) — GPU name fallback
- **node-os-utils** — CPU %, system RAM used/total/percent

## Start
```bash
cd telemetry-sidecar
npm install
npm run dev    # runs on port 18973, SSE at http://localhost:18973/api/telemetry
```

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/telemetry` | SSE stream — pushes full JSON payload every 4s |
| GET | `/api/telemetry/snapshot` | One-shot current state as REST JSON |
| GET | `/health` | Simple `{ status, ts, uptime }` health check |

## Payload shape
```json
{
  "ts": 1747958400000,
  "system": { "cpuPercent": 12.4, "memoryUsedGB": 38.2, "memoryTotalGB": 64, "memoryPercent": 59.7 },
  "gpu": [{ "name": "NVIDIA GeForce RTX 4090", "vramUsedGB": 14.2, "vramTotalGB": 24, "utilizationPercent": 67, "temperatureC": 73, "clockSpeedMhz": 2805, "type": "nvidia" }],
  "models": [{ "name": "deepseek-r1:32b", "provider": "ollama" }]
}
```