import type { CloudProvider } from "./types";

export interface ModelOption {
  id: string;
  label: string;
}

// Selectable models per cloud provider. The first entry is treated as the
// default when a provider is chosen.
export const PROVIDER_MODELS: Record<CloudProvider, ModelOption[]> = {
  anthropic: [
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 — balanced (recommended)" },
    { id: "claude-opus-4-7", label: "Claude Opus 4.7 — most capable" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 — fastest" },
  ],
  openai: [
    { id: "gpt-4o", label: "GPT-4o — balanced (recommended)" },
    { id: "gpt-4o-mini", label: "GPT-4o mini — fast & cheap" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  gemini: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash — fast (recommended)" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro — most capable" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite — cheapest" },
  ],
};

export const DEFAULT_MODEL: Record<CloudProvider, string> = {
  anthropic: PROVIDER_MODELS.anthropic[0].id,
  openai: PROVIDER_MODELS.openai[0].id,
  gemini: PROVIDER_MODELS.gemini[0].id,
};

// When the live model list doesn't contain our exact default id, fall back to
// the same FAMILY rather than whatever the provider happens to return first
// (e.g. Anthropic should still default to a Sonnet model). The first live id
// matching the family wins; providers list newest-first, so that is the latest.
const PROVIDER_PREFERENCE: Record<CloudProvider, RegExp> = {
  anthropic: /sonnet/i,
  openai: /^gpt-4o(?!-mini)/i,
  gemini: /2\.5-flash(?!-lite)/i,
};

export function pickPreferredModel(
  provider: CloudProvider,
  list: string[],
): string | undefined {
  if (!list.length) return undefined;
  const def = DEFAULT_MODEL[provider];
  if (list.includes(def)) return def;
  return list.find((id) => PROVIDER_PREFERENCE[provider].test(id)) ?? list[0];
}
