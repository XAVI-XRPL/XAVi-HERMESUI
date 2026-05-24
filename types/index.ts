// ─────────────────────────────────────────────────────────────────────────────
// HERMES STUDIO — Type Definitions
// Matches prototype schemas verbatim (localStorage v1)
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderId =
  | 'lm-studio'
  | 'ollama'
  | 'mlx-lm'
  | 'mlx-vlm'
  | 'mlx-openai'
  | 'inferencer'
  | 'vllm'
  | 'llamacpp'
  | 'openai'
  | 'anthropic'
  | 'custom';

export type ProfileStatus =
  | 'unknown'
  | 'connected'
  | 'working'
  | 'idle'
  | 'error'
  | 'sleeping';

export type SkillId =
  | 'web'
  | 'docs'
  | 'vision'
  | 'voice'
  | 'memory'
  | 'vector'
  | 'code'
  | 'markets'
  | 'scrape'
  | 'imgen';

export type ProfileTabId = 'console' | 'sessions' | 'skills' | 'memory' | 'config';
export type SharedSurfaceId =
  | 'mission'
  | 'memory'
  | 'kanban'
  | 'journal'
  | 'goals'
  | 'studio'
  | 'skills'
  | 'settings'
  | 'claw3d';

export interface ConnectionConfig {
  provider: ProviderId;
  endpoint: string;
  modelId: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  accent: string;        // hex e.g. '#5DADE2'
  accentRGB: string;     // '93,173,226' — for rgba() CSS vars
  systemPrompt: string;
  connection: ConnectionConfig;
  skills: SkillId[];
  status: ProfileStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface Turn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  streaming?: boolean;   // true while response is in progress
  latencyMs?: number;    // set after streaming completes
  modelId?: string;
  error?: boolean;
}

export interface Session {
  id: string;
  profileId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: Turn[];
}

export interface Skill {
  id: SkillId;
  name: string;
  group: 'Core' | 'Knowledge' | 'Files' | 'Multimodal' | 'Tools';
  desc: string;
  icon?: React.ReactNode;
}

export interface Settings {
  mode: 'profile' | 'shared';
  activeProfileId: string | null;
  activeShared: SharedSurfaceId;
  profileTabs: Record<string, ProfileTabId>;    // per-profile last-tab memory
  activeSessionId: Record<string, string>;       // per-profile active session ID
  claw3dUrl: string;
}

// ── Provider preset map (from prototype) ───────────────────────────────────

export interface ProviderPreset {
  label: string;
  endpoint: string;
  icon: string;          // single unicode char e.g. '⌬'
  auth: boolean;
  cors?: string;         // CORS hint message
}

export const PROVIDERS: Record<ProviderId, ProviderPreset> = {
  'lm-studio':  { label: 'LM Studio',            endpoint: 'http://localhost:1234',    icon: '⌬', auth: false, cors: 'Enable CORS in LM Studio → Server settings.' },
  'ollama':     { label: 'Ollama',               endpoint: 'http://localhost:11434',   icon: '◉', auth: false, cors: 'Set OLLAMA_ORIGINS="*" before starting Ollama.' },
  'mlx-lm':     { label: 'MLX (mlx_lm.server)',  endpoint: 'http://localhost:8080',    icon: '◈', auth: false, cors: 'Serve Studio from same origin via local server.' },
  'mlx-vlm':    { label: 'MLX-VLM',              endpoint: 'http://localhost:8080',    icon: '◇', auth: false, cors: 'Serve Studio from same origin via local server.' },
  'mlx-openai': { label: 'mlx-openai-server',    endpoint: 'http://localhost:8000',    icon: '◬', auth: false, cors: 'Pass --cors "*" or serve Studio locally.' },
  'inferencer': { label: 'Inferencer',           endpoint: 'http://localhost:8000',    icon: '◍', auth: false, cors: 'Verify CORS headers for localhost.' },
  'vllm':       { label: 'vLLM',                 endpoint: 'http://localhost:8000',    icon: '⬢', auth: false, cors: 'Start with --allowed-origins "*".' },
  'llamacpp':   { label: 'llama.cpp',            endpoint: 'http://localhost:8080',    icon: '⌗', auth: false, cors: 'Add --cors-allow-origin "*" to llama-server.' },
  'openai':     { label: 'OpenAI',               endpoint: 'https://api.openai.com',   icon: '◐', auth: true,  cors: '' },
  'anthropic':  { label: 'Anthropic',            endpoint: 'https://api.anthropic.com', icon: '◆', auth: true,  cors: 'Anthropic API uses /v1/messages, not OpenAI shape.' },
  'custom':     { label: 'Custom (OAI-compat)',  endpoint: 'http://localhost:8000',    icon: '◯', auth: false, cors: '' },
};

export const ACCENT_PALETTE = [
  { name: 'Atlas',   hex: '#5DADE2', rgb: '93,173,226' },
  { name: 'Hermes',  hex: '#9B7BFF', rgb: '155,123,255' },
  { name: 'Mercury', hex: '#7FE38E', rgb: '127,227,142' },
  { name: 'Iris',    hex: '#F5B041', rgb: '245,176,65' },
  { name: 'Echo',    hex: '#D96AB5', rgb: '217,106,181' },
  { name: 'Ember',   hex: '#FF6B6B', rgb: '255,107,107' },
  { name: 'Slate',   hex: '#94A3B8', rgb: '148,163,184' },
  { name: 'Mint',    hex: '#5EEAD4', rgb: '94,234,212' },
] as const;

// ── Default profile seeds (from prototype) ─────────────────────────────────

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    role: 'Generalist',
    accent: '#5DADE2',
    accentRGB: '93,173,226',
    systemPrompt:
      'You are Atlas, the generalist agent. Be precise, warm, cite sources when possible.',
    connection: {
      provider: 'lm-studio',
      endpoint: 'http://localhost:1234',
      modelId: '',
      apiKey: '',
      temperature: 0.7,
      maxTokens: 4096,
    },
    skills: ['web', 'code', 'docs', 'memory', 'vision'],
    status: 'unknown',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    role: 'Nous Portal',
    accent: '#9B7BFF',
    accentRGB: '155,123,255',
    systemPrompt:
      'You are Hermes. You speak with care, breadth, and conviction.',
    connection: {
      provider: 'ollama',
      endpoint: 'http://localhost:11434',
      modelId: '',
      apiKey: '',
      temperature: 0.7,
      maxTokens: 4096,
    },
    skills: ['web', 'memory', 'code', 'docs'],
    status: 'unknown',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    role: 'Markets',
    accent: '#7FE38E',
    accentRGB: '127,227,142',
    systemPrompt:
      'You are Mercury, a markets-focused agent. Numerate. Skeptical. Fast.',
    connection: {
      provider: 'mlx-lm',
      endpoint: 'http://localhost:8080',
      modelId: '',
      apiKey: '',
      temperature: 0.5,
      maxTokens: 4096,
    },
    skills: ['markets', 'code', 'memory', 'web'],
    status: 'unknown',
  },
  {
    id: 'iris',
    name: 'Iris',
    role: 'Research',
    accent: '#F5B041',
    accentRGB: '245,176,65',
    systemPrompt:
      'You are Iris, the research agent. Long context, careful synthesis, cite everything.',
    connection: {
      provider: 'inferencer',
      endpoint: 'http://localhost:8000',
      modelId: '',
      apiKey: '',
      temperature: 0.6,
      maxTokens: 8192,
    },
    skills: ['web', 'docs', 'vision', 'memory', 'vector'],
    status: 'unknown',
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Voice',
    accent: '#D96AB5',
    accentRGB: '217,106,181',
    systemPrompt:
      'You are Echo. Brief replies. Voice-first phrasing.',
    connection: {
      provider: 'mlx-vlm',
      endpoint: 'http://localhost:8080',
      modelId: '',
      apiKey: '',
      temperature: 0.7,
      maxTokens: 1024,
    },
    skills: ['voice', 'memory'],
    status: 'unknown',
  },
];

export const SKILLS: Skill[] = [
  { id: 'web',     name: 'Web Search',   group: 'Knowledge',  desc: 'Open-web search with citation extraction.' },
  { id: 'docs',    name: 'Documents',    group: 'Files',      desc: 'Read, write, edit .docx / .pdf / .md.' },
  { id: 'vision',  name: 'Vision',       group: 'Multimodal', desc: 'Image understanding, OCR, scene parsing.' },
  { id: 'voice',   name: 'Voice I/O',    group: 'Multimodal', desc: 'Whisper STT + Piper TTS.' },
  { id: 'memory',  name: 'Memory',       group: 'Core',       desc: 'Per-profile vector store + scratchpad.' },
  { id: 'vector',  name: 'Vector Search',group: 'Knowledge',  desc: 'Embedding search over mounted corpora.' },
  { id: 'code',    name: 'Code Exec',    group: 'Tools',      desc: 'Sandboxed Python / Node execution.' },
  { id: 'markets', name: 'Markets',      group: 'Tools',      desc: 'Quote feeds, order book, broker hooks.' },
  { id: 'scrape',  name: 'Scraper',      group: 'Knowledge',  desc: 'Headless browser with anti-bot fallback.' },
  { id: 'imgen',   name: 'Image Gen',    group: 'Multimodal', desc: 'Local SDXL / Flux pipelines.' },
];

export const SHARED_SURFACES = [
  { id: 'mission',   label: 'Mission Control', icon: null, numeral: 'I'   },
  { id: 'memory',    label: 'Memory',           icon: null, numeral: 'V'   },
  { id: 'kanban',    label: 'Kanban',           icon: null, numeral: 'VI'  },
  { id: 'journal',   label: 'Journal',          icon: null, numeral: 'VII' },
  { id: 'goals',     label: 'Goals',            icon: null, numeral: 'VIII'},
  { id: 'studio',    label: 'Studio',           icon: null, numeral: 'IX'  },
  { id: 'skills',    label: 'Skills',           icon: null, numeral: 'X'   },
  { id: 'settings',  label: 'Settings',         icon: null, numeral: 'XI'  },
  { id: 'claw3d',    label: 'Claw3D · Office',  icon: null, numeral: 'XII' },
] as const satisfies readonly {
  id: SharedSurfaceId;
  label: string;
  icon: null;
  numeral: string;
}[];

export const PROFILE_TABS = [
  { id: 'console',  label: 'Console',  numeral: 'II' } as const,
  { id: 'sessions', label: 'Sessions', numeral: 'III'} as const,
  { id: 'skills',   label: 'Skills',   numeral: 'IV' } as const,
  { id: 'memory',   label: 'Memory',   numeral: 'V'  } as const,
  { id: 'config',   label: 'Config',   numeral: 'XI' } as const,
];

// ── Storage keys (same as prototype for compat) ─────────────────────────────
export const STORAGE_KEYS = {
  profiles: 'hermes.profiles.v1',
  sessions: 'hermes.sessions.v1',
  settings: 'hermes.settings.v1',
} as const;
