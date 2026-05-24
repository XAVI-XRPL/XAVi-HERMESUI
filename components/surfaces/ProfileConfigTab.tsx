'use client';
import type { Profile } from '@/types';
import { PROVIDERS } from '@/types';

interface Props { profile: Profile; onEdit: () => void; }

function KVRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b hx-hairline last:border-0 text-[12px]">
      <span className="text-neutral-500">{k}</span>
      <span className="hx-mono text-[11px] text-neutral-200">{v}</span>
    </div>
  );
}

export default function ProfileConfigTab({ profile, onEdit }: Props) {
  const provider = PROVIDERS[profile.connection.provider];
  return (
    <div className="px-10 pb-16 hx-fade-up grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-4">
        {/* Identity */}
        <div className="hx-glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim">Identity</span>
            <button onClick={onEdit} className="hx-pill px-3 py-1 rounded-md text-[11px] flex items-center gap-1.5 text-neutral-300">
              Edit
            </button>
          </div>
          {[['Name', profile.name], ['Role', profile.role], ['Accent', profile.accent]].map(([k, v]) => (
            <KVRow key={String(k)} k={String(k)} v={v} />
          ))}
        </div>

        {/* Connection */}
        <div className="hx-glass rounded-2xl p-6">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Connection</span>
          {[
            ['Provider', provider?.label ?? profile.connection.provider],
            ['Endpoint', profile.connection.endpoint],
            ['Model', profile.connection.modelId || '—'],
            ['Temperature', String(profile.connection.temperature)],
            ['Max tokens', String(profile.connection.maxTokens)],
          ].map(([k, v]) => <KVRow key={k} k={k} v={v} />)}
        </div>

        {/* System prompt */}
        <div className="hx-glass rounded-2xl p-6">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">System Prompt</span>
          <pre className="hx-mono text-[12px] text-neutral-300 whitespace-pre-wrap leading-relaxed">{profile.systemPrompt}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-4">
        <div className="hx-glass rounded-2xl p-5">
          <span className="hx-mono text-[9.5px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">Actions</span>
          <button onClick={onEdit} className="hx-pill w-full rounded-xl px-4 py-2.5 text-[13px] text-neutral-200 mb-2 flex items-center justify-center gap-2">
            Edit full profile
          </button>
        </div>
      </div>
    </div>
  );
}
