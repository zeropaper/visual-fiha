import { Markdown } from "@ui/Markdown";
import styles from "../AIAssistant.module.css";
import type { VFMessage } from "../types";

interface MessageListProps {
  messages: VFMessage[];
}

/**
 * Component for displaying a list of AI conversation messages
 */
export function MessageList({ messages }: MessageListProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message, index) => (
        <div
          key={`msg-${
            // biome-ignore lint/suspicious/noArrayIndexKey: message index for stable order
            index
          }`}
          className={`${styles.message} ${styles[`message--${message.role}`]}`}
        >
          <div className={styles.messageContent}>
            {typeof message.content === "string" ? (
              <Markdown>{message.content}</Markdown>
            ) : Array.isArray(message.content) ? (
              message.content.map((part, i) => (
                <span
                  key={`part-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: content part index for stable order
                    i
                  }`}
                  className={styles.messagePart}
                >
                  {part.type === "text" && <Markdown>{part.text}</Markdown>}
                  {part.type === "image_url" && (
                    <img
                      src={part.image_url.url}
                      alt="Attachment"
                      className={styles.messageImage}
                    />
                  )}
                </span>
              ))
            ) : (
              JSON.stringify(message.content)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
