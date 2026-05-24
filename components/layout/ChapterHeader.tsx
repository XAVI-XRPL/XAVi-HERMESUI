'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ChapterHeader — Literary section header with Roman numeral + kicker pattern
// Exact match to hermes-studio.html prototype
// ─────────────────────────────────────────────────────────────────────────────

interface ChapterHeaderProps {
  numeral: string;
  kicker: string;
  title: string;
  italic?: string;
  subtitle?: string;
  day: string;
  time: string;
  accent?: string;
}

export default function ChapterHeader({
  numeral,
  kicker,
  title,
  italic,
  subtitle,
  day,
  time,
  accent = '#c9a76c',
}: ChapterHeaderProps) {
  return (
    <div className="px-10 pt-10 pb-6 relative hx-fade-up">
      {/* Numeral + rule + kicker row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="hx-serif italic text-[18px]" style={{ color: accent }}>
          {numeral}.
        </span>
        <span
          className="w-8 h-px"
          style={{ background: 'rgba(255,255,255,.18)' }}
        />
        <span className="hx-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          {kicker}
        </span>
      </div>

      {/* Title + italic accent */}
      <h1 className="hx-serif text-[58px] leading-[1.02] tracking-tight text-neutral-100">
        {title}
        {italic && (
          <span className="italic hx-amber-dim ml-3">
            {italic}
          </span>
        )}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="hx-serif italic text-[19px] text-neutral-400 mt-3 max-w-2xl leading-snug">
          {subtitle}
        </p>
      )}

      {/* EST timestamp */}
      <div className="hx-mono text-[10px] uppercase tracking-[0.22em] hx-amber-dim mt-5">
        {time} · {day} · NEW YORK
      </div>
    </div>
  );
}
