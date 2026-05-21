import { Button } from "@ui/Button";
import styles from "./ConfirmationDialog.module.css";

export function ConfirmationDialog({
  open,
  onOpenChange,
  children,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onConfirm?: () => void;
}) {
  return (
    <dialog className={styles.dialog} open={open}>
      <div className={styles.content}>{children}</div>
      <div className={styles.buttons}>
        <Button onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          onClick={() => {
            onOpenChange(false);
            onConfirm?.();
          }}
        >
          Confirm
        </Button>
      </div>
    </dialog>
  );
}
