import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";

export async function getProviderModel(
  id: `${string}:${string}`,
  getKey: (provider: keyof ProviderKeys) => Promise<string> = getProviderApiKey,
) {
  const [provider, model] = id.split(":") as [keyof ProviderKeys, string];
  const apiKey = await getKey(provider);
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(model);
    case "mistral":
      return createMistral({ apiKey })(model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export interface ProviderKeys {
  openai?: string;
  mistral?: string;
}

export function getCredentials(): ProviderKeys {
  const stored = JSON.parse(
    localStorage.getItem("ai-assistant-credentials") || "{}",
  );
  return {
    openai: import.meta.env.VITE_OPENAI_API_KEY || stored.openai,
    mistral: import.meta.env.VITE_MISTRAL_API_KEY || stored.mistral,
  };
}

export function hasCredentials() {
  const stored = getCredentials();
  return stored.openai || stored.mistral;
}

export async function getProviderApiKey(provider: keyof ProviderKeys) {
  return getCredentials()[provider] || "";
}
