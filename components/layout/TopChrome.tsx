'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TopChrome — Floating ⌘K command palette trigger, top-right
// Ported from hermes-studio.html prototype App() → TopChrome()
// ─────────────────────────────────────────────────────────────────────────────

function IconCmd({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3a3 3 0 1 0 0 6h-3V6a3 3 0 1 0-6 0v3H6a3 3 0 1 0 0 6h3v3a3 3 0 1 0 6 0v-3h3a3 3 0 1 0 0-6h-3V6a3 3 0 0 0 3-3Z" />
    </svg>
  );
}

interface TopChromeProps {
  onCmdK: () => void;
}

export default function TopChrome({ onCmdK }: TopChromeProps) {
  return (
    <div className="absolute top-5 right-6 z-30 flex items-center gap-2">
      <button
        onClick={onCmdK}
        className="hx-pill px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] text-neutral-300"
      >
        <span className="hx-amber-dim"><IconCmd size={14} /></span>
        <span className="hx-mono uppercase tracking-wider">Command</span>
        <kbd className="hx-key">⌘K</kbd>
      </button>
    </div>
  );
}