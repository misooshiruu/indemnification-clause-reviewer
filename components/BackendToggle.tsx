"use client";

import { DEFAULT_MODEL, PROVIDER_MODELS } from "@/lib/models";
import type { BackendConfig, CloudProvider } from "@/lib/types";

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  gemini: "Gemini",
};

export function BackendToggle({
  config,
  onChange,
}: {
  config: BackendConfig;
  onChange: (c: BackendConfig) => void;
}) {
  const set = (patch: Partial<BackendConfig>) => onChange({ ...config, ...patch });

  // Selecting a provider also defaults its model so the dropdown is never empty.
  const selectProvider = (p: CloudProvider) =>
    set({ provider: p, model: DEFAULT_MODEL[p] });

  const provider = config.provider;
  const models = provider ? PROVIDER_MODELS[provider] : [];

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
          {/* provider row */}
          <div className="inline-flex flex-wrap gap-1.5">
            {(Object.keys(PROVIDER_LABELS) as CloudProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => selectProvider(p)}
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

          {/* model dropdown — appears once a provider is chosen */}
          {provider ? (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500">Model</span>
              <select
                value={config.model ?? DEFAULT_MODEL[provider]}
                onChange={(e) => set({ model: e.target.value })}
                className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-transparent focus:ring-brand"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-xs text-slate-400">Choose a provider to pick a model.</p>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">API key</span>
            <input
              type="password"
              value={config.apiKey ?? ""}
              onChange={(e) => set({ apiKey: e.target.value })}
              placeholder={`${
                provider ? PROVIDER_LABELS[provider] : "Provider"
              } API key`}
              className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
            />
          </label>
          <p className="text-xs text-slate-400">
            Paste a key from your {provider ? PROVIDER_LABELS[provider] : "provider"} account.
            A wrong or expired key won&apos;t crash the app — you&apos;ll get a clear message
            when you click Review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Run a model locally with Ollama</p>
            <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
              <li>
                Install Ollama from{" "}
                <span className="font-mono text-slate-600">ollama.com</span>.
              </li>
              <li>
                Start it: <span className="font-mono text-slate-600">ollama serve</span>{" "}
                (serves at <span className="font-mono text-slate-600">http://localhost:11434</span>).
              </li>
              <li>
                Pull a model:{" "}
                <span className="font-mono text-slate-600">ollama pull qwen2.5:14b</span>.
              </li>
              <li>Enter that exact model name below.</li>
            </ol>
            <p className="mt-1.5">
              If Ollama isn&apos;t running or the model name is wrong, you&apos;ll see a clear
              message (not a crash) when you click Review.
            </p>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Ollama URL</span>
            <input
              type="text"
              value={config.ollamaUrl ?? ""}
              onChange={(e) => set({ ollamaUrl: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">Model</span>
            <input
              type="text"
              value={config.ollamaModel ?? ""}
              onChange={(e) => set({ ollamaModel: e.target.value })}
              placeholder="qwen2.5:14b"
              className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-brand"
            />
          </label>
        </div>
      )}
    </div>
  );
}
