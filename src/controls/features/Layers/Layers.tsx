import {
  useAppFastContextFields,
  useLayerConfig,
} from "@contexts/ControlsContext";
import { Button } from "@ui/Button";
import buttonStyles from "@ui/Button.module.css";
import { Input } from "@ui/Input";
import { Select } from "@ui/Select";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { type ChangeEventHandler, useCallback, useRef, useState } from "react";
import type { ScriptInfo } from "src/types";
import styles from "./Layers.module.css";

function Layer({
  id,
  setCurrentScript,
  onChangeOpacity,
}: {
  id: string;
  setCurrentScript: (script: ScriptInfo) => void;
  onChangeOpacity: ChangeEventHandler<HTMLInputElement>;
  isCurrent?: boolean;
}) {
  const [layer, setLayer] = useLayerConfig(id);
  if (!layer) {
    return null;
  }
  return (
    <>
      <div>
        <Button
          variant="icon"
          title="Remove layer"
          onClick={() => setLayer(null)}
        >
          <XIcon />
        </Button>

        <span className={styles.type}>{layer.id}</span>
      </div>

      <div>
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
          defaultValue={layer.opacity || 100}
          onChange={onChangeOpacity}
        />

        <Button
          className={[
            buttonStyles.button,
            styles.setupButton,
            "setup-script-button",
          ].join(" ")}
          onClick={() =>
            setCurrentScript({
              id: layer.id,
              role: "setup",
              type: layer.type,
            })
          }
        >
          Setup
        </Button>

        <Button
          className={[buttonStyles.button, "animation-script-button"].join(" ")}
          onClick={() =>
            setCurrentScript({
              id: layer.id,
              role: "animation",
              type: layer.type,
            })
          }
        >
          {layer.type}
        </Button>
      </div>
    </>
  );
}

export function Layers({
  setCurrentScript,
  id,
}: ScriptInfo & {
  setCurrentScript: (script: ScriptInfo) => void;
}) {
  const {
    layers: { get: layers, set: setLayers },
  } = useAppFastContextFields(["layers"]);

  // Drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

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

  // Drag-and-drop handlers
  const handleDragStart = (index: number) => () => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDrop = () => {
    if (
      draggedIndex !== null &&
      dragOverIndex.current !== null &&
      draggedIndex !== dragOverIndex.current
    ) {
      const updatedLayers = [...layers];
      const [removed] = updatedLayers.splice(draggedIndex, 1);
      updatedLayers.splice(dragOverIndex.current, 0, removed);
      setLayers(updatedLayers);
    }
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dragOverIndex.current = null;
  };

  return (
    <>
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
      {/** biome-ignore lint/correctness/useUniqueElementIds: ignore */}
      <ul id="layers" className={styles.layers}>
        {layers.map((layer, l) => (
          <li
            key={layer.id}
            draggable
            onDragStart={handleDragStart(l)}
            onDragOver={handleDragOver(l)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            style={{
              opacity: draggedIndex === l ? 0.5 : 1,
              cursor: "move",
            }}
            className={[
              styles.layer,
              layer.id === id ? styles.currentLayer : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Layer
              id={layer.id}
              setCurrentScript={setCurrentScript}
              onChangeOpacity={changeOpacity(layer.id)}
              isCurrent={id === layer.id}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
