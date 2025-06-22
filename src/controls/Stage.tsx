import React, { useCallback } from "react";
import sectionStyles from "./ControlsApp.module.css";
import { useStageConfig } from "./ControlsContext";
import styles from "./Stage.module.css";
import { Input } from "./base/Input";

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
    <details open className={sectionStyles.details}>
      <summary>Stage</summary>
      <div className={styles.row}>
        <label htmlFor="aspectRatioLock" className={styles.aspectRatioLock}>
          <span>Lock Aspect Ratio</span>
          <Input
            type="checkbox"
            id="aspectRatioLock"
            onChange={() => setStageAspectRatioLock((current) => !current)}
            checked={stageAspectRatioLock}
          />
        </label>
        <label htmlFor="backgroundColor">
          <Input
            type="color"
            id="backgroundColor"
            value={stage.backgroundColor}
            onChange={(evt) => setStage({ backgroundColor: evt.target.value })}
          />
        </label>
      </div>
      <div className={styles.row}>
        <label htmlFor="width">
          <span>Width</span>
          <Input
            type="number"
            min={0}
            step={1}
            id="width"
            value={stage.width.toString()}
            onChange={(evt) => updateWidth(Number(evt.target.value))}
            onBlur={(evt) => updateWidth(Number(evt.target.value))}
          />
        </label>
        <label htmlFor="height">
          <span>Height</span>
          <Input
            type="number"
            min={0}
            step={1}
            id="height"
            value={stage.height.toString()}
            onChange={(evt) => updateHeight(Number(evt.target.value))}
            onBlur={(evt) => updateHeight(Number(evt.target.value))}
          />
        </label>
      </div>
    </details>
  );
}
