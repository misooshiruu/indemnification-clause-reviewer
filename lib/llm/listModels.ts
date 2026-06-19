import type { BackendConfig } from "../types";
import { envApiKey } from "./env";
import { explainHttpError, explainNetworkError } from "./errors";

async function getJson(
  url: string,
  headers: Record<string, string>,
  provider: string,
): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    throw new Error(explainNetworkError(provider, e));
  }
  if (!res.ok) {
    throw new Error(explainHttpError(provider, res.status, await res.text()));
  }
  return res.json();
}

// Fetch the currently-available model ids for the configured backend, so the
// dropdown never goes stale. Filters to models usable for our text generation.
export async function listModels(cfg: BackendConfig): Promise<string[]> {
  if (cfg.mode === "ollama") {
    const base = cfg.ollamaUrl?.trim() || "http://localhost:11434";
    const data = (await getJson(`${base.replace(/\/$/, "")}/api/tags`, {}, "Ollama")) as {
      models?: { name?: string }[];
    };
    return (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
  }

  if (!cfg.provider) return [];
  const key = envApiKey(cfg.provider);
  if (!key) return [];

  if (cfg.provider === "anthropic") {
    const data = (await getJson(
      "https://api.anthropic.com/v1/models?limit=100",
      { "x-api-key": key, "anthropic-version": "2023-06-01" },
      "Anthropic",
    )) as { data?: { id?: string }[] };
    return (data.data ?? []).map((m) => m.id ?? "").filter(Boolean);
  }

  if (cfg.provider === "openai") {
    const data = (await getJson(
      "https://api.openai.com/v1/models",
      { authorization: `Bearer ${key}` },
      "OpenAI",
    )) as { data?: { id?: string }[] };
    return (data.data ?? [])
      .map((m) => m.id ?? "")
      .filter((id) => /^(gpt|o\d|chatgpt)/i.test(id))
      .sort();
  }

  // gemini
  const data = (await getJson(
    `https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`,
    {},
    "Gemini",
  )) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
  return (data.models ?? [])
    .filter((m) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
    .map((m) => (m.name ?? "").replace(/^models\//, ""))
    .filter(Boolean)
    .sort();
}
