import { useAppFastContextFields } from "@contexts/ControlsContext";

export function useCode(
  role: "setup" | "animation",
  type: "worker" | "layer",
  id: string,
): [
  { code: string; layerType: "canvas" | "threejs" | null },
  (code: string) => void,
] {
  const {
    layers: { get: layers, set: setLayers },
    worker: { get: worker, set: setWorker },
  } = useAppFastContextFields(["layers", "worker"]);
  if (type === "worker") {
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

  const layer = layers.find((l) => l.id === id);
  if (layer) {
    return [
      {
        code: layer[role] || "",
        layerType: layer.type,
      },
      (code: string) =>
        setLayers(
          layers.map((l) => (l.id === id ? { ...l, [role]: code } : l)),
        ),
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
