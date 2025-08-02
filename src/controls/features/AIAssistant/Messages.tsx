import { AdvancedMarkdown } from "@ui/AdvancedMarkdown";
import { Markdown } from "@ui/Markdown";
import type { UIMessage } from "ai";
import { forwardRef } from "react";
import assistantStyles from "./AIAssistant.module.css";
import styles from "./Messages.module.css";

function UserMessage({
  message,
}: {
  message: UIMessage;
}) {
  return (
    <li className={[assistantStyles.message, assistantStyles.user].join(" ")}>
      <AdvancedMarkdown className={assistantStyles.messageContent}>
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
      return (
        <span className={[styles.textPart, styles.part].join(" ")}>
          <Markdown>{part.text}</Markdown>
        </span>
      );
    case "reasoning":
      return (
        <span className={[styles.reasoningPart, styles.part].join(" ")}>
          <Markdown>{part.reasoning}</Markdown>
        </span>
      );
    case "tool-invocation":
      console.info("Tool invocation part:", part);
      return (
        <div className={[styles.toolInvocationPart, styles.part].join(" ")}>
          <span>{part.toolInvocation.toolName}</span>
          <details>
            <summary>Arguments</summary>
            <pre>
              {JSON.stringify(part.toolInvocation.args || null, null, 2)}
            </pre>
          </details>
          {part.toolInvocation.state === "partial-call" && <span>...</span>}
          {part.toolInvocation.state === "result" && (
            <details>
              <summary>Result</summary>
              <pre>{JSON.stringify(part.toolInvocation.result, null, 2)}</pre>
            </details>
          )}
        </div>
      );
    case "file":
      return (
        <span className={[styles.mimeTypePart, styles.part].join(" ")}>
          {part.mimeType}
        </span>
      );
    case "source":
      return (
        <span className={[styles.sourcePart, styles.part].join(" ")}>
          {part.source.sourceType}
        </span>
      );
    // case "step-start":
    //   return (
    //     <span className={[styles.startPart, styles.part].join(" ")}>start</span>
    //   );
    default:
      return null;
  }
}

function AssistantMessage({
  message,
}: {
  message: UIMessage;
}) {
  return message.parts?.length ? (
    <li
      className={[assistantStyles.message, assistantStyles.assistant].join(" ")}
    >
      {message.parts
        .filter(({ type }) => type !== "step-start")
        .map((part) => (
          <MessagePart key={JSON.stringify(part)} part={part} />
        ))}
    </li>
  ) : null;
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
    <ul className={assistantStyles.messages} ref={ref}>
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
