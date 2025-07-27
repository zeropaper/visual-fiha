import { useAudioSetup } from "@contexts/AudioSetupContext";
import { useWriteInputValues } from "@contexts/ControlsContext";
import { useCallback } from "react";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

export function AudioAnalyzer({
  fileName,
  track,
}: {
  audioUrl: string;
  fileName: string;
  track: string;
}) {
  const { getAudioAnalyzers } = useAudioSetup();
  const writeInputValues = useWriteInputValues();

  const makeDrawExtras = useCallback(
    (type: "frequency" | "timeDomain") => {
      return function drawExtras(
        canvasCtx: CanvasRenderingContext2D,
        dataArray: number[],
      ) {
        const sorted = [...dataArray].sort((a, b) => a - b);
        const info = {
          average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...dataArray),
          max: Math.max(...dataArray),
        };

        drawInfo(canvasCtx, info);

        writeInputValues(`audio.${track}.0.${type}.average`, info.average);
        writeInputValues(`audio.${track}.0.${type}.median`, info.median);
        writeInputValues(`audio.${track}.0.${type}.min`, info.min);
        writeInputValues(`audio.${track}.0.${type}.max`, info.max);
        writeInputValues(`audio.${track}.0.${type}.data`, dataArray);
      };
    },
    [track, writeInputValues],
  );

  // Get the analyser for this track from the managed audio elements
  const trackIndex = Number.parseInt(track, 10);
  const analyser = getAudioAnalyzers()[trackIndex]?.analyser || null;

  return (
    <details open className={styles.track}>
      <summary>{`${track} - ${fileName}`}</summary>

      <div className={styles.visualizers}>
        <Frequency
          analyser={analyser}
          drawExtras={makeDrawExtras("frequency")}
        />

        <TimeDomain
          analyser={analyser}
          drawExtras={makeDrawExtras("timeDomain")}
        />
      </div>
    </details>
  );
}
