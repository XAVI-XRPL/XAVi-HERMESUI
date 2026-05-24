'use client';
import { useStudioStore } from '@/stores';
import type { Profile, SkillId } from '@/types';
import { SKILLS } from '@/types';

interface Props { profile: Profile; }

function KVRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b hx-hairline last:border-0 text-[12px]">
      <span className="text-neutral-500">{k}</span>
      <span className="hx-mono text-[11px] text-neutral-200">{v}</span>
    </div>
  );
}

function SkillCard({ skill, enabled, accent, accentRGB, onToggle }: {
  skill: typeof SKILLS[0]; enabled: boolean; accent: string; accentRGB: string;
  onToggle: () => void;
}) {
  return (
    <div className="hx-glass rounded-xl p-4 hover:bg-white/[0.03] transition"
         style={enabled ? { borderColor: `rgba(${accentRGB},.18)` } : { opacity: 0.7 }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[13px] font-medium text-neutral-100">{skill.name}</span>
        <button onClick={onToggle}
                className={`hx-switch ${enabled ? 'on' : ''} scale-75`}
                style={{ '--accent-rgb': accentRGB } as React.CSSProperties}>
          <div className="hx-switch-knob" />
        </button>
      </div>
      <div className="text-[11.5px] text-neutral-500 leading-snug">{skill.desc}</div>
    </div>
  );
}

export default function ProfileSkillsTab({ profile }: Props) {
  const upsertProfile = useStudioStore((s) => s.upsertProfile);
  const enabledIds = new Set(profile.skills ?? []);

  function toggle(id: SkillId) {
    const next = enabledIds.has(id)
      ? [...(profile.skills ?? [])].filter((x) => x !== id)
      : [...(profile.skills ?? []), id];
    upsertProfile({ ...profile, skills: next });
  }

  const enabled = SKILLS.filter((s) => enabledIds.has(s.id));
  const avail   = SKILLS.filter((s) => !enabledIds.has(s.id));

  return (
    <div className="px-10 pb-16 hx-fade-up grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-5">
        <div>
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Equipped · {enabled.length}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {enabled.map((s) => (
              <SkillCard key={s.id} skill={s} enabled accent={profile.accent} accentRGB={profile.accentRGB}
                         onToggle={() => toggle(s.id)} />
            ))}
          </div>
        </div>
        <div>
          <div className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim mb-3">Available</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {avail.map((s) => (
              <SkillCard key={s.id} skill={s} enabled={false} accent={profile.accent} accentRGB={profile.accentRGB}
                         onToggle={() => toggle(s.id)} />
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-4">
        <div className="hx-glass rounded-2xl p-5">
          <KVRow k="Equipped" v={enabled.length} />
          <KVRow k="Available" v={avail.length} />
          <div className="mt-4 pt-4 border-t hx-hairline">
            <div className="hx-serif italic text-[15px] text-neutral-400 leading-snug">
              "A tool you don't reach for is luggage. Trim every season."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
