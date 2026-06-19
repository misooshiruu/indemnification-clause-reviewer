import type { CloudProvider } from "../types";

// Cloud API keys live in the server environment (.env), never in the client or
// the request body. Each provider reads its own conventional variable name.
const ENV_VAR: Record<CloudProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export function envVarName(provider: CloudProvider): string {
  return ENV_VAR[provider];
}

export function envApiKey(provider: CloudProvider): string | undefined {
  return process.env[ENV_VAR[provider]]?.trim() || undefined;
}

export function configuredProviders(): Record<CloudProvider, boolean> {
  return {
    anthropic: Boolean(envApiKey("anthropic")),
    openai: Boolean(envApiKey("openai")),
    gemini: Boolean(envApiKey("gemini")),
  };
}
