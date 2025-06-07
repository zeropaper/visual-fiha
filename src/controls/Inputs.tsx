import React, { useCallback, useEffect } from "react";
import type { AudioInputMode, AudioInputValue } from "../types";
import AudioFileAnalyzer from "./AudioFileAnalyzer";
import { useAppFastContextFields } from "./ControlsContext";
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
  const [valuesObject, setValuesObject] = React.useState<Record<string, any>>(
    {},
  );
  // const {
  //   inputs: { set: setInputs },
  // } = useAppFastContextFields(["inputs"]);

  const writeInputValues = useCallback((path: string, value: any) => {
    inputValuesRef.current[path] = value;
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const obj = inputValuesToObject(inputValuesRef.current);
  //     // console.log("Inputs object:", obj);
  //     setValuesObject(obj);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    function update() {
      const obj = inputValuesToObject(inputValuesRef.current);

      // setInputs([
      //   {
      //     type: "audio",
      //     name: "Audio",
      //     mode: audioMode,
      //     config: {
      //       minDecibels: -120,
      //       maxDecibels: 80,
      //       smoothingTimeConstant: 0.85,
      //       fftSize: 1024,
      //     },
      //   },
      // ]);
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
          <button
            type="button"
            onClick={() =>
              setAudioMode((current) => (current === "mic" ? "file" : "mic"))
            }
          >
            Toggle mode
          </button>
        </li>
        <li>MIDI</li>
      </ul>
      {audioMode === "mic" ? (
        <MicrophoneAnalyzer writeInputValues={writeInputValues} />
      ) : (
        <AudioFileAnalyzer writeInputValues={writeInputValues} />
      )}
      <pre>
        {JSON.stringify(
          valuesObject,
          (k, v) => {
            if (Array.isArray(v)) {
              return v.length > 5
                ? [...v.slice(0, 5), `+ ${v.length - 5} items`]
                : v;
            }
            return v;
          },
          2,
        )}
      </pre>
    </details>
  );
}
