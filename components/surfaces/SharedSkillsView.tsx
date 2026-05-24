'use client';
import { SKILLS } from '@/types';
import { useStudioStore } from '@/stores';

const GROUPS = ['Core', 'Knowledge', 'Files', 'Multimodal', 'Tools'];

export default function SharedSkillsView() {
  const profiles = useStudioStore((s) => s.profiles);

  return (
    <div className="px-10 pb-16">
      {GROUPS.map((group, gi) => {
        const groupSkills = SKILLS.filter((s) => s.group === group);
        if (!groupSkills.length) return null;
        return (
          <div key={group} className="mb-8 hx-fade-up" style={{ animationDelay: `${gi * 80}ms` }}>
            <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">{group}</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupSkills.map((skill) => {
                const usedBy = profiles.filter((p) => p.skills?.includes(skill.id));
                return (
                  <div key={skill.id} className="hx-glass rounded-2xl p-5 hover:bg-white/[0.03] transition">
                    <div className="text-[14.5px] font-medium text-neutral-100 mb-1">{skill.name}</div>
                    <div className="text-[11.5px] text-neutral-500 leading-snug mb-3">{skill.desc}</div>
                    <div className="pt-3 border-t hx-hairline flex items-center gap-2">
                      {usedBy.length > 0 ? (
                        <>
                          <span className="hx-mono text-[9px] uppercase tracking-wider hx-amber-dim mr-1">used by</span>
                          {usedBy.map((p) => (
                            <span key={p.id} className="w-2 h-2 rounded-full" style={{ background: p.accent, boxShadow: `0 0 5px ${p.accent}` }} />
                          ))}
                        </>
                      ) : (
                        <span className="hx-mono text-[9px] uppercase tracking-wider text-neutral-700">unused</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
