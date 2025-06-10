import React, { useCallback, useEffect } from "react";
import type { AudioInputMode } from "../types";
import AudioFileAnalyzer from "./AudioFileAnalyzer";
import { Button } from "./Button";
import { postMessageToWorker } from "./ControlsContext";
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

  useEffect(() => {
    function update() {
      const obj = inputValuesToObject(inputValuesRef.current);
      postMessageToWorker({
        type: "inputsdata",
        payload: obj,
      });
      request = requestAnimationFrame(update);
    }
    let request = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(request);
    };
  }, []);

  return (
    <details open>
      <summary>Inputs</summary>
      <ul id="inputs">
        <li>Time</li>
        <li>
          Audio {audioMode}{" "}
          <Button
            type="button"
            onClick={() =>
              setAudioMode((current) => (current === "mic" ? "file" : "mic"))
            }
          >
            Toggle mode
          </Button>
        </li>
        <li>MIDI</li>
      </ul>
      {audioMode === "mic" ? (
        <MicrophoneAnalyzer writeInputValues={writeInputValues} />
      ) : (
        <AudioFileAnalyzer writeInputValues={writeInputValues} />
      )}
    </details>
  );
}
