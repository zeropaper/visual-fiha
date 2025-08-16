import { useAudioSetup } from "@contexts/AudioSetupContext";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain } from "./CanvasVisualizer";

export default function MicrophoneAnalyzer() {
  const { getAudioAnalyzers, getMicrophoneState } = useAudioSetup();

  const analyser = getAudioAnalyzers()?.[0]?.analyser;
  const micState = getMicrophoneState();

  if (!analyser) {
    return null;
  }
  return (
    <div>
      <div className={styles.visualizers}>
        <div>
          <strong>Frequency</strong>
          <Frequency analyser={analyser} />
        </div>

        <div>
          <strong>Time Domain</strong>
          <TimeDomain analyser={analyser} />
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
