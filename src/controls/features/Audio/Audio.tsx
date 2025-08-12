import { useAudioSetup } from "@contexts/AudioSetupContext";
import { Button } from "@ui/Button";
import { FileAudioIcon, MicIcon } from "lucide-react";
import styles from "./Audio.module.css";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

export function Audio() {
  const { mode: audioMode, setMode: setAudioMode } = useAudioSetup();

  return (
    <>
      <div className={styles.buttons}>
        <Button
          onClick={() => setAudioMode("mic")}
          disabled={audioMode === "mic"}
        >
          <MicIcon />
        </Button>
        <Button
          onClick={() => setAudioMode("files")}
          disabled={audioMode === "files"}
        >
          <FileAudioIcon />
        </Button>
      </div>
      {audioMode === "mic" ? <MicrophoneAnalyzer /> : <AudioFilesAnalyzer />}
    </>
  );
}
