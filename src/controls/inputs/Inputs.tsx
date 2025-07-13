import React, { useCallback, useEffect } from "react";
import sectionStyles from "../ControlsApp.module.css";
import { useContextWorkerPost } from "../ControlsContext";
import { Button } from "../base/Button";
import AudioFilesAnalyzer from "./AudioFilesAnalyzer";
import { useAudioSetup } from "./AudioSetupContext";
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
  // const [audioMode, setAudioMode] = React.useState<AudioInputMode>("mic");
  const { mode: audioMode, setMode: setAudioMode } = useAudioSetup();

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
            <MicrophoneAnalyzer writeInputValues={writeInputValues} />
          ) : (
            <AudioFilesAnalyzer
              writeInputValues={writeInputValues}
              defaultAudioFiles={[
                // "/audio/bas_traps_inst_mix_ab_oz_150/bs_24.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/dr1_01.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/dr2_28.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/dr3_07.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/noise_01.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/syn1_52.mp3",
                // "/audio/bas_traps_inst_mix_ab_oz_150/syn2_39.mp3",
                "/audio/brass_fire_150/bs_88.mp3",
                "/audio/brass_fire_150/dr1_84.mp3",
                "/audio/brass_fire_150/dr2_60-01.mp3",
                "/audio/brass_fire_150/dr3_24.mp3",
                "/audio/brass_fire_150/syn1_167.mp3",
                "/audio/brass_fire_150/syn2_142.mp3",
                "/audio/brass_fire_150/syn3_111.mp3",
                "/audio/brass_fire_150/syn4_60.mp3",
              ]}
            />
          )}
        </li>
        <li className={styles.input}>
          <MIDIBridge writeInputValues={writeInputValues} />
        </li>
      </ul>
    </details>
  );
}
