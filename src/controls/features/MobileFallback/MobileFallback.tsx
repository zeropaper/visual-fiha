import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { ControlDisplay } from "../ControlDisplay/ControlDisplay";
import { Timeline } from "../Timeline/Timeline";
import styles from "./MobileFallback.module.css";

function MobileWarning() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog ref={dialogRef} className={styles.mobileWarning}>
      <button
        title="Close"
        type="button"
        className={styles.closeButton}
        onClick={() => dialogRef.current?.close()}
      >
        <XIcon />
      </button>
      <div className={styles.mobileWarningContent}>
        This app is not intended for mobile devices.
        <br />
        Please use a desktop browser for the best experience.
      </div>
    </dialog>
  );
}

export function MobileFallback() {
  return (
    <>
      <MobileWarning />
      <div className={styles.canvasContainer}>
        <ControlDisplay />
      </div>
      <Timeline />
    </>
  );
}
