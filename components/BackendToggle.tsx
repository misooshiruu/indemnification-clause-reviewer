"use client";

import type { BackendConfig, CloudProvider } from "@/lib/types";

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  gemini: "Gemini",
};

const PROVIDER_PLACEHOLDER: Record<CloudProvider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
  gemini: "gemini-1.5-flash",
};

export function BackendToggle({
  config,
  onChange,
}: {
  config: BackendConfig;
  onChange: (c: BackendConfig) => void;
}) {
  const set = (patch: Partial<BackendConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">LLM backend</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Bring your own cloud key, or run a local model with Ollama. Keys stay in your
          browser and are sent only with each request.
        </p>
      </div>

      {/* mode pill toggle */}
      <div className="inline-flex rounded-full bg-slate-100 p-1">
        {(["cloud", "ollama"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => set({ mode })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              config.mode === mode
                ? "bg-white text-brand-600 shadow-soft"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {mode === "cloud" ? "Cloud (BYO key)" : "Local (Ollama)"}
          </button>
        ))}
      </div>

      {config.mode === "cloud" ? (
        <div className="space-y-3">
          <div className="inline-flex flex-wrap gap-1.5">
            {(Object.keys(PROVIDER_LABELS) as CloudProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set({ provider: p })}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  config.provider === p
                    ? "bg-brand text-white shadow-soft"
                    : "bg-slate-100 text-slate-500 hover:text-slate-700"
                }`}
              >
                {PROVIDER_LABELS[p]}
              </button>
            ))}
          </div>
          <input
            type="password"
            value={config.apiKey ?? ""}
            onChange={(e) => set({ apiKey: e.target.value })}
            placeholder={`${
              config.provider ? PROVIDER_LABELS[config.provider] : "Provider"
            } API key`}
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
          />
          <input
            type="text"
            value={config.model ?? ""}
            onChange={(e) => set({ model: e.target.value })}
            placeholder={`Model (default: ${
              config.provider ? PROVIDER_PLACEHOLDER[config.provider] : "—"
            })`}
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={config.ollamaUrl ?? ""}
            onChange={(e) => set({ ollamaUrl: e.target.value })}
            placeholder="Ollama URL (default: http://localhost:11434)"
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
          />
          <input
            type="text"
            value={config.ollamaModel ?? ""}
            onChange={(e) => set({ ollamaModel: e.target.value })}
            placeholder="Model (e.g. llama3.1)"
            className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
          />
        </div>
      )}
    </div>
  );
}
