import { useCode } from "@hooks/useCode";
import { Button } from "@ui/Button";
import { Textarea } from "@ui/Textarea";
import textareaStyles from "@ui/Textarea.module.css";
import {
  type FileUIPart,
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
import { useChat } from "../../contexts/ChatsContext";
import styles from "./AIAssistant.module.css";
import FileUIPartsList from "./AttachmentsList";
import { AIAssistantCredentialsForm } from "./CredentialsForm";
import { Messages } from "./Messages";
import type { VFTools } from "./tools/types";
import type { VFMessage } from "./types";
import { filesToFileUIParts } from "./utils/attachments";
import { hasCredentials } from "./utils/providers";

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

  const chatId = [type, id].filter(Boolean).join("-");
  const storedMessages = localStorage.getItem(`chat-${chatId}`);
  const initialMessages = storedMessages ? JSON.parse(storedMessages) : [];
  const { messages, sendMessage, addToolResult, error, status } = useChat({
    id: chatId,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      // call addToolResult to add the result of the tool call
      switch (toolCall.toolName) {
        default:
          addToolResult({
            tool: toolCall.toolName as keyof VFTools,
            toolCallId: toolCall.toolCallId,
            output: {
              type: "text",
              text: `Tool ${toolCall.toolName} is not implemented.`,
            },
          });
      }
    },
  });
  const [input, setInput] = useState("");
  useEffect(() => {
    localStorage.setItem(`chat-${chatId}`, JSON.stringify(messages));
  }, [messages, chatId]);

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

  const getFileUIParts = useCallback(() => {
    const result = [...attachments];
    // result.push({
    //   filename: "setup-script",
    //   url: `data:text/plain;base64,${btoa(setupScript)}`,
    //   mediaType: "text/plain",
    //   type: "file",
    // });
    // result.push({
    //   filename: "animation-script",
    //   url: `data:text/plain;base64,${btoa(animationScript)}`,
    //   mediaType: "text/plain",
    //   type: "file",
    // });
    return result;
  }, [attachments]);

  const handleSubmitWithFileUIParts = useCallback<
    FormEventHandler<HTMLFormElement>
  >(
    (evt) => {
      evt.preventDefault();
      if (input.trim()) {
        sendMessage({
          text: input,
          files: getFileUIParts(),
          metadata: {
            type,
            role,
            layerType,
          },
        });
        setInput("");
      }
    },
    [getFileUIParts, input, sendMessage, layerType, type, role],
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
      <Messages
        messages={messages as VFMessage[]}
        addToolResult={addToolResult}
        ref={messagesRef}
      />
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
                alert("Not implemented yet.");
              }}
              variant="icon"
              title="Take a screenshot of the layer"
            >
              <CameraIcon />
            </Button>

            <FileUIPartsList
              attachments={getFileUIParts()}
              onRemove={removeFile}
            />
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
