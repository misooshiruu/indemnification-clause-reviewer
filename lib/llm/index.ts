import { COMPONENTS } from "../components";
import type {
  AnalyzeResult,
  BackendConfig,
  ComponentId,
  PartyConfig,
  Positions,
  ReviseResult,
  RiskFactors,
  SuggestedEdit,
} from "../types";
import { callAnthropic } from "./anthropic";
import { callGemini } from "./gemini";
import { callOllama } from "./ollama";
import { callOpenAI } from "./openai";
import { buildAnalyzePrompt, buildRevisePrompt } from "./prompts";

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
  gemini: "gemini-1.5-flash",
};

function runPrompt(cfg: BackendConfig, prompt: string): Promise<string> {
  if (cfg.mode === "ollama") {
    const url = cfg.ollamaUrl?.trim() || "http://localhost:11434";
    const model = cfg.ollamaModel?.trim();
    if (!model) {
      throw new Error("Select an Ollama model (e.g. llama3.1) in the backend settings.");
    }
    return callOllama(url, model, prompt);
  }

  // cloud
  const provider = cfg.provider;
  const apiKey = cfg.apiKey?.trim();
  if (!provider) throw new Error("Choose a cloud provider in the backend settings.");
  if (!apiKey) throw new Error("Paste your API key in the backend settings.");
  const model = cfg.model?.trim() || DEFAULT_MODELS[provider];

  switch (provider) {
    case "anthropic":
      return callAnthropic(apiKey, model, prompt);
    case "openai":
      return callOpenAI(apiKey, model, prompt);
    case "gemini":
      return callGemini(apiKey, model, prompt);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Tolerant JSON extraction: strip code fences, then grab the first balanced
// object. Models occasionally wrap JSON in prose despite instructions.
function parseJson<T>(raw: string): T {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Model did not return parseable JSON.");
  }
  const slice = s.slice(start, end + 1);
  try {
    return JSON.parse(slice) as T;
  } catch {
    throw new Error("Model returned malformed JSON.");
  }
}

const clamp = (n: unknown): number => {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
};

function normalizePositions(raw: Record<string, unknown> | undefined): Positions {
  const out = {} as Positions;
  for (const c of COMPONENTS) {
    out[c.id] = clamp(raw?.[c.id]);
  }
  return out;
}

function normalizeRiskFactors(raw: Record<string, unknown> | undefined): RiskFactors {
  const b = (k: string) => Boolean(raw?.[k]);
  return {
    hasSeparateLoLCap: b("hasSeparateLoLCap"),
    indemnityExcludedFromCap: b("indemnityExcludedFromCap"),
    hasConsequentialWaiver: b("hasConsequentialWaiver"),
    inCumulativeRemediesClause: b("inCumulativeRemediesClause"),
  };
}

export async function analyze(
  clause: string,
  party: PartyConfig,
  cfg: BackendConfig,
): Promise<AnalyzeResult> {
  const raw = await runPrompt(cfg, buildAnalyzePrompt(clause, party));
  const parsed = parseJson<{
    positions?: Record<string, unknown>;
    riskFactors?: Record<string, unknown>;
    notes?: string;
  }>(raw);
  return {
    positions: normalizePositions(parsed.positions),
    riskFactors: normalizeRiskFactors(parsed.riskFactors),
    notes: typeof parsed.notes === "string" ? parsed.notes : undefined,
  };
}

const VALID_IDS = new Set<string>(COMPONENTS.map((c) => c.id));

export async function revise(
  clause: string,
  party: PartyConfig,
  positions: Positions,
  cfg: BackendConfig,
): Promise<ReviseResult> {
  const raw = await runPrompt(cfg, buildRevisePrompt(clause, party, positions));
  const parsed = parseJson<{ edits?: unknown[] }>(raw);
  const rawEdits = Array.isArray(parsed.edits) ? parsed.edits : [];

  const edits: SuggestedEdit[] = [];
  rawEdits.forEach((e, i) => {
    const obj = e as Record<string, unknown>;
    const original = typeof obj.original === "string" ? obj.original : "";
    const replacement = typeof obj.replacement === "string" ? obj.replacement : "";
    const componentId = String(obj.componentId);
    // Only keep edits whose original actually appears in the clause.
    if (!original || !clause.includes(original)) return;
    if (!VALID_IDS.has(componentId)) return;
    edits.push({
      id: `edit-${i}`,
      componentId: componentId as ComponentId,
      contextBefore: typeof obj.contextBefore === "string" ? obj.contextBefore : "",
      original,
      replacement,
      rationale: typeof obj.rationale === "string" ? obj.rationale : "",
    });
  });

  return { edits };
}
