// Turn raw provider failures into clear, actionable messages for the UI.

function extractDetail(detail: string): string {
  const trimmed = detail.trim();
  try {
    const j = JSON.parse(trimmed);
    const msg = j?.error?.message ?? j?.error ?? j?.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  } catch {
    // not JSON
  }
  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
}

export function explainHttpError(
  provider: string,
  status: number,
  detail: string,
  model?: string,
): string {
  const extra = extractDetail(detail);
  const suffix = extra ? ` (${extra})` : "";
  const m = model ? ` "${model}"` : "";

  // Some providers (e.g. Gemini) return 400 rather than 401 for a bad key, so
  // sniff the message for key/auth phrasing regardless of status code.
  if (/api[\s_-]?key|unauthenticated|unauthorized|invalid x-api-key|permission/i.test(extra)) {
    return `${provider}: authentication failed — your API key looks invalid, expired, or lacks access. Double-check the key you pasted.${suffix}`;
  }

  if (status === 401 || status === 403) {
    return `${provider}: authentication failed — your API key looks invalid, expired, or lacks access. Double-check the key you pasted.${suffix}`;
  }
  if (status === 404) {
    return `${provider}: model${m} not found — pick a different model.${suffix}`;
  }
  if (status === 422 || status === 400) {
    return `${provider}: request rejected — the model${m} may be unavailable or the input was invalid.${suffix}`;
  }
  if (status === 429) {
    return `${provider}: rate limited — wait a moment and try again.${suffix}`;
  }
  if (status >= 500) {
    return `${provider}: server error (HTTP ${status}) — this is on ${provider}'s side, try again shortly.${suffix}`;
  }
  return `${provider}: request failed (HTTP ${status}).${suffix}`;
}

export function explainNetworkError(provider: string, e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  return `Couldn't reach ${provider} — check your internet connection and that the service URL is correct. (${msg})`;
}
