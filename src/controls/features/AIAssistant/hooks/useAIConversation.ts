import OpenAI from "openai";
import { useCallback, useState } from "react";
import type { AIAssistantConfig } from "../config/aiConfig";
import { AI_CONFIG } from "../config/aiConfig";
import { AI_TOOLS } from "../config/tools";
import type { VFMessage } from "../types";
import { getSystemMessage } from "../utils/getSystemPrompt";
import { getCredentials } from "../utils/providers";

interface UseAIConversationProps {
  config: AIAssistantConfig;
  executeTool: (toolName: string, args: any) => Promise<any>;
  onMessagesUpdate: (messages: VFMessage[]) => void;
}

/**
 * Custom hook for managing AI conversation logic
 */
export function useAIConversation({
  config,
  executeTool,
  onMessagesUpdate,
}: UseAIConversationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: VFMessage, previousMessages: VFMessage[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const credentials = getCredentials();
        if (!credentials.openai) {
          throw new Error(
            "OpenAI API key not found. Please set your credentials.",
          );
        }

        const client = new OpenAI({
          apiKey: credentials.openai,
          dangerouslyAllowBrowser: true,
        });

        const newMessages = [...previousMessages, userMessage];
        onMessagesUpdate(newMessages);

        // System message
        const systemMessage = {
          role: "system" as const,
          content: getSystemMessage({
            type: config.type || "worker",
            role: config.role || "setup",
          }),
        };

        // Handle conversation with potential multiple tool call rounds
        let currentMessages = [...newMessages];
        let roundCount = 0;

        while (roundCount < AI_CONFIG.maxToolCallRounds) {
          const response = await client.chat.completions.create({
            model: AI_CONFIG.model,
            messages: [systemMessage, ...currentMessages],
            tools: AI_TOOLS,
            tool_choice: "auto",
          });

          const assistantMessage = response.choices[0]?.message;
          if (!assistantMessage) {
            throw new Error("No response from OpenAI");
          }

          // Check if there are tool calls to process
          if (
            assistantMessage.tool_calls &&
            assistantMessage.tool_calls.length > 0
          ) {
            const toolResults: Array<{
              tool_call_id: string;
              content: string;
            }> = [];

            // Process all tool calls in this response
            for (const toolCall of assistantMessage.tool_calls) {
              try {
                let result: any;
                if (toolCall.type === "function") {
                  const args = JSON.parse(toolCall.function.arguments);
                  result = await executeTool(toolCall.function.name, args);
                }

                toolResults.push({
                  tool_call_id: toolCall.id,
                  content:
                    typeof result === "string"
                      ? result
                      : JSON.stringify(result),
                });
              } catch (error) {
                toolResults.push({
                  tool_call_id: toolCall.id,
                  content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                });
              }
            }

            // Add assistant message with tool calls
            const assistantMessageWithTools: VFMessage = {
              role: "assistant",
              content: assistantMessage.content || "",
              tool_calls: assistantMessage.tool_calls,
            };

            const toolMessages: VFMessage[] = toolResults.map((result) => ({
              role: "tool",
              content: result.content,
              tool_call_id: result.tool_call_id,
            }));

            // Update current messages
            currentMessages = [
              ...currentMessages,
              assistantMessageWithTools,
              ...toolMessages,
            ];
            onMessagesUpdate(currentMessages);

            roundCount++;
          } else {
            // No more tool calls, add final response and exit loop
            const finalAssistantMessage: VFMessage = {
              role: "assistant",
              content:
                assistantMessage.content ||
                "I've completed the requested changes.",
            };
            onMessagesUpdate([...currentMessages, finalAssistantMessage]);
            break;
          }
        }

        if (roundCount >= AI_CONFIG.maxToolCallRounds) {
          console.warn(
            "Maximum tool call rounds reached, stopping conversation",
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [config, executeTool, onMessagesUpdate],
  );

  return {
    sendMessage,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
