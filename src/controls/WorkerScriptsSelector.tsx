import { Button } from "./Button";
import sectionStyles from "./ControlsApp.module.css";
import styles from "./WorkerScriptsSelector.module.css";

export function WorkerScriptsSelector({
  setCurrentScript,
}: {
  setCurrentScript: (script: {
    id: string;
    role: "animation" | "setup";
    type: "layer" | "worker";
  }) => void;
}) {
  return (
    <details open className={sectionStyles.details}>
      <summary>Worker</summary>
      <div className={styles.buttons}>
        <Button
          type="button"
          onClick={() =>
            setCurrentScript({
              id: "worker",
              role: "setup",
              type: "worker",
            })
          }
        >
          Setup
        </Button>
        <Button
          type="button"
          onClick={() =>
            setCurrentScript({
              id: "worker",
              role: "animation",
              type: "worker",
            })
          }
        >
          Animation
        </Button>
      </div>
    </details>
  );
}
