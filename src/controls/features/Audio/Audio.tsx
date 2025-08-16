import {
  type ManagedAudioElement,
  useAudioSetup,
} from "@contexts/AudioSetupContext";
import { Button } from "@ui/Button";
import { CopyIcon, FileAudioIcon, MicIcon } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./Audio.module.css";
import { Frequency, TimeDomain } from "./CanvasVisualizer";

export function Audio() {
  const {
    mode: audioMode,
    setMode: setAudioMode,
    getAudioAnalyzers,
    ready,
  } = useAudioSetup();
  const [analysers, setAnalysers] = useState<
    Record<string, ManagedAudioElement>
  >({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setAnalysers(getAudioAnalyzers());
  }, [ready, getAudioAnalyzers]);

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

      {ready ? (
        <div className={styles.tracks}>
          <div className={styles.trackLabels}>
            <div>frequency</div>
            <div>timeDomain</div>
          </div>
          {Object.values(analysers)
            .sort((a, b) => a.index - b.index)
            .map(({ analyser, index, id }, i) => (
              <div key={id} className={styles.track}>
                <div className={styles.trackHeader}>
                  {index} - {id}
                  {/* <Button
                    variant="icon"
                    onClick={() => {
                      alert("Not implemented");
                    }}
                  >
                    <CopyIcon />
                  </Button> */}
                </div>
                <div className={styles.visualizers}>
                  <Frequency analyser={analyser} />
                  <TimeDomain analyser={analyser} />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div>Loading</div>
      )}
    </>
  );
}
