import { Button } from "@ui/Button";
import type { ScriptInfo } from "src/types";
import styles from "./WorkerScriptsSelector.module.css";

export function WorkerScriptsSelector({
  setCurrentScript,
}: {
  setCurrentScript: (script: ScriptInfo) => void;
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
