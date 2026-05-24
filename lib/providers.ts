// ─────────────────────────────────────────────────────────────────────────────
// Provider Client — OpenAI-compatible streaming adapter
// Ported verbatim from hermes-studio.html prototype
// Handles all local providers: LM Studio, Ollama, MLX, vLLM, llama.cpp, etc.
// ─────────────────────────────────────────────────────────────────────────────

import type { Profile } from '@/types';

/**
 * List models at a provider endpoint.
 * Works for any OAI-compat /v1/models endpoint.
 */
export async function listModels(
  endpoint: string,
  apiKey?: string
): Promise<string[]> {
  const base = endpoint.replace(/\/+$/, '');
  const url = `${base}/v1/models`;
  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.data ?? data.models ?? []).map((m: unknown) =>
    typeof m === 'string' ? m : ((m as Record<string, string>).id ?? (m as Record<string, string>).name)
  ).filter(Boolean);
}

/**
 * Stream chat completions from an OAI-compat endpoint.
 * Yields delta strings in real-time. Throws on HTTP error or abort signal.
 */
export async function* streamChat(
  profile: Profile,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  signal: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const c = profile.connection;
  const base = c.endpoint.replace(/\/+$/, '');
  const url = `${base}/v1/chat/completions`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (c.apiKey) headers['Authorization'] = `Bearer ${c.apiKey}`;

  const body = {
    model: c.modelId || 'default',
    messages: [
      { role: 'system', content: profile.systemPrompt },
      ...messages,
    ],
    stream: true as const,
    temperature: c.temperature ?? 0.7,
    max_tokens: c.maxTokens ?? 4096,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop()!;

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const p = JSON.parse(data);
        const delta = p.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed lines
      }
    }
  }
}