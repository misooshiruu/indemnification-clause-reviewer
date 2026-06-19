"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_MODEL,
  PROVIDER_MODELS,
  pickPreferredModel,
  type ModelOption,
} from "@/lib/models";
import type { BackendConfig, CloudProvider } from "@/lib/types";

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  gemini: "Gemini",
};

// Display-only mirror of the env var each provider reads on the server. Kept here
// so the client can tell the user exactly what to add to .env, without importing
// the server-side env module.
const ENV_VAR_LABELS: Record<CloudProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
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

  // Which providers have a key set in the server's .env. Fetched once so the UI
  // can show "key loaded" vs "missing" without ever seeing the key itself.
  const [keyStatus, setKeyStatus] = useState<Record<CloudProvider, boolean> | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setKeyStatus(d as Record<CloudProvider, boolean>);
      })
      .catch(() => {
        /* leave null; UI falls back to a neutral hint */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const keyConfigured = provider ? Boolean(keyStatus?.[provider]) : false;

  // Live model list fetched from the provider (so the dropdown can't go stale).
  // The server uses its env key to call the provider; the client never sends one.
  const [liveModels, setLiveModels] = useState<string[] | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLiveModels(null);
    setModelsError(null);
    if (config.mode !== "cloud" || !provider || !keyConfigured) return;

    let cancelled = false;
    setModelsLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/models", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ backend: { mode: "cloud", provider } }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Couldn't list models.");
        const list: string[] = Array.isArray(data.models) ? data.models : [];
        setLiveModels(list);
        // If the currently-selected model isn't offered, snap to a preferred
        // model in the same family (e.g. keep Anthropic on Sonnet) rather than
        // whatever the provider returns first.
        if (list.length && !list.includes(config.model ?? "")) {
          const next = pickPreferredModel(provider, list);
          if (next) onChangeRef.current({ ...config, model: next });
        }
      } catch (e) {
        if (!cancelled) setModelsError(e instanceof Error ? e.message : "Couldn't list models.");
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode, provider, keyConfigured]);

  // Models come only from the live provider list — no static fallback, so a
  // stale or wrong key surfaces an error instead of silently showing defaults.
  const staticModels: ModelOption[] = provider ? PROVIDER_MODELS[provider] : [];
  const models: ModelOption[] = (liveModels ?? []).map((id) => ({
    id,
    label: staticModels.find((m) => m.id === id)?.label ?? id,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">LLM backend</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Use a cloud provider (key read from your <span className="font-mono">.env</span>{" "}
          file on the server) or run a local model with Ollama.
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
            {mode === "cloud" ? "Cloud" : "Local (Ollama)"}
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

          {/* key status for the selected provider */}
          {!provider ? (
            <p className="text-xs text-slate-400">Choose a provider first.</p>
          ) : keyStatus === null ? (
            <p className="text-xs text-slate-400">Checking for a configured key…</p>
          ) : keyConfigured ? (
            <p className="text-xs text-emerald-600">
              Key loaded from <span className="font-mono">.env</span> (
              <span className="font-mono">{ENV_VAR_LABELS[provider]}</span>).
            </p>
          ) : (
            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
              No key found for {PROVIDER_LABELS[provider]}. Add{" "}
              <span className="font-mono">{ENV_VAR_LABELS[provider]}=…</span> to a{" "}
              <span className="font-mono">.env</span> (or{" "}
              <span className="font-mono">.env.local</span>) file in the project root and
              restart the dev server.
            </div>
          )}

          {/* model dropdown — appears once a key is configured; populated live */}
          {provider && keyConfigured && (
            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                Model
                {modelsLoading && <span className="text-slate-400">loading…</span>}
                {liveModels && !modelsLoading && (
                  <span className="text-emerald-500">live list</span>
                )}
              </span>
              {models.length > 0 ? (
                <select
                  value={config.model ?? ""}
                  onChange={(e) => set({ model: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-transparent focus:ring-brand"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              ) : null}
              {modelsError ? (
                <span className="mt-1 block text-xs text-amber-600">
                  Couldn&apos;t load models — {modelsError}
                </span>
              ) : modelsLoading ? (
                <span className="mt-1 block text-xs text-slate-400">
                  Loading available models…
                </span>
              ) : models.length > 0 ? (
                <span className="mt-1 block text-xs text-slate-400">
                  Pulled live from your account.
                </span>
              ) : (
                <span className="mt-1 block text-xs text-slate-400">
                  No usable models found for this key.
                </span>
              )}
            </label>
          )}
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
