'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ChapterHeader — Literary section header with Roman numeral + kicker pattern
// Matches the premium mockup design with serif typography
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
    <div className="px-10 pt-10 pb-2 relative hx-fade-up">
      {/* Numeral + rule + kicker row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="hx-serif italic text-[18px]" style={{ color: accent }}>
          {numeral}.
        </span>
        <span
          className="w-8 h-px"
          style={{ background: 'rgba(255,255,255,.18)' }}
        />
        <span className="hx-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: '#5a5a52' }}>
          {kicker}
        </span>
      </div>

      {/* Title + italic accent */}
      <h1 className="hx-serif text-[58px] leading-[1.02] tracking-tight" style={{ color: '#e8e8e3' }}>
        {title}
        {italic && (
          <span className="italic ml-3" style={{ color: '#c9a76c', fontStyle: 'italic' }}>
            {italic}
          </span>
        )}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="hx-serif italic text-[19px] mt-3 max-w-2xl leading-snug" style={{ color: '#7a7a72' }}>
          {subtitle}
        </p>
      )}

      {/* EST timestamp */}
      <div className="hx-mono text-[10px] uppercase tracking-[0.22em] mt-5" style={{ color: '#c9a76c' }}>
        {time} • {day.toUpperCase()} • NEW YORK
      </div>
    </div>
  );
}
