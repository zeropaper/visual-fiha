import { useAudioSetup } from "@contexts/AudioSetupContext";
import { Button } from "@ui/Button";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import styles from "./Inputs.module.css";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

export function Inputs() {
  const { mode: audioMode, setMode: setAudioMode } = useAudioSetup();

  return (
    <>
      <Button
        type="button"
        onClick={() => setAudioMode(audioMode === "mic" ? "file" : "mic")}
      >
        Toggle mode
      </Button>
      <ul id="inputs" className={styles.inputs}>
        <li className={styles.input}>
          {audioMode === "mic" ? (
            <MicrophoneAnalyzer />
          ) : (
            <AudioFilesAnalyzer />
          )}
        </li>
      </ul>
    </>
  );
}
