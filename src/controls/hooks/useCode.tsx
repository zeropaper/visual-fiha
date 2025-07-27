import { useAppFastContextFields } from "../ControlsContext";

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
        code:
          worker[role] || `// No code available for worker with role ${role}`,
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
        code:
          layer[role] ||
          `// No code available for layer ${id} with role ${role}`,
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
      code: `// No code available for layer ${id} with role ${role}`,
      layerType: null,
    },
    (code: string) => {
      console.warn(
        `[ScriptEditor] Cannot set code for layer ${id} with role ${role} because it does not exist.`,
      );
    },
  ];
}
