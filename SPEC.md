# HERMES STUDIO — Design & Build Specification

> The literary control plane for the Hermes agent runtime. Production build from single-file prototype.

---

## TABLE OF CONTENTS

1. [Design System](#-design-system)
2. [Architecture](#-architecture)
3. [Page Inventory](#-page-inventory)
4. [Data Model](#-data-model)
5. [Telemetry Sidecar](#-telemetry-sidecar)
6. [Build Phases](#-build-phases)

---

## I. DESIGN SYSTEM

### Color Palette

```
--bg:           #0A0A0E   (background — near-black with blue tint)
--brass:        #c9a76c   (primary accent — warm gold/brass, brand color)
--brass-dim:    #8c7449   (muted brass for secondary labels)
--accent:       per-profile variable from ACCENT_PALETTE
--accent-rgb:   rgb triplet of --accent

Neutral scale:
  text-primary:  #e8e8e3
  text-secondary:#d4d4cc
  text-muted:    #9a9a92 / #7a7a72
  text-dim:      #5a5a52
```

### Per-Profile Accent Palette

```typescript
const ACCENT_PALETTE = [
  { name: 'Atlas',   hex: '#5DADE2', rgb: '93,173,226' },
  { name: 'Hermes',  hex: '#9B7BFF', rgb: '155,123,255' },
  { name: 'Mercury', hex: '#7FE38E', rgb: '127,227,142' },
  { name: 'Iris',    hex: '#F5B041', rgb: '245,176,65' },
  { name: 'Echo',    hex: '#D96AB5', rgb: '217,106,181' },
  { name: 'Ember',   hex: '#FF6B6B', rgb: '255,107,107' },
  { name: 'Slate',   hex: '#94A3B8', rgb: '148,163,184' },
  { name: 'Mint',    hex: '#5EEAD4', rgb: '94,234,212' },
];
```

### Typography

| Role        | Font                  | Notes                                      |
|-------------|-----------------------|--------------------------------------------|
| Display     | Instrument Serif      | Chapter headers (58px), italic accent use  |
| Body/UI     | Inter Tight           | Weights 300–700, all interface text        |
| Numerals    | JetBrains Mono        | tabular-nums on EVERY number/label/status  |

**Font imports:**
```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Inter+Tight:wght@300;400;500;600;700&display=swap');
```

### CSS Utility Classes (verbatim from prototype)

These class names MUST be preserved 1:1 so grep references between prototype and production app remain valid:

| Class | Purpose |
|-------|---------|
| `.hx-serif` | Instrument Serif font family |
| `.hx-mono` | JetBrains Mono, tabular-nums |
| `.hx-glass` | Glass surface with backdrop-filter blur + top-edge highlight |
| `.hx-glass-elevated` | Elevated glass — deeper shadow, stronger blur |
| `.hx-orb` | Skeuomorphic sphere: 3-layer radial gradient + catch-light ::after |
| `.hx-pill` | Skeleton pill button base state |
| `.hx-pill-active` | Active/selected pill with accent color fill |
| `.hx-switch` | Toggle switch track (skeuo inset shadow) |
| `.hx-amber` | `--brass` text color shortcut |
| `.hx-amber-dim` | Muted brass for microcopy/labels |
| `.hx-glow-on-hover` | Brightness + saturation boost on hover |
| `.hx-floor` | Grid background (44px squares, subtle lines) |
| `.hx-grain` | SVG noise texture overlay at 4% opacity |
| `.hx-ambient` | Radial gradient ceiling light from top center |
| `.hx-hairline` | Subtle divider: `rgba(255,255,255,.07)` border |
| `.hx-key` | Keyboard key badge (mini monospace chip) |
| `.hx-fade-up` | Entrance animation: fade + 6px translateY, 0.55s ease |
| `.hx-pulse` | Opacity pulse at 1.4s cycle |
| `.hx-breathe` | Scale + opacity breathe at 2.6s cycle |
| `.hx-slidein` | Slide from right, 0.4s cubic-bezier |
| `.hx-caret` | Blinking text cursor for streaming indicator |
| `.hx-scroll` | Custom scrollbar: 6px width, transparent track |

### Orb — Skeuomorphic Recipe

```css
.hx-orb {
  position: relative; border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, rgba(255,255,255,.95) 0%, rgba(255,255,255,.55) 6%, rgba(255,255,255,.15) 14%, transparent 28%),   /* catch-light top-left */
    radial-gradient(circle at 70% 78%, rgba(0,0,0,.45) 0%, rgba(0,0,0,.15) 25%, transparent 55%),                                    /* shadow bottom-right */
    radial-gradient(circle at 50% 50%, var(--accent) 0%, rgba(var(--accent-rgb),.85) 55%, rgba(var(--accent-rgb),.4) 90%);           /* main color fill */
  box-shadow:
    0 4px 14px rgba(var(--accent-rgb),.35),
    0 0 22px rgba(var(--accent-rgb),.25),
    inset 0 -2px 4px rgba(0,0,0,.35),
    inset 0 1px 1px rgba(255,255,255,.15);
}
.hx-orb::after {
  content: ''; position: absolute;
  left: 22%; top: 18%; width: 18%; height: 12%;
  background: rgba(255,255,255,.7); border-radius: 50%;
  filter: blur(1.5px); transform: rotate(-18deg);
}
```

### Glass — Recipe

```css
.hx-glass {
  background: linear-gradient(140deg,
    rgba(255,255,255,.045) 0%,
    rgba(255,255,255,.015) 100%);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgba(255,255,255,.06);
  box-shadow:
    0 1px 0 rgba(255,255,255,.06) inset,
    0 8px 32px rgba(0,0,0,.32),
    0 1px 2px rgba(0,0,0,.4);
}
.hx-glass-elevated {
  background: linear-gradient(140deg,
    rgba(255,255,255,.08) 0%,
    rgba(255,255,255,.025) 100%);
  backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255,255,255,.09);
  box-shadow:
    0 1px 0 rgba(255,255,255,.1) inset,
    0 12px 48px rgba(0,0,0,.5),
    0 2px 4px rgba(0,0,0,.4);
}
```

### Chapter Header Pattern

Roman numeral → thin rule → KICKER (monospace uppercase) → serif title → italic accent → italic serif subtitle → brass mono timestamp.

```jsx
<ChapterHeader
  numeral="IX"
  kicker="SELF · STUDIO"
  title="Studio"
  italic="the workshop"
  subtitle="Substrate, models, lifecycle. The view beneath the agents."
  day={day} time={time}
/>
```

Output:
```
IX. ──────────────────────────── SELF · STUDIO

Studio                    the workshop
<i>italic serif subtitle</i>

HH:MM · Saturday, May 23 · NEW YORK
```

### Numerals — Stable Assignment (never change these)

| Surface | Roman Numeral |
|---------|--------------|
| I. Mission Control | I |
| II. Console (per-profile) | II |
| III. Sessions (per-profile) | III |
| IV. Skills (per-profile) | IV |
| V. Memory (per-profile + shared) | V |
| VI. Kanban | VI |
| VII. Journal | VII |
| VIII. Goals | VIII |
| IX. Studio | IX |
| X. Skills (shared) | X |
| XI. Config / Settings | XI |
| XII. Claw3D · Office | XII |
| XIII. System Monitor *(new)* | XIII |

### Brand Voice — Microcopy Rules

- Labels: uppercase JetBrains Mono, letter-spacing 0.18–0.22em, 9–10px
- No all-caps for UI labels except section kickers
- Italic serif for subtitles, descriptions, literary flourishes
- Never use "Welcome" or "Hello" — the brand is an instrument of precision

---

## II. ARCHITECTURE

### Stack

```
Frontend:    Next.js 15 (App Router) + TypeScript strict mode
Styling:     Tailwind v4 + CSS variables from prototype globals.css
Components:  shadcn/ui primitives re-skinned to match design system
State:       Zustand with localStorage adapter
Async:       TanStack Query for provider model lists, telemetry fetches
Desktop:     Tauri 2 (macOS primary target)
Sidecar:     Node.js — telemetry collection + SSE streaming to renderer
Provider:    OpenAI-compatible streaming adapters per provider type
```

### Project Structure

```
XAVi-HERMESUI/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with fonts, global providers
│   │   ├── page.tsx            # Redirects to /studio
│   │   └── studio/
│   │       ├── layout.tsx      # Studio shell: sidebar + main area
│   │       ├── page.tsx        # Default: Mission Control (I)
│   │       ├── [profile]/      # Per-profile routes
│   │       │   ├── console/    # Console tab
│   │       │   ├── sessions/   # Sessions tab
│   │       │   ├── skills/     # Profile Skills tab
│   │       │   ├── memory/     # Profile Memory tab
│   │       │   └── config/     # Profile Config tab
│   │       ├── shared/
│   │       │   ├── mission-control/
│   │       │   ├── memory/     # Shared Memory (atlas of self)
│   │       │   ├── kanban/
│   │       │   ├── journal/
│   │       │   ├── goals/
│   │       │   ├── studio/     # Studio · Substrate + Models sub-tabs
│   │       │   ├── skills/     # Shared Skills (atelier)
│   │       │   ├── settings/
│   │       │   └── claw3d/     # Claw3D iframe embed
│   │       └── system-monitor/ # XIII — full GPU panel
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base primitives (reskinned)
│   │   ├── layout/             # Sidebar, TopChrome, ChapterHeader
│   │   ├── surfaces/           # Surface-specific components by ID
│   │   └── shared/             # ProfileOrb, StatusDot, KVRow, etc.
│   │
│   ├── lib/
│   │   ├── providers.ts        # Provider client (streamChat, listModels)
│   │   ├── anthropic.ts        # Anthropic native /v1/messages adapter
│   │   ├── storage.ts          # localStorage read/write helpers
│   │   └── telemetry-client.ts # Fetch wrapper for sidecar SSE
│   │
│   ├── stores/
│   │   ├── profile-store.ts    # Profiles + active profile state
│   │   ├── session-store.ts    # Sessions by profile
│   │   └── settings-store.ts   # Mode, active surface, per-profile tab memory
│   │
│   ├── types/
│   │   └── index.ts            # Profile, Session, Turn, Skill schemas
│   │
│   └── styles/
│       └── globals.css         # ALL CSS variables + utility classes verbatim
│
├── telemetry-sidecar/          # Node.js sidecar (separate package.json)
│   ├── src/
│   │   ├── index.ts            # Express app, SSE endpoint
│   │   ├── collectors/
│   │   │   ├── system.ts       # psutil: CPU, RAM, uptime
│   │   │   ├── gpu.ts          # NVIDIA GPU stats via nvidia-smi / py3nvml
│   │   │   ├── ollama.ts       # Ollama /api/ps parser
│   │   │   └── lmstudio.ts     # LM Studio /v1/models + /v1 internal state
│   │   └── routes/
│   │       └── telemetry.ts    # GET /api/telemetry SSE stream
│   ├── package.json
│   └── tsconfig.json
│
├── src-tauri/                  # Tauri 2 Rust project (scaffolded by create tauri-app)
└── SPEC.md                     # This document
```

### Routing Strategy

Profile-axis navigation uses URL `/studio/[profileId]/[tab]`. Shared surfaces use `/studio/shared/[surface]`. Zustand persists mode + active surface so re-entering returns to last position.

```
/studio                         → Mission Control (shared, default)
/studio/atlas                   → Atlas profile, last tab
/studio/atlas/console           → Atlas · Console
/studio/hermes/sessions         → Hermes · Sessions
/studio/shared/memory           → Shared Memory atlas
/studio/shared/system-monitor   → Full GPU panel (XIII)
```

### Data Persistence

v1: `localStorage` as canonical store. Zustand middleware syncs to disk on every state change. Profiles, sessions, settings all JSON-serializable.

```typescript
// Storage keys — same as prototype for import/export compat
const STORAGE = {
  profiles: 'hermes.profiles.v1',
  sessions: 'hermes.sessions.v1',
  settings: 'hermes.settings.v1',
};
```

v2 (future): Tauri SQLite migration — same Zustand adapter pattern, swap middleware only.

### Provider Client

Mirrors prototype's `streamChat()` and `listModels()`. OAI-compat for all local providers. No Anthropic in v1.

```typescript
// Supported providers (from PROVIDERS map)
lm-studio | ollama | mlx-lm | mlx-vlm | mlx-openai |
inferencer | vllm | llamacpp | openai | custom

// streamChat(profile, messages, signal) → AsyncGenerator<string>
// listModels(endpoint, apiKey?) → Promise<string[]>
```

---

## III. PAGE INVENTORY

### Per-Profile Surfaces (profile-axis)

#### II · Console
- Streaming chat with profile accent color
- Auto-create new session on first message
- `Cmd+Enter` to send
- Stop button during streaming
- Session title auto-captured from first user message (60 chars)
- Turn count + latency shown per response
- CORS error detection and provider-specific hint display
- Clear conversation with confirmation

#### III · Sessions
- Grid of session cards sorted by `updatedAt` descending
- Each card: accent dot, title, turn count, relative time
- Click to reopen in Console tab
- Cadence panel (col-span-4): total sessions + all-time turns

#### IV · Skills (per-profile)
- Two-column grid: Equipped / Available skill cards
- SkillCard shows icon, name, description + toggle switch
- Toggle writes back to profile.skills[] array immediately
- Notes sidebar with branded copy and equip/available counts

#### V · Memory (per-profile) — placeholder v0.2
- SVG memory graph (randomized nodes, same as prototype)
- Vector store scope panel: store name, source paths, re-embed mode
- Scratchpad note about future vector store browser
- "chunks · not yet wired" in serif display

#### XI · Config (per-profile) — read-only display
- Identity section: name, role, accent color swatch
- Connection section: provider label, endpoint, model, temperature, maxTokens
- System Prompt rendered as preformatted mono text
- Actions: Edit full profile → opens ProfileDrawer, Copy as JSON

### Shared Surfaces (shared-axis)

#### I · Mission Control — "The Bridge"
- Today panel with branded copy: *"Hand the studio to Hermes. Let it finish itself."*
- Pulse row stats: Profiles (X connected), Sessions (N threads · M turns), Storage
- Fleet grid: one card per profile, shows name/role/provider/model/thread count
  - Card click → navigates to that profile's last surface

#### V · Memory — "Atlas of Self"
- Full knowledge graph SVG with all profiles color-coded in legend
- Cross-agent recall wire placeholder note
- Same memory graph component as per-profile but multi-accent

#### VI · Kanban *(built from placeholder)*
- Drag-and-drop board: To Do / In Progress / Review / Done columns
- Cards auto-generated from session titles + goals entries
- Hermes agent tasks can be created inline
- Column counts in header badges

#### VII · Journal *(built from placeholder)*
- Daily log entries sorted by date, newest first
- Auto-entries from completed sessions: "Finished session N with Atlas — 12 turns"
- Manual entry composer at top
- Session thread links open relevant profile Console to that session

#### VIII · Goals *(built from placeholder)*
- Goal list with progress bars (percentage complete based on sub-tasks)
- Status badges: Active / Completed / Deferred
- Goal creation form: title, description, target date, linked profile(s)
- Kanban cards can be tagged as goal sub-items

#### IX · Studio — "The Workshop"

**Sub-tab A: Substrate**
Live stat cards (4-col grid):

| Stat | Source | Notes |
|------|--------|-------|
| VRAM | nvidia-smi / py3nvml via sidecar | "used / total GB" format |
| System RAM | psutil.memory_percent() | used/total GB |
| GPU Temp | nvidia-smi --query-gpu=temperature.gpu | °C + color coding (green <60, amber 60-80, red >80) |
| Models Hot | Ollama /api/ps length + LM Studio model count | active model names |

StatCard: glass card with absolute-positioned accent blur orb in top-right corner. Large serif numeral (42px), mono label below, muted unit string.

**Sub-tab B: Models**
Per-model detail panel when models are loaded:
- Model name, size params, quantization
- Context length used vs max
- Token throughput (tokens/sec) if available from provider
- Time loaded (duration)
- Eject / reload button

#### X · Skills — "Atelier"
Groups skill cards by group tag. Shows which profiles have each skill equipped.
Used skills show colored dot indicator per profile.

#### XI · Settings
- Profile list with edit buttons → opens ProfileDrawer
- Claw3D URL config field (default: `http://localhost:3000/office`)
- Data panel: Export JSON / Import JSON / Reset all
  - Export shows full JSON in textarea before copy/download
  - Import accepts pasted JSON, overwrites localStorage, reloads page

#### XII · Claw3D — Office
iframe embed at configurable URL.
Top-left floating badge: green breathing dot + "Claw3D · embedded"
Apply / Refresh button to reload iframe without full navigation.
New Tab link opens in separate tab.

**Sub-tab C: System Monitor *(XIII, new shared surface)***
Full GPU panel (becomes a top-level Shared surface):

- VRAM bar chart over time (last 30 data points, scrolling)
- GPU utilization % — arc/gauge visualization
- Temperature trend line graph (SVG, last 5 minutes)
- Fan speed % if available via nvidia-smi
- Active inference processes: PID / model name / context used / tokens/sec

#### Command Palette (`⌘K`)
- Search across profiles and shared surfaces by label
- Keyboard-first: ESC to close, Enter to navigate
- Backdrop blur overlay at 60% black
- Results grouped: Profiles → Forge new profile → Shared surfaces
- Animated entrance (fade-up)

#### Profile Drawer
Right-side slide-in panel for creating/editing profiles.
Sticky header with name + close button.
Sections: Identity / Connection / System Prompt / Skills.

Connection section:
- Provider grid (3 columns, icon + label pills)
- Endpoint URL field
- API Key field (conditional on provider auth flag)
- Test & List Models button → calls `listModels()`, shows spinner then result
- Model select dropdown populated from test results, or free-text fallback
- Temperature / MaxTokens fields

---

## IV. DATA MODEL

```typescript
interface Profile {
  id: string;                    // URL-safe slug derived from name
  name: string;
  role: string;                  // e.g. "Generalist · Markets"
  accent: string;                // hex color, e.g. '#5DADE2'
  accentRGB: string;             // '93,173,226' — for rgba() CSS vars
  systemPrompt: string;
  connection: {
    provider: ProviderId;        // keyof PROVIDERS
    endpoint: string;            // base URL e.g. 'http://localhost:1234'
    modelId: string;             // '' if not yet set
    apiKey: string;              // '' for local providers
    temperature: number;         // 0–2, default 0.7
    maxTokens: number;           // default 4096
  };
  skills: SkillId[];             // array of equipped skill IDs
  status: ProfileStatus;         // 'unknown' | 'connected' | 'working' | 'idle' | 'error' | 'sleeping'
}

type ProviderId = 'lm-studio' | 'ollama' | 'mlx-lm' | 'mlx-vlm' |
                  'mlx-openai' | 'inferencer' | 'vllm' | 'llamacpp' |
                  'openai' | 'custom';

type ProfileStatus = 'unknown' | 'connected' | 'working' | 'idle' | 'error' | 'sleeping';

interface Session {
  id: string;
  profileId: string;
  title: string;                 // auto-capped at 60 chars
  createdAt: number;             // Date.now()
  updatedAt: number;
  turns: Turn[];
}

interface Turn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  streaming?: boolean;           // true while response is in progress
  latencyMs?: number;            // set after streaming completes
  modelId?: string;              // which model generated this turn
  error?: boolean;               // true if this turn errored
}

interface Skill {
  id: SkillId;
  name: string;
  icon: React.ReactNode;         // inline SVG JSX
  group: 'Core' | 'Knowledge' | 'Files' | 'Multimodal' | 'Tools';
  desc: string;
}

type SkillId = 'web' | 'docs' | 'vision' | 'voice' | 'memory' |
               'vector' | 'code' | 'markets' | 'scrape' | 'imgen';

interface Settings {
  mode: 'profile' | 'shared';
  activeProfileId: string | null;
  activeShared: SharedSurfaceId;
  profileTabs: Record<string, ProfileTabId>; // per-profile last-tab memory
  activeSessionId: Record<string, string>;   // per-profile active session ID
  claw3dUrl: string;
}

type SharedSurfaceId = 'mission' | 'memory' | 'kanban' | 'journal' |
                       'goals' | 'studio' | 'skills' | 'settings' | 'claw3d';
type ProfileTabId = 'console' | 'sessions' | 'skills' | 'memory' | 'config';
```

---

## V. TELEMETRY SIDECAR

### Overview

Node.js Express server running on port **18973**. Renderer connects via SSE (Server-Sent Events) at `GET /api/telemetry`. All data is JSON, refreshed every 5 seconds.

### Endpoints

```
GET /
  → { status: 'ok', uptime: number, version: string }

GET /api/telemetry
  → text/event-stream
  → data: TelemetrySnapshot (JSON, newline-terminated)

GET /api/models/ollama?endpoint=http://localhost:11434
  → JSON: string[] model names

GET /api/models/lmstudio?endpoint=http://localhost:1234
  → JSON: string[] model names
```

### TelemetrySnapshot Shape

```typescript
interface TelemetrySnapshot {
  ts: number;                    // Date.now() at collection time
  system: {
    cpuPercent: number;
    memoryUsedGB: number;
    memoryTotalGB: number;
    memoryPercent: number;
    uptimeSeconds: number;
  };
  gpu?: {
    name: string;                // e.g. 'Apple M3 Pro' or 'NVIDIA RTX 4090'
    vramUsedGB: number;
    vramTotalGB: number;
    vramPercent: number;
    utilizationPercent: number;  // GPU compute util, not VRAM
    temperatureC: number | null; // null if unavailable (Apple Silicon)
    fanSpeedPercent: number | null;
    clockSpeedMhz: number | null;
    type: 'nvidia' | 'apple-metal' | 'unknown';
  };
  models: ModelStatus[];
}

interface ModelStatus {
  provider: ProviderId;
  endpoint: string;
  name: string;                  // model id from provider
  loadedAt?: number;             // Date.now() when detected loaded
  contextUsed?: number;          // tokens in use (provider-specific)
  contextMax?: number;           // max context window
  tokensPerSec?: number;         // throughput if available
}
```

### Collector Sources

| Metric | Source |
|--------|--------|
| CPU % | `os.cpus()[0].times` delta over 1s interval |
| RAM used/total/percent | Node.js `os.totalmem()` / `os.freemem()` (cross-platform) |
| VRAM (NVIDIA) | `nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu,temperature.gpu,fan.speed,clocks.current.sm --format=csv` via child_process spawn |
| VRAM (Apple Silicon) | `system_profiler SPDisplaysDataType -json` parsed for GPU memory |
| Ollama models | GET `http://localhost:11434/api/ps` → parse `models[].name`, `models[].size_vram` |
| LM Studio | GET `http://localhost:1234/v1/models` + internal state via provider API if available |

### CORS

Sidecar runs on localhost — renderer is same-origin when served from Tauri webview. No CORS concerns.

---

## VI. BUILD PHASES

### Phase 0 — Project Foundation
- [x] Read and digest `hermes-studio.html` prototype (1,682 lines)
- [x] Write this SPEC.md
- [ ] Initialize git repo with clear commit history policy
- [ ] Add `.gitignore` for node_modules, .next, src-tauri/target

### Phase 1 — Next.js + Tauri Scaffold ✓ COMPLETED in spirit
```bash
cd XAVi-HERMESUI
npm create next-app@latest . --typescript --tailwind --app --eslint --src-dir
# Note: repo already has commits; scaffold into subdir if needed, then move files
```

### Phase 2 — Design System Port
- [ ] `globals.css` with ALL CSS variables from prototype `<style>` block verbatim
- [ ] Tailwind v4 configuration mapping to prototype tokens
- [ ] shadcn/ui installation + base component reskinning

### Phase 3 — Core Layout Shell
- [ ] Sidebar (Fleet list, Shared nav, Wired footer)
- [ ] TopChrome (⌘K button, profile mode indicator)
- [ ] ChapterHeader component with roman numeral, kicker, serif display pattern
- [ ] Zustand stores: profiles, sessions, settings

### Phase 4 — Per-Profile Surfaces
- [ ] ProfileCanvas routing with tab state persistence per-profile
- [ ] Console (streaming chat, session management)
- [ ] Sessions list + cadence panel
- [ ] Skills (profile-level equip/available toggle grid)
- [ ] Memory (placeholder graph wired to profile accent)
- [ ] Config (read-only display)

### Phase 5 — Shared Surfaces
- [ ] Mission Control with fleet grid and pulse stats
- [ ] Kanban board (drag-and-drop columns, cards from sessions/goals)
- [ ] Journal (daily log entries auto-linked to sessions)
- [ ] Goals (goal list with progress tracking)
- [ ] Studio / Substrate tab → live stat cards reading from sidecar SSE
- [ ] Shared Skills atelier view grouped by skill group
- [ ] Settings page with export/import/profile management
- [ ] Claw3D iframe embed

### Phase 6 — Command Palette + Profile Drawer
- [ ] ⌘K palette with profile/shared search
- [ ] ProfileDrawer (create/edit) with provider testing and model list autocomplete

### Phase 7 — System Monitor Surface (XIII)
- [ ] Full GPU panel: VRAM history chart, utilization gauge, temp trend line
- [ ] Process table: PID / model / context / throughput per active inference
- [ ] Wired to sidecar SSE stream at `GET http://localhost:18973/api/telemetry`

### Phase 8 — Telemetry Sidecar (Node.js)
- [ ] Express server on port 18973
- [ ] System collector (CPU, RAM via os module)
- [ ] GPU collector: nvidia-smi subprocess for NVIDIA; system_profiler for Apple Silicon
- [ ] Ollama model state collector (`/api/ps`)
- [ ] LM Studio model state collector (`/v1/models`)
- [ ] SSE endpoint streaming TelemetrySnapshot every 5 seconds
- [ ] Integration test script

### Phase 9 — Polish + Tauri Integration
- [ ] `prefers-reduced-motion` respected throughout (from prototype)
- [ ] Error boundaries per surface
- [ ] Loading skeletons on async surfaces
- [ ] Mobile responsive: sidebar collapses, cells scale via clamp()
- [ ] Tauri window configuration (title bar, min size, menu)

### Phase 10 — GitHub Push + Release
- [ ] Commit each phase separately with descriptive messages
- [ ] Tag release v0.1.0 after Phase 9 completion

---

*Last updated: May 23, 2026 · Build initiated*