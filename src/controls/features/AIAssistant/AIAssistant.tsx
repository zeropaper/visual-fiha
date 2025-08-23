import { useCode } from "@hooks/useCode";
import { useTakeScreenshot } from "@hooks/useTakeScreenshot";
import { Button } from "@ui/Button";
import { Markdown } from "@ui/Markdown";
import { Textarea } from "@ui/Textarea";
import textareaStyles from "@ui/Textarea.module.css";
import {
  CameraIcon,
  FileIcon,
  KeyIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import OpenAI from "openai";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LayerConfig, ScriptInfo } from "src/types";
import styles from "./AIAssistant.module.css";
import { AIAssistantCredentialsForm } from "./CredentialsForm";
import { getScript, setScript } from "./tools/scripts";
import type { FileUIPart, VFMessage } from "./types";
import { filesToFileUIParts } from "./utils/attachments";
import { getSystemMessage } from "./utils/getSystemPrompt";
import { getCredentials, hasCredentials } from "./utils/providers";

export function AIAssistant({
  role,
  type,
  id,
  layerType,
  onFinishResize,
}: Partial<ScriptInfo> & {
  layerType?: LayerConfig["type"] | null;
  onFinishResize?: () => void;
}) {
  const [{ code: setupScript }, setSetupScript] = useCode(
    "setup",
    type || "worker",
    id || "worker",
  );
  const [{ code: animationScript }, setAnimationScript] = useCode(
    "animation",
    type || "worker",
    id || "worker",
  );
  const takeScreenshot = useTakeScreenshot();

  // Get storage key for this layer
  const layerId = id || "worker";
  const storageKey = `vf-ai-messages-${layerId}`;

  // Load messages from localStorage
  const loadMessagesFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Failed to load messages from localStorage:", error);
    }
    return [];
  }, [storageKey]);

  // Save messages to localStorage
  const saveMessagesToStorage = useCallback(
    (messages: VFMessage[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.warn("Failed to save messages to localStorage:", error);
      }
    },
    [storageKey],
  );

  // State for messages and UI
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<VFMessage[]>(() =>
    loadMessagesFromStorage(),
  );
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages, saveMessagesToStorage]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear the conversation history? This action cannot be undone.",
      )
    ) {
      setMessages([]);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Tool functions
  const getScriptTool = getScript({ setupScript, animationScript });
  const setScriptTool = setScript({
    setAnimationScript,
    setSetupScript,
    getSetupScript: () => setupScript,
    getAnimationScript: () => animationScript,
    type: type || "worker",
    id: id || "worker",
    role: role || "setup",
  });

  const takeScreenshotTool = useCallback(
    async ({ layerId }: { layerId: string }) => {
      if (!layerId && id) {
        return await takeScreenshot({ layerId: id });
      }
      return await takeScreenshot({ layerId });
    },
    [takeScreenshot, id],
  );

  // AI submission logic
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() && attachments.length === 0) return;

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

        // Build message content
        const messageContent: Array<
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } }
        > = [];

        if (input.trim()) {
          messageContent.push({ type: "text", text: input.trim() });
        }

        // Add image attachments
        attachments.forEach((attachment) => {
          if (attachment.mediaType.startsWith("image/")) {
            messageContent.push({
              type: "image_url",
              image_url: { url: attachment.url },
            });
          }
        });

        const userMessage: VFMessage = {
          role: "user",
          content: messageContent,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        // Define available tools
        const tools = [
          {
            type: "function" as const,
            function: {
              name: "getScript",
              description: "Get the current setup or animation script code",
              parameters: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["setup", "animation"],
                    description: "The role of the script to get",
                  },
                },
                required: ["role"],
              },
            },
          },
          {
            type: "function" as const,
            function: {
              name: "setScript",
              description: "Set the setup or animation script code",
              parameters: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["setup", "animation"],
                    description: "The role of the script to set",
                  },
                  code: {
                    type: "string",
                    description: "The new script code",
                  },
                },
                required: ["role", "code"],
              },
            },
          },
          {
            type: "function" as const,
            function: {
              name: "takeScreenshot",
              description: "Take a screenshot of the current layer",
              parameters: {
                type: "object",
                properties: {
                  layerId: {
                    type: "string",
                    description: "The ID of the layer to screenshot",
                  },
                },
                required: ["layerId"],
              },
            },
          },
        ];

        // Send to OpenAI
        const systemMessage = {
          role: "system" as const,
          content: getSystemMessage({
            layerType,
            type: type || "worker",
            role: role || "setup",
          }),
        };

        const response = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [systemMessage, ...newMessages],
          tools,
          tool_choice: "auto",
        });

        const assistantMessage = response.choices[0]?.message;
        if (!assistantMessage) {
          throw new Error("No response from OpenAI");
        }

        // Handle conversation with potential multiple tool call rounds
        let currentMessages = [...newMessages];
        let currentResponse = response;
        const maxRounds = 5; // Prevent infinite loops
        let roundCount = 0;

        while (roundCount < maxRounds) {
          const assistantMessage = currentResponse.choices[0]?.message;
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

                  switch (toolCall.function.name) {
                    case "getScript":
                      result = await getScriptTool(args);
                      break;
                    case "setScript":
                      result = await setScriptTool(args);
                      break;
                    case "takeScreenshot":
                      result = await takeScreenshotTool(args);
                      break;
                    default:
                      result = `Unknown function: ${toolCall.function.name}`;
                  }
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

            // Update current messages and UI
            currentMessages = [
              ...currentMessages,
              assistantMessageWithTools,
              ...toolMessages,
            ];
            setMessages(currentMessages);

            // Get next response with tool results
            currentResponse = await client.chat.completions.create({
              model: "gpt-4o",
              messages: [systemMessage, ...currentMessages],
              tools,
              tool_choice: "auto",
            });

            roundCount++;
          } else {
            // No more tool calls, add final response and exit loop
            const finalAssistantMessage: VFMessage = {
              role: "assistant",
              content:
                assistantMessage.content ||
                "I've completed the requested changes.",
            };
            setMessages([...currentMessages, finalAssistantMessage]);
            break;
          }
        }

        if (roundCount >= maxRounds) {
          console.warn(
            "Maximum tool call rounds reached, stopping conversation",
          );
        }

        // Clear input and attachments
        setInput("");
        setAttachments([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [
      input,
      attachments,
      messages,
      getScriptTool,
      setScriptTool,
      takeScreenshotTool,
      type,
      role,
      layerType,
    ],
  );

  // Helper functions for file handling
  const addFiles = useCallback((newFiles: FileUIPart[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleInputResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Adjust the Textarea height dynamically
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      // Trigger Monaco editor layout adjustment
      onFinishResize?.();
    }
  }, [onFinishResize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    handleInputResize();
  }, [input, messages, handleInputResize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    onFinishResize?.();
    setShowCredentialsForm(!hasCredentials());

    const resizeObserver = new ResizeObserver(() => {
      handleInputResize();
    });
    if (textareaRef.current) {
      resizeObserver.observe(textareaRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (showCredentialsForm) {
    return (
      <AIAssistantCredentialsForm
        onClose={() => setShowCredentialsForm(false)}
      />
    );
  }

  return (
    <form
      className={["ai-assistant", styles.form].join(" ")}
      onSubmit={handleSubmit}
    >
      {messages?.length ? (
        <div className={styles.messagesContainer} ref={messagesRef}>
          {messages.map((message, index) => (
            <div
              key={`msg-${
                // biome-ignore lint/suspicious/noArrayIndexKey: message index for stable order
                index
              }`}
              className={`${styles.message} ${styles[`message--${message.role}`]}`}
            >
              <div className={styles.messageContent}>
                {typeof message.content === "string"
                  ? message.content
                  : Array.isArray(message.content)
                    ? message.content.map((part, i) => (
                        <span
                          key={`part-${
                            // biome-ignore lint/suspicious/noArrayIndexKey: content part index for stable order
                            i
                          }`}
                          className={styles.messagePart}
                        >
                          {part.type === "text" && (
                            <Markdown>{part.text}</Markdown>
                          )}
                          {part.type === "image_url" && (
                            <img
                              src={part.image_url.url}
                              alt="Attachment"
                              className={styles.messageImage}
                            />
                          )}
                        </span>
                      ))
                    : JSON.stringify(message.content)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.status}>Processing...</div>}
      <div className={styles.main}>
        <div className={styles.inputs}>
          <div className={styles.context}>
            <Button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              variant="icon"
            >
              <FileIcon />
            </Button>
            <input
              className={styles.filesInput}
              type="file"
              name="files"
              multiple
              accept="image/*"
              onChange={(event) => {
                if (event.target.files) {
                  filesToFileUIParts(Array.from(event.target.files)).then(
                    addFiles,
                  );
                }
              }}
              ref={filesInputRef}
            />

            <Button
              type="button"
              onClick={() => {
                if (!id) {
                  console.warn("No layer ID provided for screenshot.");
                  return;
                }
                takeScreenshot({ layerId: id }).then((result) => {
                  addFiles([
                    {
                      mediaType: "image/png",
                      type: "file",
                      url: result,
                      filename: `screenshot-${id}.png`,
                    },
                  ]);
                });
              }}
              variant="icon"
              title="Take a screenshot of the layer"
              disabled={isLoading || !id}
            >
              <CameraIcon />
            </Button>

            {attachments.length > 0 && (
              <div className={styles.attachments}>
                {attachments.map((attachment, index) => (
                  <div
                    key={`attachment-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: attachment index for stable order
                      index
                    }`}
                    className={styles.context}
                  >
                    <span>{attachment.filename}</span>
                    <Button
                      type="button"
                      onClick={() => removeFile(index)}
                      variant="icon"
                      title="Remove attachment"
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Textarea
            className={[styles.textarea, textareaStyles.textarea].join(" ")}
            onChange={(evt) => {
              evt.preventDefault();
              setInput(evt.target.value);
            }}
            ref={textareaRef}
            value={input}
            name="input"
            placeholder="Draw some..."
            // disabled={disabled}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLTextAreaElement).form?.requestSubmit();
              }
            }}
          />
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            onClick={clearConversation}
            title="Clear conversation history"
            variant="icon"
            disabled={messages.length === 0}
          >
            <Trash2Icon />
          </Button>

          <Button
            type="button"
            onClick={() => {
              setShowCredentialsForm(true);
            }}
            title="Set AI assistant credentials"
            variant="icon"
          >
            <KeyIcon />
          </Button>

          <Button
            type="submit"
            title="Send code to AI assistant"
            variant="icon"
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
          >
            <SendIcon />
          </Button>
        </div>
      </div>
    </form>
  );
}
