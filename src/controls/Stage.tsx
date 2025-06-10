import React, { useCallback } from "react";
import { useStageConfig } from "./ControlsContext";

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
    <details open>
      <summary>Stage</summary>
      <div>
        <label htmlFor="aspectRatioLock">Aspect Ratio</label>
        <input
          type="checkbox"
          id="aspectRatioLock"
          onChange={() => setStageAspectRatioLock((current) => !current)}
          checked={stageAspectRatioLock}
        />
      </div>
      <div>
        <input
          type="number"
          min={0}
          step={1}
          id="width"
          value={stage.width.toString()}
          onChange={(evt) => updateWidth(Number(evt.target.value))}
          onBlur={(evt) => updateWidth(Number(evt.target.value))}
        />
        <input
          type="number"
          min={0}
          step={1}
          id="height"
          value={stage.height.toString()}
          onChange={(evt) => updateHeight(Number(evt.target.value))}
          onBlur={(evt) => updateHeight(Number(evt.target.value))}
        />
      </div>
      <div>
        <input
          type="color"
          id="backgroundColor"
          value={stage.backgroundColor}
          onChange={(evt) => setStage({ backgroundColor: evt.target.value })}
        />
      </div>
    </details>
  );
}
