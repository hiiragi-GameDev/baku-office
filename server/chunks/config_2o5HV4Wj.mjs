globalThis.process ??= {};
globalThis.process.env ??= {};
const DEFAULT_MODELS = {
  gemini: "gemini-2.5-flash",
  claude: "claude-sonnet-5",
  openai: "gpt-4o-mini",
  // OpenAI（ChatGPT・BYOK）。既定は低コスト/高速の 4o-mini。
  workers_ai: "@cf/meta/llama-3.1-8b-instruct-fast",
  // Cloudflare Workers AI（CF上で稼働・ニューロン課金）。
  // WHY -fast：無印 @cf/meta/llama-3.1-8b-instruct は 2026-05-30 に廃止。-fast バリアントは存続（プロンプト互換のドロップイン）。
  grok: "grok-4.3",
  // xAI Grok（OpenAI互換・BYOK）。既定は汎用の grok-4.3。env GROK_MODEL で上書き可。
  github_models: "openai/gpt-4o-mini",
  // GitHub Models（OpenAI互換・GitHub PAT）。無料枠あり。env GITHUB_MODELS_MODEL で上書き可。
  groq: "llama-3.3-70b-versatile",
  // Groq（OpenAI互換・無料/CC不要）。高速。env GROQ_MODEL で上書き可。
  cerebras: "llama-3.3-70b"
  // Cerebras（OpenAI互換・無料/CC不要）。高速。env CEREBRAS_MODEL で上書き可。
};
const DEFAULT_PRICING = {
  gemini: { in: 0.3, out: 2.5 },
  claude: { in: 3, out: 15 },
  openai: { in: 0.15, out: 0.6 },
  // gpt-4o-mini 概算。env MODEL_PRICING で上書き可。
  workers_ai: { in: 0.05, out: 0.3 }
};
const NEURON_USD = 0.011 / 1e3;
function neuronsFromUsd(usd) {
  return usd > 0 ? Math.round(usd / NEURON_USD) : 0;
}
function geminiModelId(env) {
  return env.GEMINI_MODEL?.trim() || DEFAULT_MODELS.gemini;
}
function claudeModelId(env) {
  return env.CLAUDE_MODEL?.trim() || DEFAULT_MODELS.claude;
}
function openaiModelId(env) {
  return env.OPENAI_MODEL?.trim() || DEFAULT_MODELS.openai;
}
function workersAiModelId(env) {
  return env.WORKERS_AI_MODEL?.trim() || DEFAULT_MODELS.workers_ai;
}
function grokModelId(env) {
  return env.GROK_MODEL?.trim() || DEFAULT_MODELS.grok;
}
function githubModelsModelId(env) {
  return env.GITHUB_MODELS_MODEL?.trim() || DEFAULT_MODELS.github_models;
}
function groqModelId(env) {
  return env.GROQ_MODEL?.trim() || DEFAULT_MODELS.groq;
}
function cerebrasModelId(env) {
  return env.CEREBRAS_MODEL?.trim() || DEFAULT_MODELS.cerebras;
}
const WORKERS_AI_MODELS = [
  { id: "@cf/meta/llama-3.1-8b-instruct-fast", label: "標準", note: "高速・軽量（既定）" },
  { id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", label: "高性能", note: "賢いが少し遅い（70B）" }
];
function isValidWorkersAiModel(id) {
  return WORKERS_AI_MODELS.some((m) => m.id === id);
}
const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", note: "高速・低コスト（既定）" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", note: "高品質・やや低速/高コスト" }
];
function isValidGeminiModel(id) {
  return GEMINI_MODELS.some((m) => m.id === id);
}
const CLAUDE_MODELS = [
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", note: "速い・低コスト" },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", note: "バランス（既定）" },
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", note: "最高精度・高コスト" }
];
function isValidClaudeModel(id) {
  return CLAUDE_MODELS.some((m) => m.id === id);
}
const OPENAI_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o mini", note: "高速・低コスト（既定）" },
  { id: "gpt-4o", name: "GPT-4o", note: "高品質・やや高コスト" }
];
function isValidOpenAiModel(id) {
  return OPENAI_MODELS.some((m) => m.id === id);
}
const GROK_MODELS = [
  { id: "grok-4.3", name: "Grok 4.3", note: "汎用・高性能（既定）" },
  { id: "grok-4", name: "Grok 4", note: "高品質・画像対応" },
  { id: "grok-code-fast-1", name: "Grok Code Fast", note: "コーディング向け・高速" }
];
function isValidGrokModel(id) {
  return GROK_MODELS.some((m) => m.id === id);
}
const GITHUB_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini", note: "高速・無料枠（既定）" },
  { id: "openai/gpt-4o", name: "GPT-4o", note: "高品質" },
  { id: "meta/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", note: "オープンモデル・大規模" },
  { id: "deepseek/DeepSeek-R1", name: "DeepSeek R1", note: "推論特化" }
];
function isValidGithubModelsModel(id) {
  return GITHUB_MODELS.some((m) => m.id === id);
}
const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", note: "汎用・高性能（既定）" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", note: "高速・軽量" },
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", note: "推論特化・大規模" }
];
function isValidGroqModel(id) {
  return GROQ_MODELS.some((m) => m.id === id);
}
const CEREBRAS_MODELS = [
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", note: "汎用・高性能（既定）" },
  { id: "gpt-oss-120b", name: "GPT-OSS 120B", note: "推論特化・大規模" },
  { id: "llama-4-scout", name: "Llama 4 Scout", note: "新世代・高速" }
];
function isValidCerebrasModel(id) {
  return CEREBRAS_MODELS.some((m) => m.id === id);
}
function modelDisplayName(provider, modelId) {
  if (!modelId) return "";
  const wa = WORKERS_AI_MODELS.find((m) => m.id === modelId);
  if (provider === "workers_ai" || wa) return wa?.label ?? modelId;
  const named = provider === "gemini" ? GEMINI_MODELS : provider === "claude" ? CLAUDE_MODELS : provider === "openai" ? OPENAI_MODELS : provider === "grok" ? GROK_MODELS : provider === "github_models" ? GITHUB_MODELS : provider === "groq" ? GROQ_MODELS : provider === "cerebras" ? CEREBRAS_MODELS : [];
  return named.find((m) => m.id === modelId)?.name ?? modelId;
}
function hasPricing(env, provider) {
  return Boolean(resolvePricing(env)[provider]);
}
function resolvePricing(env) {
  const merged = { ...DEFAULT_PRICING };
  const raw = env.MODEL_PRICING;
  if (!raw) return merged;
  try {
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      const i = Number(v?.in), o = Number(v?.out);
      if (Number.isFinite(i) && i >= 0 && Number.isFinite(o) && o >= 0) merged[k] = { in: i, out: o };
    }
  } catch {
  }
  return merged;
}
export {
  CEREBRAS_MODELS,
  CLAUDE_MODELS,
  DEFAULT_MODELS,
  DEFAULT_PRICING,
  GEMINI_MODELS,
  GITHUB_MODELS,
  GROK_MODELS,
  GROQ_MODELS,
  NEURON_USD,
  OPENAI_MODELS,
  WORKERS_AI_MODELS,
  cerebrasModelId,
  claudeModelId,
  geminiModelId,
  githubModelsModelId,
  grokModelId,
  groqModelId,
  hasPricing,
  isValidCerebrasModel,
  isValidClaudeModel,
  isValidGeminiModel,
  isValidGithubModelsModel,
  isValidGrokModel,
  isValidGroqModel,
  isValidOpenAiModel,
  isValidWorkersAiModel,
  modelDisplayName,
  neuronsFromUsd,
  openaiModelId,
  resolvePricing,
  workersAiModelId
};
