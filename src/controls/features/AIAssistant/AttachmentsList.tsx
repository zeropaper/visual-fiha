import { Button, buttonStyles } from "@ui/Button";
import type { FileUIPart } from "ai";
import { XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AttachmentTypeIcon from "./AttachmentTypeIcon";
import styles from "./AttachmentsList.module.css";

function AttachmentPreview({
  attachment,
  onClose,
}: {
  attachment: FileUIPart | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (attachment) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [attachment]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const listener = () => {
      onClose();
    };

    dialogRef.current?.addEventListener("close", listener);
    return () => {
      dialogRef.current?.removeEventListener("close", listener);
    };
  }, []);

  let content = null;
  switch (attachment?.mediaType) {
    case "image/png":
    case "image/jpeg":
    case "image/gif":
      content = <img src={attachment?.url} alt={attachment?.filename} />;
      break;
    case "video/mp4":
      // biome-ignore lint/a11y/useMediaCaption: <explanation>
      content = <video src={attachment?.url} controls />;
      break;
    case "audio/mpeg":
      // biome-ignore lint/a11y/useMediaCaption: <explanation>
      content = <audio src={attachment?.url} controls />;
      break;
    default:
      content = <span>Unsupported file type</span>;
  }

  return (
    <dialog ref={dialogRef} className={styles.attachmentPreview}>
      <div className={styles.attachmentPreviewHeader}>
        <div className={styles.attachmentPreviewTitle}>
          <AttachmentTypeIcon type={attachment?.mediaType} />
          <span>{attachment?.filename}</span>
        </div>

        <Button variant="icon" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      <div className={styles.attachmentPreviewContent}>{content}</div>
    </dialog>
  );
}

export default function AttachmentsList({
  attachments,
  onRemove,
}: {
  attachments: FileUIPart[];
  onRemove?: (name: string) => void;
}) {
  const [focusedAttachment, setFocusedAttachment] = useState<FileUIPart | null>(
    null,
  );
  return (
    <>
      <AttachmentPreview
        attachment={focusedAttachment}
        onClose={() => setFocusedAttachment(null)}
      />
      <ul className={styles.filesList}>
        {attachments.map((item) => (
          <li key={item.filename} className={styles.fileItem}>
            <AttachmentTypeIcon
              className={styles.fileTypeIcon}
              type={item.mediaType}
            />

            <Button onClick={() => setFocusedAttachment(item)}>
              {item.filename}
            </Button>

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
    </>
  );
}
