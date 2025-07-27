import { useStageConfig } from "@contexts/ControlsContext";
import { Input } from "@ui/Input";
import React, { useCallback } from "react";
import styles from "./Stage.module.css";

export function Stage() {
  const [stageAspectRatioLock, setStageAspectRatioLock] =
    React.useState<boolean>(true);
  const [stage, setStage] = useStageConfig();

  const updateWidth = useCallback(
    (width: number) => {
      setStage({
        ...stage,
        width,
        height: stageAspectRatioLock
          ? Math.floor(width * (stage.height / stage.width))
          : stage.height,
      });
    },
    [setStage, stage, stageAspectRatioLock],
  );

  const updateHeight = useCallback(
    (height: number) => {
      setStage({
        ...stage,
        height,
        width: stageAspectRatioLock
          ? Math.floor(height * (stage.width / stage.height))
          : stage.width,
      });
    },
    [setStage, stage, stageAspectRatioLock],
  );
  return (
    <div className={styles.root}>
      <Input
        type="color"
        id="backgroundColor"
        value={stage.backgroundColor}
        onChange={(evt) => setStage({ backgroundColor: evt.target.value })}
        title="Stage Background Color"
      />
      <Input
        type="number"
        min={0}
        step={1}
        style={{ width: "5ch" }}
        id="width"
        value={stage.width.toString()}
        onChange={(evt) => updateWidth(Number(evt.target.value))}
        onBlur={(evt) => updateWidth(Number(evt.target.value))}
        title="Stage Width"
      />
      x
      <Input
        type="number"
        min={0}
        step={1}
        style={{ width: "5ch" }}
        id="height"
        value={stage.height.toString()}
        onChange={(evt) => updateHeight(Number(evt.target.value))}
        onBlur={(evt) => updateHeight(Number(evt.target.value))}
        title="Stage Height"
      />
      <Input
        type="checkbox"
        id="aspectRatioLock"
        onChange={() => setStageAspectRatioLock((current) => !current)}
        checked={stageAspectRatioLock}
        title="Lock Aspect Ratio"
      />
    </div>
  );
}
