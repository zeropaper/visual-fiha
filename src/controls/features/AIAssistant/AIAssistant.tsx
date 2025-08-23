import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./AIAssistant.module.css";
import { AIAssistantCredentialsForm } from "./CredentialsForm";
import { ChatInput } from "./components/ChatInput";
import { MessageList } from "./components/MessageList";
import type { AIAssistantConfig } from "./config/aiConfig";
import { useAIConversation } from "./hooks/useAIConversation";
import { useAIMessages } from "./hooks/useAIMessages";
import { useAITools } from "./hooks/useAITools";
import { useAttachments } from "./hooks/useAttachments";
import type { VFMessage } from "./types";
import { hasCredentials } from "./utils/providers";

export function AIAssistant(config: AIAssistantConfig) {
  const { id, onFinishResize } = config;
  const layerId = id || "worker";

  // State management hooks
  const { messages, updateMessages, clearConversation } =
    useAIMessages(layerId);
  const { attachments, addFiles, removeFile, clearAttachments } =
    useAttachments();
  const { executeTool, takeLayerScreenshotTool } = useAITools(config);
  const { sendMessage, isLoading, error } = useAIConversation({
    config,
    executeTool,
    onMessagesUpdate: updateMessages,
  });

  // UI state
  const [input, setInput] = useState("");
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() && attachments.length === 0) return;

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

      await sendMessage(userMessage, messages);

      // Clear input and attachments on successful send
      setInput("");
      clearAttachments();
    },
    [input, attachments, messages, sendMessage, clearAttachments],
  );

  // Handle screenshot
  const handleTakeLayerScreenshot = useCallback(() => {
    if (!id) {
      console.warn("No layer ID provided for screenshot.");
      return;
    }
    takeLayerScreenshotTool({ layerId: id }).then((result) => {
      addFiles([
        {
          mediaType: "image/png",
          type: "file",
          url: result,
          filename: `screenshot-${id}.png`,
        },
      ]);
    });
  }, [id, takeLayerScreenshotTool, addFiles]);

  // Handle input resize for Monaco editor layout
  const handleInputResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      onFinishResize?.();
    }
  }, [onFinishResize]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLTextAreaElement).form?.requestSubmit();
      }
    },
    [],
  );

  // Effects for resize handling
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
    <div className={["ai-assistant", styles.form].join(" ")}>
      <MessageList messages={messages} />
      {error && <div className={styles.error}>{error}</div>}
      {isLoading && <div className={styles.status}>Processing...</div>}
      <ChatInput
        input={input}
        onInputChange={setInput}
        attachments={attachments}
        onAddFiles={addFiles}
        onRemoveFile={removeFile}
        onTakeLayerScreenshot={handleTakeLayerScreenshot}
        onClearConversation={clearConversation}
        onShowCredentials={() => setShowCredentialsForm(true)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        canClearConversation={messages.length > 0}
        canTakeLayerScreenshot={!!id}
        textareaRef={textareaRef}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
