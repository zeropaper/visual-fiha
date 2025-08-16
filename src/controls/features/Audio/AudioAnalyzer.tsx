import { useAudioSetup } from "@contexts/AudioSetupContext";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain } from "./CanvasVisualizer";

export function AudioAnalyzer({
  fileName,
  track,
}: {
  audioUrl: string;
  fileName: string;
  track: string;
}) {
  const { getAudioAnalyzers } = useAudioSetup();

  // Get the analyser for this track from the managed audio elements
  const trackIndex = Number.parseInt(track, 10);
  const analyser = getAudioAnalyzers()[trackIndex]?.analyser || null;

  return (
    <details open className={styles.track}>
      <summary>{`${track} - ${fileName}`}</summary>

      <div className={styles.visualizers}>
        <Frequency analyser={analyser} />

        <TimeDomain analyser={analyser} />
      </div>
    </details>
  );
}
