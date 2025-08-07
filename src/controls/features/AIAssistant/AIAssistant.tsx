import { useChat } from "@ai-sdk/react";
import { useCode } from "@hooks/useCode";
import { useTakeScreenshot } from "@hooks/useTakeScreenshot";
import { Button } from "@ui/Button";
import { Textarea } from "@ui/Textarea";
import textareaStyles from "@ui/Textarea.module.css";
import {
  type FileUIPart,
  createIdGenerator,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { CameraIcon, FileIcon, KeyIcon, SendIcon } from "lucide-react";
import type * as _monaco from "monaco-editor";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LayerConfig } from "src/types";
import styles from "./AIAssistant.module.css";
import FileUIPartsList from "./AttachmentsList";
import { AIAssistantCredentialsForm } from "./CredentialsForm";
import { Messages } from "./Messages";
import { scriptBaseSchema, setScriptSchema } from "./tools/scripts";
import type { VFMessage } from "./types";
import { filesToFileUIParts } from "./utils/attachments";
import { hasCredentials } from "./utils/providers";
import { customTransport } from "./utils/transport";

function loadMessages(id: string): VFMessage[] {
  try {
    const storedMessages = localStorage.getItem(`chat:${id}`);
    if (!storedMessages) {
      console.log("No stored messages found for id:", id);
      return [];
    }

    const loaded = JSON.parse(storedMessages);
    return loaded;
  } catch (error) {
    console.warn("Failed to load chat messages from localStorage:", error);
    return [];
  }
}

export function AIAssistant({
  editor,
  role,
  type,
  layerType,
  id,
}: {
  editor: _monaco.editor.IStandaloneCodeEditor;
  role?: "setup" | "animation";
  type?: "worker" | "layer";
  layerType?: LayerConfig["type"] | null;
  id?: string | "worker";
}) {
  const initialMessagesRef = useRef<VFMessage[]>(loadMessages(id || "worker"));
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

  // const [initialMessages] = useState<VFMessage[]>(loadMessages(id || "worker"));
  const { messages, sendMessage, addToolResult, error, status } = useChat({
    id,
    generateId: createIdGenerator({
      prefix: "msgc",
      size: 16,
    }),
    messages: [] as VFMessage[],
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      console.log("Handling tool call:", toolCall.toolName);
      switch (toolCall.toolName) {
        case "getScript":
          const input = scriptBaseSchema.parse(toolCall.input);
          if (input.role === "setup") {
            addToolResult({
              tool: "getScript",
              toolCallId: toolCall.toolCallId,
              output: setupScript,
            });
          } else if (input.role === "animation") {
            addToolResult({
              tool: "getScript",
              toolCallId: toolCall.toolCallId,
              output: animationScript,
            });
          } else {
            addToolResult({
              tool: "getScript",
              toolCallId: toolCall.toolCallId,
              output: `Unknown role ${input.role}`,
            });
          }
          break;
        case "setScript":
          const inputs = setScriptSchema.parse(toolCall.input);
          if (inputs.role === "setup") {
            setSetupScript(inputs.code);
          } else if (inputs.role === "animation") {
            setAnimationScript(inputs.code);
          } else {
            addToolResult({
              tool: "setScript",
              toolCallId: toolCall.toolCallId,
              output: `Unknown role ${inputs.role}`,
            });
          }
          break;
        case "takeScreenshot":
          if (!id) {
            addToolResult({
              tool: "takeScreenshot",
              toolCallId: toolCall.toolCallId,
              output: "No layer ID provided for screenshot.",
            });
            return;
          }
          const screenshot = await takeScreenshot({ layerId: id });
          console.log("Screenshot taken:", screenshot);
          if (!screenshot) {
            addToolResult({
              tool: "takeScreenshot",
              toolCallId: toolCall.toolCallId,
              output: "Failed to take screenshot",
            });
            return;
          }
          addToolResult({
            tool: "takeScreenshot",
            toolCallId: toolCall.toolCallId,
            output: screenshot,
          });
      }
    },
    transport: customTransport,
  });
  const [input, setInput] = useState("");

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLUListElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setFileUIParts] = useState<FileUIPart[]>([]);
  function addFiles(items: FileUIPart[]) {
    setFileUIParts((prevFileUIParts) => {
      if (prevFileUIParts) {
        return [...prevFileUIParts, ...items];
      }
      return items;
    });
  }
  function removeFile(url: string) {
    setFileUIParts((prevFileUIParts) => {
      if (prevFileUIParts) {
        return prevFileUIParts.filter((f) => f.url !== url);
      }
      return [];
    });
  }

  const finishResize = useCallback(() => {
    const domNode = editor.getDomNode()!;
    const guard = domNode.querySelector<HTMLDivElement>(".overflow-guard")!;
    const parent = domNode.parentNode as HTMLElement;
    domNode.style.height = "";
    guard.style.height = "";
    requestAnimationFrame(() => {
      const scrollHeight = parent.scrollHeight;
      domNode.style.height = `${scrollHeight}px`;
      guard.style.height = `${scrollHeight}px`;
    });
  }, [editor]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    finishResize();

    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleInputResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Adjust the Textarea height dynamically
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      // Trigger Monaco editor layout adjustment
      finishResize();
    }
  }, [finishResize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleInputResize();
  }, [input, handleInputResize]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    finishResize();
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

  const handleSubmitWithFileUIParts = useCallback<
    FormEventHandler<HTMLFormElement>
  >(
    (evt) => {
      evt.preventDefault();
      if (input.trim()) {
        sendMessage({
          text: input,
          files: attachments,
          metadata: {
            id,
            type,
            role,
            layerType,
          },
        });
        setInput("");
      }
    },
    [attachments, input, sendMessage, id, layerType, type, role],
  );

  const disabled = ["streaming", "submitted"].includes(status);

  if (showCredentialsForm) {
    return <AIAssistantCredentialsForm />;
  }

  return (
    <form
      className={["ai-assistant", styles.form].join(" ")}
      onSubmit={handleSubmitWithFileUIParts}
    >
      {messages?.length ? (
        <Messages
          messages={messages}
          addToolResult={addToolResult}
          ref={messagesRef}
        />
      ) : null}
      {error && <div className={styles.error}>{error.message}</div>}
      {status && <div className={styles.status}>{status}</div>}
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
              disabled={disabled || !id}
            >
              <CameraIcon />
            </Button>

            <FileUIPartsList attachments={attachments} onRemove={removeFile} />
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
            disabled={disabled}
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
            type="submit"
            onClick={() => {}}
            title="Send code to AI assistant"
            variant="icon"
            disabled={disabled || !input.trim()}
          >
            <SendIcon />
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
        </div>
      </div>
    </form>
  );
}
