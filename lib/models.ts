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
    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash — fast (recommended)" },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro — most capable" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
};

export const DEFAULT_MODEL: Record<CloudProvider, string> = {
  anthropic: PROVIDER_MODELS.anthropic[0].id,
  openai: PROVIDER_MODELS.openai[0].id,
  gemini: PROVIDER_MODELS.gemini[0].id,
};
