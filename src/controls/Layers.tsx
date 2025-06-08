import { useAppFastContextFields } from "./ControlsContext";

export function Layers({
  setCurrentScript,
}: {
  setCurrentScript: (script: {
    id: string;
    role: "animation" | "setup";
    type: "layer" | "worker";
  }) => void;
}) {
  const {
    layers: { get: layers, set: setLayers },
  } = useAppFastContextFields(["layers"]);

  return (
    <details open>
      <summary>Layers</summary>
      <ul id="layers">
        {layers.map((layer) => (
          <li key={layer.id}>
            <button
              type="button"
              onClick={() =>
                setCurrentScript({
                  id: layer.id,
                  role: "setup",
                  type: "layer",
                })
              }
            >
              Setup
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentScript({
                  id: layer.id,
                  role: "animation",
                  type: "layer",
                })
              }
            >
              {layer.id}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
