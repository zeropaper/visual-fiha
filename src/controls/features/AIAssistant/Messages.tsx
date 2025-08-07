import type { UseChatHelpers } from "@ai-sdk/react";
import { AdvancedMarkdown } from "@ui/AdvancedMarkdown";
import { Button } from "@ui/Button";
import { forwardRef } from "react";
import styles from "./Messages.module.css";
import type { VFMessage } from "./types";

const Messages = forwardRef<
  HTMLUListElement,
  {
    messages: VFMessage[];
    addToolResult: UseChatHelpers<VFMessage>["addToolResult"];
  }
>(({ messages, addToolResult }, ref) => {
  return (
    <ul className={styles.messages} ref={ref}>
      {messages.map((message) => {
        return (
          <li
            key={message.id}
            className={[styles.message, styles[`${message.role}Role`]].join(
              " ",
            )}
          >
            {message.parts?.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <AdvancedMarkdown key={index}>{part.text}</AdvancedMarkdown>
                  );

                // Handle step boundaries for multi-step tool calls
                case "step-start":
                  return null;

                case "tool-askForConfirmation": {
                  const callId = part.toolCallId;

                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <div key={callId}>Loading confirmation request...</div>
                      );
                    case "input-available":
                      const confirmationInput = part.input;
                      return (
                        <div key={callId}>
                          <strong>Confirmation Required:</strong>
                          <p>{confirmationInput.message}</p>
                          <div>
                            <Button
                              onClick={() =>
                                addToolResult({
                                  tool: "askForConfirmation",
                                  toolCallId: callId,
                                  output: "Yes, confirmed.",
                                })
                              }
                            >
                              Yes
                            </Button>
                            <Button
                              onClick={() =>
                                addToolResult({
                                  tool: "askForConfirmation",
                                  toolCallId: callId,
                                  output: "No, denied",
                                })
                              }
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      );
                    case "output-available":
                      return (
                        <div key={callId}>
                          Confirmation result: {String(part.output)}
                        </div>
                      );
                    case "output-error":
                      return <div key={callId}>Error: {part.errorText}</div>;
                  }
                  break;
                }

                case "tool-getScript": {
                  const callId = part.toolCallId;

                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <details key={callId}>
                          <summary>Input Data</summary>
                          <pre key={callId}>
                            {JSON.stringify(part.input, null, 2)}
                          </pre>
                        </details>
                      );
                    case "input-available":
                      const scriptInput = part.input as { role: string };
                      return (
                        <div key={callId}>
                          Getting script for role: {scriptInput.role}...
                        </div>
                      );
                    case "output-available":
                      return (
                        <details key={callId}>
                          <summary>Script Retrieved</summary>
                          <pre>{String(part.output)}</pre>
                        </details>
                      );
                    case "output-error":
                      const scriptErrorInput = part.input as { role: string };
                      return (
                        <div key={callId} className={styles.error}>
                          Error getting script for {scriptErrorInput.role}:{" "}
                          {part.errorText}
                        </div>
                      );
                  }
                  break;
                }

                case "tool-setScript": {
                  const callId = part.toolCallId;

                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <details key={callId}>
                          <summary>Input Data</summary>
                          <pre key={callId}>
                            {JSON.stringify(part.input, null, 2)}
                          </pre>
                        </details>
                      );
                    case "input-available":
                      const setScriptInput = part.input as { role: string };
                      return (
                        <div key={callId}>
                          Setting script for role: {setScriptInput.role}...
                        </div>
                      );
                    case "output-available":
                      return (
                        <details key={callId}>
                          <summary>Script Set</summary>
                          <pre>{String(part.output)}</pre>
                        </details>
                      );
                    case "output-error":
                      return (
                        <div key={callId} className={styles.error}>
                          Error setting script: {part.errorText}
                        </div>
                      );
                  }
                  break;
                }

                case "tool-takeScreenshot": {
                  const callId = part.toolCallId;

                  switch (part.state) {
                    case "input-streaming":
                      return (
                        <pre key={callId}>
                          {JSON.stringify(part.input, null, 2)}
                        </pre>
                      );
                    case "input-available":
                      const screenshotInput = part.input as {
                        layerId?: string;
                      };
                      return (
                        <div key={callId}>
                          Taking screenshot of{" "}
                          {screenshotInput.layerId || "all layers"}...
                        </div>
                      );
                    case "output-available":
                      return (
                        <details key={callId}>
                          <summary>Screenshot Result</summary>
                          TODO
                        </details>
                      );
                    case "output-error":
                      return (
                        <div key={callId}>
                          Error taking screenshot: {part.errorText}
                        </div>
                      );
                  }
                  break;
                }

                // Handle dynamic tools (tools with unknown types at compile time)
                case "dynamic-tool":
                  return (
                    <div key={`dynamic-${part.toolName}-${index}`}>
                      <h4>Tool: {part.toolName}</h4>
                      {part.state === "input-streaming" && (
                        <pre>{JSON.stringify(part.input, null, 2)}</pre>
                      )}
                      {part.state === "input-available" && (
                        <div>Executing {part.toolName}...</div>
                      )}
                      {part.state === "output-available" && (
                        <pre>{JSON.stringify(part.output, null, 2)}</pre>
                      )}
                      {part.state === "output-error" && (
                        <div>Error: {part.errorText}</div>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })}

            {/* <details>
            <summary>Message Details</summary>
            <pre>{JSON.stringify(message, null, 2)}</pre>
          </details> */}
          </li>
        );
      })}
    </ul>
  );
});
Messages.displayName = "Messages";
export { Messages };
