import { useAudioSetup } from "@contexts/AudioSetupContext";
import sectionStyles from "@controls/ControlsApp.module.css";
import { Button } from "@ui/Button";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import styles from "./Inputs.module.css";
import { MIDIBridge } from "./MIDIBridge";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

export function Inputs() {
  const { mode: audioMode, setMode: setAudioMode } = useAudioSetup();

  return (
    <details open className={["inputs", sectionStyles.details].join(" ")}>
      <summary>
        <span>Inputs</span>
        <Button
          type="button"
          onClick={() => setAudioMode(audioMode === "mic" ? "file" : "mic")}
        >
          Toggle mode
        </Button>
      </summary>
      <ul id="inputs" className={styles.inputs}>
        <li className={styles.input}>
          {audioMode === "mic" ? (
            <MicrophoneAnalyzer />
          ) : (
            <AudioFilesAnalyzer />
          )}
        </li>
        <li className={styles.input}>
          <MIDIBridge />
        </li>
      </ul>
    </details>
  );
}
