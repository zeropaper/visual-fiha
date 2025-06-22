import React, { useCallback, useEffect } from "react";
import type { AudioInputMode } from "../types";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import { Button } from "./Button";
import sectionStyles from "./ControlsApp.module.css";
import { useContextWorkerPost } from "./ControlsContext";
import styles from "./Inputs.module.css";
import { MIDIBridge } from "./MIDIBridge";
import MicrophoneAnalyzer from "./MicrophoneAnalyzer";

function inputValuesToObject(values: Record<string, any>) {
  const obj: Record<string, any> = {};
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      const parts = key.split(".");
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = values[key];
    }
  }
  return obj;
}
export function Inputs() {
  const inputValuesRef = React.useRef<Record<string, any>>({});
  const [audioMode, setAudioMode] = React.useState<AudioInputMode>("mic");
  const writeInputValues = useCallback((path: string, value: any) => {
    inputValuesRef.current[path] = value;
  }, []);
  const post = useContextWorkerPost();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    function update() {
      const obj = inputValuesToObject(inputValuesRef.current);
      post?.("inputsdata", obj);
      request = requestAnimationFrame(update);
    }
    let request = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(request);
    };
  }, []);

  return (
    <details open className={sectionStyles.details}>
      <summary>Inputs</summary>
      <ul id="inputs" className={styles.inputs}>
        <li className={styles.input}>Time</li>
        <li className={styles.input}>
          Audio {audioMode}{" "}
          <Button
            type="button"
            onClick={() =>
              setAudioMode((current) => (current === "mic" ? "file" : "mic"))
            }
          >
            Toggle mode
          </Button>
          {audioMode === "mic" ? (
            <MicrophoneAnalyzer writeInputValues={writeInputValues} />
          ) : (
            <AudioFilesAnalyzer writeInputValues={writeInputValues} />
          )}
        </li>
        <li className={styles.input}>
          <MIDIBridge writeInputValues={writeInputValues} />
        </li>
      </ul>
    </details>
  );
}
