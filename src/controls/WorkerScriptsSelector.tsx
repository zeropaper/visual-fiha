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
      <button
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
      </button>
      <button
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
      </button>
    </details>
  );
}
