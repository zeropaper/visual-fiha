import { useAppFastContextFields, useLayerConfig } from "./ControlsContext";

function Layer({
  id,
  setCurrentScript,
}: {
  id: string;
  setCurrentScript: (script: {
    id: string;
    role: "animation" | "setup";
    type: "layer" | "worker";
  }) => void;
}) {
  const [layer, setLayer] = useLayerConfig(id);
  if (!layer) {
    return null;
  }
  return (
    <li>
      <button type="button" title="Remove layer" onClick={() => setLayer(null)}>
        <strong>X</strong>
      </button>

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
  );
}

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
    layers: { get: layers },
  } = useAppFastContextFields(["layers"]);

  return (
    <details open>
      <summary>Layers</summary>

      <ul id="layers">
        {layers.map((layer) => (
          <Layer
            key={layer.id}
            id={layer.id}
            setCurrentScript={setCurrentScript}
          />
        ))}
      </ul>
    </details>
  );
}
