import { Button } from "@ui/Button";
import { XIcon } from "lucide-react";
import styles from "../AIAssistant.module.css";
import type { FileUIPart } from "../types";

interface AttachmentListProps {
  attachments: FileUIPart[];
  onRemoveFile: (index: number) => void;
}

/**
 * Component for displaying and managing file attachments
 */
export function AttachmentList({
  attachments,
  onRemoveFile,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={styles.attachments}>
      {attachments.map((attachment, index) => (
        <div
          key={`attachment-${
            // biome-ignore lint/suspicious/noArrayIndexKey: attachment index for stable order
            index
          }`}
          className={styles.context}
        >
          <span>{attachment.filename}</span>
          <Button
            type="button"
            onClick={() => onRemoveFile(index)}
            variant="icon"
            title="Remove attachment"
          >
            <XIcon />
          </Button>
        </div>
      ))}
    </div>
  );
}
