/**
 * Configuration object for API keys of supported providers.
 */
export interface ProviderKeys {
  /** OpenAI API key */
  openai?: string;
  /** Mistral API key */
  mistral?: string;
}

/**
 * Retrieves API credentials from environment variables and localStorage.
 * Environment variables take precedence over stored credentials.
 *
 * @returns Object containing available API keys
 *
 * @example
 * ```typescript
 * const credentials = getCredentials();
 * if (credentials.openai) {
 *   // Use OpenAI API
 * }
 * ```
 */
export function getCredentials(): ProviderKeys {
  try {
    const stored = JSON.parse(
      localStorage.getItem("ai-assistant-credentials") || "{}",
    );
    const result = {
      openai: import.meta.env.VITE_OPENAI_API_KEY || stored.openai,
      mistral: import.meta.env.VITE_MISTRAL_API_KEY || stored.mistral,
    };
    return result;
  } catch (error) {
    console.error("Error accessing localStorage in getCredentials:", error);
    // Fallback to just environment variables if localStorage is not available (e.g., in Workers)
    const result = {
      openai: import.meta.env.VITE_OPENAI_API_KEY,
      mistral: import.meta.env.VITE_MISTRAL_API_KEY,
    };
    console.log("getCredentials fallback result:", {
      hasEnvOpenAI: !!import.meta.env.VITE_OPENAI_API_KEY,
      hasEnvMistral: !!import.meta.env.VITE_MISTRAL_API_KEY,
    });
    return result;
  }
}

/**
 * Checks if any API credentials are available.
 * Used to determine whether to show the credentials form on component mount.
 *
 * @returns True if at least one API key is available
 *
 * @example
 * ```typescript
 * if (!hasCredentials()) {
 *   setShowCredentialsForm(true);
 * }
 * ```
 */
export function hasCredentials() {
  const stored = getCredentials();
  return stored.openai || stored.mistral;
}

/**
 * Retrieves the API key for a specific provider.
 *
 * @param provider - The provider to get the API key for
 * @returns Promise that resolves to the API key string (empty if not found)
 *
 * @example
 * ```typescript
 * const openaiKey = await getProviderApiKey("openai");
 * if (openaiKey) {
 *   // Initialize OpenAI client
 * }
 * ```
 */
export async function getProviderApiKey(provider: keyof ProviderKeys) {
  try {
    const credentials = getCredentials();
    const key = credentials[provider] || "";
    return key;
  } catch (error) {
    console.error("Error getting provider API key:", error);
    return "";
  }
}
