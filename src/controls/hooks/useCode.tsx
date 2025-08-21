import { useAppFastContextFields } from "@contexts/ControlsContext";
import type { ScriptRole, ScriptType } from "src/types";

export function useCode(
  role: ScriptRole,
  type: ScriptType,
  id: string,
): [
  { code: string; layerType: "canvas" | "threejs" | null },
  (code: string) => void,
] {
  const {
    layers: { set: setLayers, getCurrent: getCurrentLayers },
    worker: { set: setWorker, getCurrent: getCurrentWorker },
  } = useAppFastContextFields(["layers", "worker"]);

  if (type === "worker") {
    const worker = getCurrentWorker();
    return [
      {
        code: worker[role] || "",
        layerType: null,
      },
      (code: string) =>
        setWorker({
          ...worker,
          [role]: code,
        }),
    ];
  }

  const layer = getCurrentLayers().find((l) => l.id === id);
  if (layer) {
    return [
      {
        code: layer[role] || "",
        layerType: layer.type,
      },
      (code: string) => {
        // IMPORTANT: Use getCurrentLayers() instead of the layers from the hook
        // to avoid stale closure issues when script changes occur after layer
        // property updates (like toggling visibility). The layers from the hook
        // might be stale due to React rendering timing, but getCurrentLayers()
        // always returns the current store value.
        const currentLayers = getCurrentLayers();

        const updatedLayers = currentLayers.map((l) => {
          if (l.id === id) {
            // Preserve all existing layer properties, only update the script code
            return { ...l, [role]: code };
          }
          return l;
        });

        setLayers(updatedLayers);
      },
    ];
  }

  return [
    {
      code: "",
      layerType: null,
    },
    (_code: string) => {
      console.warn(
        `[ScriptEditor] Cannot set code for layer ${id} with role ${role} because it does not exist.`,
      );
    },
  ];
}
