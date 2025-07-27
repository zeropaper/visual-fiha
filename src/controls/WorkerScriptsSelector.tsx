import { Button } from "@ui/Button";
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
  );
}
