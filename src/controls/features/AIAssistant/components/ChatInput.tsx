import { Button } from "@ui/Button";
import { Textarea } from "@ui/Textarea";
import textareaStyles from "@ui/Textarea.module.css";
import {
  CameraIcon,
  FileIcon,
  KeyIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { useRef } from "react";
import styles from "../AIAssistant.module.css";
import { AI_CONFIG } from "../config/aiConfig";
import type { FileUIPart } from "../types";
import { filesToFileUIParts } from "../utils/attachments";
import { AttachmentList } from "./AttachmentList";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  attachments: FileUIPart[];
  onAddFiles: (files: FileUIPart[]) => void;
  onRemoveFile: (index: number) => void;
  onTakeLayerScreenshot: () => void;
  onClearConversation: () => void;
  onShowCredentials: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  canClearConversation: boolean;
  canTakeLayerScreenshot: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

/**
 * Component for the AI Assistant input form with controls
 */
export function ChatInput({
  input,
  onInputChange,
  attachments,
  onAddFiles,
  onRemoveFile,
  onTakeLayerScreenshot,
  onClearConversation,
  onShowCredentials,
  onSubmit,
  isLoading,
  canClearConversation,
  canTakeLayerScreenshot,
  textareaRef,
  onKeyDown,
}: ChatInputProps) {
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form className={styles.main} onSubmit={onSubmit}>
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
                  onAddFiles,
                );
              }
            }}
            ref={filesInputRef}
          />

          <Button
            type="button"
            onClick={onTakeLayerScreenshot}
            variant="icon"
            title="Take a screenshot of the layer"
            disabled={isLoading || !canTakeLayerScreenshot}
          >
            <CameraIcon />
          </Button>

          <AttachmentList
            attachments={attachments}
            onRemoveFile={onRemoveFile}
          />
        </div>
        <Textarea
          className={[styles.textarea, textareaStyles.textarea].join(" ")}
          onChange={(evt) => {
            evt.preventDefault();
            onInputChange(evt.target.value);
          }}
          ref={textareaRef}
          value={input}
          name="input"
          placeholder={AI_CONFIG.inputPlaceholder}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className={styles.actions}>
        <Button
          type="button"
          onClick={onClearConversation}
          title="Clear conversation history"
          variant="icon"
          disabled={!canClearConversation}
        >
          <Trash2Icon />
        </Button>

        <Button
          type="button"
          onClick={onShowCredentials}
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
    </form>
  );
}
