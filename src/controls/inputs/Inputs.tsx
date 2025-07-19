import sectionStyles from "../ControlsApp.module.css";
import { Button } from "../base/Button";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import { useAudioSetup } from "./AudioSetupContext";
import styles from "./Inputs.module.css";
import { MIDIBridge } from "./MIDIBridge";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

export function Inputs() {
  const { mode: audioMode, setMode: setAudioMode } = useAudioSetup();

  return (
    <details open className={sectionStyles.details}>
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
