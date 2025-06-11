import { Button } from "./Button";
import buttonStyles from "./Button.module.css";
import sectionStyles from "./ControlsApp.module.css";
import { useAppFastContextFields, useLayerConfig } from "./ControlsContext";
import styles from "./Layers.module.css";

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
    <li className={styles.layer}>
      <Button title="Remove layer" onClick={() => setLayer(null)}>
        <strong>X</strong>
      </Button>

      <Button
        title="Toggle"
        onClick={() =>
          setLayer({
            ...layer,
            active: !layer.active,
          })
        }
      >
        {layer.active ? "On" : "Off"}
      </Button>

      <Button
        className={[buttonStyles.button, styles.setupButton].join(" ")}
        onClick={() =>
          setCurrentScript({
            id: layer.id,
            role: "setup",
            type: "layer",
          })
        }
      >
        Setup
      </Button>

      <Button
        onClick={() =>
          setCurrentScript({
            id: layer.id,
            role: "animation",
            type: "layer",
          })
        }
      >
        {layer.id}
      </Button>
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
    <details open className={sectionStyles.details}>
      <summary>Layers</summary>

      <ul id="layers" className={styles.layers}>
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
