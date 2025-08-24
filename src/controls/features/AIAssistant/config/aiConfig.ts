import type { ScriptInfo } from "src/types";

/**
 * AI Assistant configuration settings
 */
export const AI_CONFIG = {
  /** OpenAI model to use for chat completions */
  model: "gpt-4o" as const,

  /** Maximum number of tool call rounds to prevent infinite loops */
  maxToolCallRounds: 5,

  /** Default placeholder text for the input textarea */
  inputPlaceholder: "Draw some...",

  /** localStorage key prefix for message persistence */
  storageKeyPrefix: "vf-ai-messages",
} as const;

/**
 * Generate localStorage key for a specific layer
 */
export function getStorageKey(layerId: string): string {
  return `${AI_CONFIG.storageKeyPrefix}-${layerId}`;
}

/**
 * Configuration for AI Assistant component props
 */
export interface AIAssistantConfig extends Partial<ScriptInfo> {
  onFinishResize?: () => void;
}
