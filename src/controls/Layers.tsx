import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  XIcon,
} from "lucide-react";
import { type ChangeEventHandler, useCallback } from "react";
import { Button } from "./Button";
import buttonStyles from "./Button.module.css";
import sectionStyles from "./ControlsApp.module.css";
import { useAppFastContextFields, useLayerConfig } from "./ControlsContext";
import { Input } from "./Input";
import styles from "./Layers.module.css";
import { Select } from "./Select";

function Layer({
  id,
  setCurrentScript,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChangeOpacity,
}: {
  id: string;
  setCurrentScript: (script: {
    id: string;
    role: "animation" | "setup";
    type: "layer" | "worker";
  }) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeOpacity: ChangeEventHandler<HTMLInputElement>;
}) {
  const [layer, setLayer] = useLayerConfig(id);
  if (!layer) {
    return null;
  }
  return (
    <li className={styles.layer}>
      <div>
        <Button
          variant="icon"
          title="Remove layer"
          onClick={() => setLayer(null)}
        >
          <XIcon />
        </Button>

        <span className={styles.type}>{layer.id}</span>

        <Button
          variant="icon"
          title="Toggle layer visibility"
          onClick={() =>
            setLayer({
              ...layer,
              active: !layer.active,
            })
          }
        >
          {layer.active ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
        <Input
          type="number"
          min={0}
          max={100}
          step={1}
          value={layer.opacity}
          onChange={onChangeOpacity}
        />
      </div>

      <div>
        <Button
          variant="icon"
          title="Move layer up"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ArrowUpIcon />
        </Button>

        <Button
          variant="icon"
          title="Move layer down"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ArrowDownIcon />
        </Button>
      </div>

      <div>
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
          {layer.type}
        </Button>
      </div>
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
    layers: { get: layers, set: setLayers },
  } = useAppFastContextFields(["layers"]);

  const moveLayerUp = useCallback(
    (index: number) => () => {
      if (index <= 0 || index >= layers.length) return;
      const updatedLayers = [...layers];
      [updatedLayers[index - 1], updatedLayers[index]] = [
        updatedLayers[index],
        updatedLayers[index - 1],
      ];
      setLayers(updatedLayers);
    },
    [layers, setLayers],
  );

  const moveLayerDown = useCallback(
    (index: number) => () => {
      if (index < 0 || index >= layers.length - 1) return;
      const updatedLayers = [...layers];
      [updatedLayers[index + 1], updatedLayers[index]] = [
        updatedLayers[index],
        updatedLayers[index + 1],
      ];
      setLayers(updatedLayers);
    },
    [layers, setLayers],
  );

  const changeOpacity = useCallback<
    (id: string) => ChangeEventHandler<HTMLInputElement>
  >(
    (id) => (evt) => {
      const opacity = Number(evt.currentTarget.value);
      if (Number.isNaN(opacity) || opacity < 0 || opacity > 100) return;
      setLayers(
        layers.map((layer) =>
          layer.id === id ? { ...layer, opacity } : layer,
        ),
      );
    },
    [layers, setLayers],
  );

  return (
    <details open className={sectionStyles.details}>
      <summary>Layers</summary>
      <form
        className={styles.addLayerForm}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const id = formData.get("id") as string;
          const type = formData.get("type") as "canvas" | "threejs";
          if (id) {
            setLayers([
              ...layers,
              {
                id,
                type,
                active: true,
                setup: "",
                animation: "",
              },
            ]);
            e.currentTarget.reset();
          }
        }}
      >
        <Input name="id" placeholder="Layer ID" />
        <Select name="type">
          <option value="" disabled>
            Select type
          </option>
          <option value="canvas">Canvas</option>
          <option value="threejs">ThreeJS</option>
        </Select>
        <Button type="submit">Add Layer</Button>
      </form>
      <ul id="layers" className={styles.layers}>
        {layers.map((layer, l) => (
          <Layer
            key={layer.id}
            id={layer.id}
            setCurrentScript={setCurrentScript}
            isFirst={l === 0}
            isLast={l === layers.length - 1}
            onMoveUp={moveLayerUp(l)}
            onMoveDown={moveLayerDown(l)}
            onChangeOpacity={changeOpacity(layer.id)}
          />
        ))}
      </ul>
    </details>
  );
}
