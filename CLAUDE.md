# CLAUDE.md — Hermes Studio / XAVi-HERMESUI

## What this is
Hermes Studio v0.1 — a production Next.js 15 + Tauri 2 desktop app that ports the `hermes-studio.html` prototype into a full literary control plane for the Hermes agent runtime.

**Stack:** Next.js 16 (app router, TypeScript strict), Tailwind v4 CSS variables ported verbatim from prototype, Zustand for client state with localStorage persistence, TanStack Query, Node telemetry sidecar.

## Key files
- `SPEC.md` — Full design + architecture spec. Read before editing anything.
- `app/globals.css` — Every `.hx-*` utility class (orbs, glass, pills, switches). All from prototype verbatim.
- `components/layout/Sidebar.tsx` — Navigation hierarchy: FLEET (profiles) → SHARED (surfaces).
- `components/layout/StudioShell.tsx` — Main client shell. Reads store, renders surface based on mode + activeShared/profileId.
- `stores/index.ts` — All Zustand state. Profile/session/settings persist to localStorage via STORAGE_KEYS.
- `types/index.ts` — Profile, Session, Turn, Settings, Skill schemas from prototype.
- `lib/providers.ts` — streamChat() for Ollama/LMStudio/vLLM/OpenAI/etc. OAI-compat only.

## Running
```bash
# Web app (port 3456)
npm run dev

# Telemetry sidecar (separate terminal, port 18973)
cd telemetry-sidecar && npm install && npm run dev

# Open in browser
open http://localhost:3456/studio
```

## Design rules (don't break these)
- Background `#0A0A0E` — everything sits on this
- Brass accent `#c9a76c` with per-profile `accentRGB`
- Fonts: Instrument Serif (display/italic), Inter Tight (body), JetBrains Mono tabular-nums (numbers, labels, microcopy everywhere)
- Skeuomorphic orbs: two-layer radial gradient + ::after catch-light
- Glass surfaces: `backdrop-filter blur(22px) saturate(160%)`
- ChapterHeader pattern: Roman numeral → rule → KICKER MONO → serif title → italic accent → subtitle → brass mono EST timestamp
- Numerals are stable per surface (I.Mission Control, II.Console … XII.Claw3D)

## Navigation map
```
Profile axis:
  I.   Mission Control  (shared surface — not per-profile)
  II.  Console          (per active profile — streaming chat)
  III. Sessions         (per profile session list)
  IV.  Skills           (per profile skill toggles)
  V.   Memory           (per profile vector store graph)

Shared axis:
  I.   Mission Control
  V.   Memory (shared cross-agent graph)
  VI.  Kanban
  VII. Journal
  VIII.Goals
  IX.  Studio · Substrate (live GPU/RAM/VRAM meters ← needs sidecar running)
  X.   Skills (shared arsenal, shows which profiles use each skill)
  XI.  Settings
  XII. Claw3D (iframe embed at settings.claw3dUrl, default http://localhost:3000/office)
```

## Telemetry sidecar endpoints
- `GET /api/telemetry` — SSE stream, pushes JSON every 4s
- `GET /api/telemetry/snapshot` — REST one-shot snapshot
- `GET /health` — Health check

## Tauri v2 (not yet wired in this commit)
Run: `npm create tauri-app@latest` in the repo root to add desktop wrapper targeting macOS primary.
Sidecar will be added as a Tauri sidecar process.

## DO NOT
- Remove or rename `.hx-*` utility classes without updating every reference
- Change font families — brand voice is partly typographic
- Mix `??` and `||` in the same expression without parentheses (TS error TS5076)