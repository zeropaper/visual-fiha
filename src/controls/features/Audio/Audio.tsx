import { useAudioSetup } from "@contexts/AudioSetupContext";
import { Button } from "@ui/Button";
import styles from "./Audio.module.css";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

export function Audio() {
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
