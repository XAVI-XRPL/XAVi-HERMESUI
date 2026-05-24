'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TopChrome — Minimal floating ⌘K command palette trigger (ChatGPT-style)
// Sticks to top-right corner of the main content area.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onCmdK: () => void;
}

export default function TopChrome({ onCmdK }: Props) {
  return (
    <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
      {/* ⌘K palette trigger */}
      <button
        onClick={onCmdK}
        title="Command Palette (⌘K)"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] transition-all duration-150 hover:bg-white/[0.05]"
        style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          color: '#6a6a62',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth={1.8} className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span>Search</span>
        <kbd
          className="hx-mono text-[9px] uppercase tracking-wider"
          style={{
            background: 'rgba(255,255,255,.06)',
            borderRadius: 4,
            padding: '1px 5px',
            color: '#4a4a42',
          }}
        >
          ⌘K
        </kbd>
      </button>
    </div>
  );
}