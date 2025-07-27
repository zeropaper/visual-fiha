import type { Attachment } from "ai";
import { CameraIcon, FileIcon, KeyIcon, SendIcon } from "lucide-react";
import type * as _monaco from "monaco-editor";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LayerConfig } from "../../types";
import { Button } from "../base/Button";
import { Textarea } from "../base/Textarea";
import textareaStyles from "../base/Textarea.module.css";
import { useCode } from "../useCode";
import styles from "./AIAssistant.module.css";
import {
  type ToolsCall,
  customFetch,
  filesToAttachments,
  getSystemMessage,
  handleToolCall,
  hasCredentials,
} from "./AiAssitant.utils";
import AttachmentsList from "./AttachmentsList";
import { useChat } from "./ChatsContext";
import { AIAssistantCredentialsForm } from "./CredentialsForm";
import { Messages } from "./Messages";

export function AIAssistant({
  editor,
  role,
  type,
  layerType,
  id,
  onSwitchRole,
}: {
  editor: _monaco.editor.IStandaloneCodeEditor;
  role?: "setup" | "animation";
  type?: "worker" | "layer";
  layerType?: LayerConfig["type"] | null;
  id?: string | "worker";
  onSwitchRole: () => void;
}) {
  // @ts-expect-error
  window.editor = editor; // For debugging purposes

  const [{ code: setupScript }] = useCode(
    "setup",
    type || "worker",
    id || "worker",
  );
  const [{ code: animationScript }] = useCode(
    "animation",
    type || "worker",
    id || "worker",
  );

  const { messages, input, handleInputChange, append, error, status } = useChat(
    {
      id: [type, id].filter(Boolean).join("-"),
      initialMessages: [getSystemMessage(layerType, type, role)],
      maxSteps: 10,
      fetch: customFetch,
      onToolCall: (opts) =>
        handleToolCall(opts as { toolCall: ToolsCall }, {
          editor,
          onSwitchRole,
        }),
    },
  );
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLUListElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  function addFiles(items: Attachment[]) {
    setAttachments((prevAttachments) => {
      if (prevAttachments) {
        return [...prevAttachments, ...items];
      }
      return items;
    });
  }
  function removeFile(url: string) {
    setAttachments((prevAttachments) => {
      if (prevAttachments) {
        return prevAttachments.filter((f) => f.url !== url);
      }
      return [];
    });
  }

  function finishResize() {
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
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    finishResize();

    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleInputResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Adjust the Textarea height dynamically
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;

      // Trigger Monaco editor layout adjustment
      finishResize();
    }
  };

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

  const getAttachments = useCallback(() => {
    const result = [...attachments];
    if (setupScript && role === "setup") {
      result.push({
        name: "setup-script",
        url: `data:text/plain;base64,${btoa(setupScript)}`,
        contentType: "text/plain",
      });
    }
    if (animationScript && role === "animation") {
      result.push({
        name: "animation-script",
        url: `data:text/plain;base64,${btoa(animationScript)}`,
        contentType: "text/plain",
      });
    }
    return result;
  }, [attachments, setupScript, animationScript, role]);

  const handleSubmitWithAttachments = useCallback<
    FormEventHandler<HTMLFormElement>
  >(
    (evt) => {
      evt.preventDefault();
      append({
        role: "user",
        content: input,
        experimental_attachments: getAttachments(),
      });
    },
    [getAttachments, input, append],
  );

  const disabled = ["streaming", "submitted"].includes(status);

  if (showCredentialsForm) {
    return <AIAssistantCredentialsForm />;
  }

  return (
    <form
      className={["ai-assistant", styles.form].join(" ")}
      onSubmit={handleSubmitWithAttachments}
    >
      <Messages messages={messages} ref={messagesRef} />
      {error && <div className={styles.error}>{error.message}</div>}
      {/* {status && <div className={styles.status}>{status}</div>} */}
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
                  filesToAttachments(Array.from(event.target.files)).then(
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

            <AttachmentsList
              attachments={getAttachments()}
              onRemove={removeFile}
            />
            {/*
            <div className={styles.attachments}>
              {attachments.length > 0
                ? "Scripts and attachments added"
                : "Script is attached"}
            </div>
            */}
          </div>
          <Textarea
            className={[styles.textarea, textareaStyles.textarea].join(" ")}
            onInput={handleInputResize}
            onChange={handleInputChange}
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
