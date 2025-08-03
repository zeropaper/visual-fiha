import type { UseChatHelpers } from "@ai-sdk/react";
import { Button } from "@ui/Button";
import type { UIDataTypes, UIMessage } from "ai";
import { forwardRef } from "react";
import assistantStyles from "./AIAssistant.module.css";
import type { VFTools } from "./tools/types";

const Messages = forwardRef<
  HTMLUListElement,
  {
    messages: UIMessage<unknown, UIDataTypes, VFTools>[];
    addToolResult: UseChatHelpers<
      UIMessage<unknown, UIDataTypes, VFTools>
    >["addToolResult"];
  }
>(({ messages, addToolResult }, ref) => (
  <ul className={assistantStyles.messages} ref={ref}>
    {messages.map((message) => {
      return (
        <li key={message.id}>
          {message.parts?.map((part, index) => {
            switch (part.type) {
              case "text":
                return part.text;

              // Handle step boundaries for multi-step tool calls
              case "step-start":
                return index > 0 ? (
                  <div
                    key={`step-${message.id}-${index}`}
                    className="text-gray-500"
                  >
                    <hr className="my-2 border-gray-300" />
                    <small>Step {index}</small>
                  </div>
                ) : null;

              // Client-side tool that requires user interaction
              case "tool-askForConfirmation": {
                const callId = part.toolCallId;

                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div key={callId}>Loading confirmation request...</div>
                    );
                  case "input-available":
                    const confirmationInput = part.input as { message: string };
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

              // Server-side tools with automatic execution
              case "tool-getScript": {
                const callId = part.toolCallId;

                switch (part.state) {
                  case "input-streaming":
                    return (
                      <pre key={callId}>
                        {JSON.stringify(part.input, null, 2)}
                      </pre>
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
                      <div key={callId}>
                        <strong>Script Retrieved:</strong>
                        <pre>{String(part.output)}</pre>
                      </div>
                    );
                  case "output-error":
                    const scriptErrorInput = part.input as { role: string };
                    return (
                      <div key={callId}>
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
                      <pre key={callId}>
                        {JSON.stringify(part.input, null, 2)}
                      </pre>
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
                      <div key={callId}>
                        <strong>Script Set:</strong> {String(part.output)}
                      </div>
                    );
                  case "output-error":
                    return (
                      <div key={callId}>
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
                    const screenshotInput = part.input as { layerId?: string };
                    return (
                      <div key={callId}>
                        Taking screenshot of{" "}
                        {screenshotInput.layerId || "all layers"}...
                      </div>
                    );
                  case "output-available":
                    return (
                      <div key={callId}>
                        <strong>Screenshot Result:</strong>{" "}
                        {String(part.output)}
                      </div>
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
        </li>
      );
    })}
  </ul>
));
Messages.displayName = "Messages";
export { Messages };
