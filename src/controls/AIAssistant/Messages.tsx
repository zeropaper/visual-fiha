import type { UIMessage } from "ai";
import { forwardRef } from "react";
import { AdvancedMarkdown } from "../base/AdvancedMarkdown";
import styles from "./AIAssistant.module.css";

function UserMessage({
  message,
}: {
  message: UIMessage;
}) {
  return (
    <li className={[styles.message, styles.user].join(" ")}>
      <AdvancedMarkdown className={styles.messageContent}>
        {message.content}
      </AdvancedMarkdown>
    </li>
  );
}

function MessagePart({
  part,
}: {
  part: UIMessage["parts"][number];
}) {
  switch (part.type) {
    case "text":
      return <span>{part.text}</span>;
    case "reasoning":
      return <span>{part.reasoning}</span>;
    case "tool-invocation":
      return <span>{part.toolInvocation.toolName}</span>;
    case "file":
      return <span>{part.mimeType}</span>;
    case "source":
      return <span>{part.source.sourceType}</span>;
    case "step-start":
      return <span>start</span>;
    default:
      return null;
  }
}

function AssistantMessage({
  message,
}: {
  message: UIMessage;
}) {
  console.info("Assistant message:", message);
  return (
    <li className={[styles.message, styles.assistant].join(" ")}>
      {message.parts?.length > 1 ? (
        <div>
          {message.parts.map((part) => (
            <MessagePart key={JSON.stringify(part)} part={part} />
          ))}
        </div>
      ) : null}
      <AdvancedMarkdown className={styles.messageContent}>
        {message.content}
      </AdvancedMarkdown>
    </li>
  );
}

const Messages = forwardRef(
  (
    {
      messages,
    }: {
      messages: UIMessage[];
    },
    ref: React.ForwardedRef<HTMLUListElement>,
  ) => (
    <ul className={styles.messages} ref={ref}>
      {messages.map((message) =>
        message.role === "system" ? null : message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
    </ul>
  ),
);
Messages.displayName = "Messages";
export { Messages };
