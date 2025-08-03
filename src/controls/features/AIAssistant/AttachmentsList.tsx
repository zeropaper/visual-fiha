import { Button, buttonStyles } from "@ui/Button";
import type { FileUIPart } from "ai";
import { XIcon } from "lucide-react";
import AttachmentTypeIcon from "./AttachmentTypeIcon";
import styles from "./AttachmentsList.module.css";

export default function AttachmentsList({
  attachments,
  onRemove,
}: {
  attachments: FileUIPart[];
  onRemove?: (name: string) => void;
}) {
  return (
    <ul className={styles.filesList}>
      {attachments.map((item) => (
        <li key={item.filename} className={styles.fileItem}>
          <AttachmentTypeIcon
            className={styles.fileTypeIcon}
            type={item.mediaType}
          />

          <span>{item.filename}</span>

          {onRemove &&
          !["setup-script", "animation-script"].includes(
            item.filename || "",
          ) ? (
            <Button
              type="button"
              variant="icon"
              className={[buttonStyles.button, styles.fileRemove].join(" ")}
              onClick={() => onRemove(item.url)}
            >
              <XIcon />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
