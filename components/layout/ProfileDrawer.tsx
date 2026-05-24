'use client';
import { useState, useEffect } from 'react';
import type { Profile } from '@/types';
import { ACCENT_PALETTE, PROVIDERS, SKILLS, ProviderId, SkillId } from '@/types';
import { useStudioStore } from '@/stores';
import { listModels } from '@/lib/providers';

interface Props {
  profile: Profile | null; // null = creating new
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="hx-mono text-[10px] uppercase tracking-[0.22em] hx-amber-dim block mb-3">{title}</span>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="hx-mono text-[9.5px] uppercase tracking-[0.18em] text-neutral-500 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function ProfileDrawer({ profile, onClose }: Props) {
  const upsertProfile = useStudioStore((s) => s.upsertProfile);
  const deleteProfile = useStudioStore((s) => s.deleteProfile);

  // Form draft
  const [name, setName]         = useState(profile?.name ?? '');
  const [role, setRole]         = useState(profile?.role ?? '');
  const [accentHex, setAccentHex]   = useState(profile?.accent ?? ACCENT_PALETTE[0].hex);
  const [accentRGB, setAccentRGB]   = useState(profile?.accentRGB ?? ACCENT_PALETTE[0].rgb);
  const [systemPrompt, setSystemPrompt] = useState(
    profile?.systemPrompt ?? 'You are a helpful agent.'
  );
  const [providerId, setProviderId] = useState<ProviderId>((profile?.connection.provider as ProviderId) ?? 'ollama');
  const [endpoint, setEndpoint]     = useState(profile?.connection.endpoint ?? PROVIDERS['ollama'].endpoint);
  const [apiKey, setApiKey]         = useState(profile?.connection.apiKey ?? '');
  const [modelId, setModelId]       = useState(profile?.connection.modelId ?? '');
  const [temperature, setTemp]      = useState(profile?.connection.temperature ?? 0.7);
  const [maxTokens, setMaxTokens]   = useState(profile?.connection.maxTokens ?? 4096);
  const [skillIds, setSkillIds]     = useState<Set<SkillId>>(new Set(profile?.skills ?? ['memory']));

  // Connection test state
  const [models, setModels]         = useState<string[]>([]);
  const [testing, setTesting]       = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function pickProvider(id: ProviderId) {
    setProviderId(id);
    if (PROVIDERS[id]) setEndpoint(PROVIDERS[id].endpoint);
    setTestResult(null);
    setModels([]);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const list = await listModels(endpoint, apiKey || undefined);
      setModels(list);
      if (list.length > 0 && !modelId) setModelId(list[0]);
      setTestResult({ ok: true });
    } catch (e: unknown) {
      setTestResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setTesting(false);
    }
  }

  function toggleSkill(id: SkillId) {
    const next = new Set(skillIds);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSkillIds(next);
  }

  function handleSave() {
    if (!name.trim()) { alert('Name is required.'); return; }
    let id = profile?.id ?? (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ('p_' + Date.now().toString(36)));
    const p: Profile = {
      id,
      name: name.trim(),
      role: role.trim(),
      accent: accentHex,
      accentRGB,
      systemPrompt,
      connection: { provider: providerId, endpoint, modelId, apiKey, temperature, maxTokens },
      skills: [...skillIds],
      status: testResult?.ok ? 'connected' : (profile?.status ?? 'unknown'),
    };
    upsertProfile(p);
    onClose();
  }

  const isNew = !profile;

  return (
    <>
      {/* Backdrop */}
      <div className="hx-drawer-backdrop" onClick={onClose} />
      {/* Drawer panel */}
      <div className="hx-drawer hx-slidein hx-glass-elevated overflow-y-auto hx-scroll"
           style={{ borderLeft: '1px solid rgba(255,255,255,.09)', background: '#0A0A0E', backdropFilter: 'blur(28px)' }}>
        {/* Sticky header */}
        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
             style={{ background: 'rgba(10,10,14,.85)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div>
            <span className="hx-mono text-[10px] uppercase tracking-[0.22em] hx-amber-dim">
              {isNew ? 'Forge profile' : 'Edit profile'}
            </span>
            <div className="hx-serif text-[24px] text-neutral-100 mt-1">{name || 'Unnamed'}</div>
          </div>
          <button onClick={onClose} className="hx-pill p-2 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-8">
          {/* Identity */}
          <Section title="Identity">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atlas"
                     className="hx-input" />
            </Field>
            <Field label="Role">
              <input value={role} onChange={(e) => setRole(e.target.value)}
                     placeholder="Generalist · Markets…"
                     className="hx-input" />
            </Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_PALETTE.map((c) => (
                  <button key={c.hex}
                          onClick={() => { setAccentHex(c.hex); setAccentRGB(c.rgb); }}
                          title={c.name}
                          className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                          style={{
                            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.95) 0%, transparent 28%), radial-gradient(circle at 50% 50%, ${c.hex} 0%, ${c.hex}90)`,
                            boxShadow: accentHex === c.hex ? `0 0 0 2px #fff, 0 0 12px ${c.hex}` : 'none',
                          }} />
                ))}
              </div>
            </Field>
          </Section>

          {/* Connection */}
          <Section title="Connection">
            <Field label="Provider">
              <div className="grid grid-cols-3 gap-1.5">
                {Object.entries(PROVIDERS).map(([id, p]) => (
                  <button key={id}
                          onClick={() => pickProvider(id as ProviderId)}
                          className={`hx-pill px-2 py-2 rounded-lg text-[11px] flex items-center gap-1.5 truncate ${providerId === id ? 'hx-pill-active' : 'text-neutral-300'}`}>
                    <span className="hx-amber-dim text-[14px]">{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Endpoint">
              <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
                     placeholder="http://localhost:1234"
                     className="hx-input hx-mono text-[12px]" />
            </Field>

            {PROVIDERS[providerId]?.auth && (
              <Field label="API Key">
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                       placeholder="sk-…"
                       className="hx-input hx-mono text-[12px]" />
              </Field>
            )}

            {/* Test button */}
            <div className="flex items-center gap-2">
              <button onClick={testConnection} disabled={testing}
                      className="hx-pill px-3 py-2 rounded-lg text-[12px] flex items-center gap-2 disabled:opacity-50 hx-mono uppercase tracking-wider text-neutral-200">
                {testing ? (
                  <>
                    <span className="w-3 h-3 border border-current border-t-transparent animate-spin inline-block" />
                    Testing…
                  </>
                ) : 'Test & List Models'}
              </button>
              {testResult?.ok && <span className="hx-mono text-[10px] uppercase tracking-wider text-emerald-400">✓ {models.length} models</span>}
              {!testResult?.ok && testResult !== null && (
                <span className="hx-mono text-[10px] uppercase tracking-wider text-red-400">
                  ✗ {testResult.error?.slice(0, 80)}
                </span>
              )}
            </div>

            <Field label="Model">
              {models.length > 0 ? (
                <select value={modelId} onChange={(e) => setModelId(e.target.value)}
                        className="hx-input hx-mono text-[12px]">
                  <option value="">— pick a model —</option>
                  {models.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input value={modelId} onChange={(e) => setModelId(e.target.value)}
                       placeholder="e.g. llama-3.2-3b-instruct"
                       className="hx-input hx-mono text-[12px]" />
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Temperature">
                <input type="number" step="0.05" min={0} max={2}
                       value={temperature}
                       onChange={(e) => setTemp(parseFloat(e.target.value))}
                       className="hx-input hx-mono text-[12px]" />
              </Field>
              <Field label="Max tokens">
                <input type="number" min={1} value={maxTokens}
                       onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 4096)}
                       className="hx-input hx-mono text-[12px]" />
              </Field>
            </div>

            {testResult && !testResult.ok && PROVIDERS[providerId]?.cors && (
              <div className="hx-mono text-[10px] hx-amber-dim">CORS hint: {PROVIDERS[providerId].cors}</div>
            )}
          </Section>

          {/* System Prompt */}
          <Section title="System Prompt">
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                      rows={5}
                      className="hx-input hx-mono text-[12px] leading-relaxed" />
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((skill) => {
                const on = skillIds.has(skill.id);
                return (
                  <button key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`hx-pill rounded-lg px-3 py-2 flex items-center gap-2 text-left text-[12px] ${on ? 'hx-pill-active' : ''}`}>
                    <span className="shrink-0">{skill.name[0]}</span>
                    <span className="truncate">{skill.name}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Footer actions */}
          <div className="flex items-center gap-2 pt-4 border-t hx-hairline">
            <button onClick={handleSave}
                    className="hx-pill px-5 py-2.5 rounded-xl text-[13px] flex items-center gap-2"
                    style={{ background: `linear-gradient(180deg, rgba(${accentRGB},.3), rgba(${accentRGB},.1))`, borderColor: `rgba(${accentRGB},.5)`, color: accentHex }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {isNew ? 'Forge' : 'Save'}
            </button>
            <button onClick={onClose} className="hx-pill px-4 py-2.5 rounded-xl text-[13px] text-neutral-300">
              Cancel
            </button>
            {!isNew && (
              <>
                <div className="flex-1" />
                <button onClick={() => { deleteProfile(profile.id); onClose(); }}
                        className="hx-pill px-3 py-2.5 rounded-xl text-[12px] text-red-300 flex items-center gap-1.5">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .hx-input { width:100%; background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.07); border-radius: 8px; padding: 8px 12px; color: #e8e8e3; outline: none; transition: border-color .18s ease; font-size: 13px; }
        .hx-input:focus { border-color: rgba(255,255,255,.18); }
      `}</style>
    </>
  );
}
