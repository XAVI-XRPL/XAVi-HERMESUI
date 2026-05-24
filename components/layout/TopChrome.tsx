'use client';

// ─────────────────────────────────────────────────────────────────────────────
// TopChrome — Premium COMMAND button (top-right)
// Matches mockup: pill-shaped button with keyboard shortcut badge
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onCmdK: () => void;
}

export default function TopChrome({ onCmdK }: Props) {
  return (
    <div className="absolute top-4 right-5 z-20 flex items-center gap-2">
      {/* COMMAND palette trigger */}
      <button
        onClick={onCmdK}
        title="Command Palette (⌘K)"
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium transition-all duration-200 hover:bg-white/[0.06]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.02) 100%)',
          border: '1px solid rgba(255,255,255,.08)',
          borderTopColor: 'rgba(255,255,255,.12)',
          color: '#7a7a72',
          fontFamily: "'Inter Tight', sans-serif",
          boxShadow: '0 1px 0 rgba(255,255,255,.04) inset, 0 1px 2px rgba(0,0,0,.2)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth={1.8} className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span>COMMAND</span>
        <kbd
          className="hx-mono text-[9px] uppercase tracking-wider"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02))',
            borderRadius: 4,
            padding: '2px 5px',
            color: '#5a5a52',
            border: '1px solid rgba(255,255,255,.08)',
          }}
        >
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
