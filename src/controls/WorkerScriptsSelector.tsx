import { Button } from "./Button";

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
    <details open>
      <summary>Worker</summary>
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
    </details>
  );
}
