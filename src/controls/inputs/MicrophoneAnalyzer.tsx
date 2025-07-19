import { useWriteInputValues } from "../ControlsContext";
import styles from "./AudioFilesAnalyzer.module.css";
import { useAudioSetup } from "./AudioSetupContext";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

export default function MicrophoneAnalyzer() {
  const { getMicrophoneAnalyser, getMicrophoneState } = useAudioSetup();
  const writeInputValues = useWriteInputValues();

  const analyser = getMicrophoneAnalyser();
  const micState = getMicrophoneState();

  function makeDrawExtras(type: "frequency" | "timeDomain") {
    return function drawExtras(
      canvasCtx: CanvasRenderingContext2D,
      dataArray: number[],
      _height: number,
    ) {
      const sorted = [...dataArray].sort((a, b) => a - b);
      const info = {
        average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...dataArray),
        max: Math.max(...dataArray),
      };

      drawInfo(canvasCtx, info);

      writeInputValues(`audio.0.0.${type}.average`, info.average);
      writeInputValues(`audio.0.0.${type}.median`, info.median);
      writeInputValues(`audio.0.0.${type}.min`, info.min);
      writeInputValues(`audio.0.0.${type}.max`, info.max);
      writeInputValues(`audio.0.0.${type}.data`, dataArray);
    };
  }

  return (
    <div>
      <div className={styles.visualizers}>
        <div>
          <strong>Frequency</strong>
          <Frequency
            analyser={analyser}
            drawExtras={makeDrawExtras("frequency")}
          />
        </div>

        <div>
          <strong>Time Domain</strong>
          <TimeDomain
            analyser={analyser}
            drawExtras={makeDrawExtras("timeDomain")}
          />
        </div>
      </div>
      {micState !== "running" && (
        <div
          style={{ color: "orange", fontSize: "0.8em", marginTop: "0.5rem" }}
        >
          Microphone state: {micState}
        </div>
      )}
    </div>
  );
}
