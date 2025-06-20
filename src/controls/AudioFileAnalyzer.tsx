import type React from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./AudioFileAnalyzer.module.css";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

export default function AudioFileAnalyzer({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const [audioState, setAudioState] = useState<string>("no file");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioState("loading");
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  useEffect(() => {
    if (!audioUrl) return;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    const audioElem = audioElemRef.current;
    if (!audioElem) return;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaElementSource(audioElem);
    const analyser = audioCtx.createAnalyser();
    analyser.minDecibels = audioConfig.minDecibels;
    analyser.maxDecibels = audioConfig.maxDecibels;
    analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
    analyser.fftSize = audioConfig.fftSize;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyserRef.current = analyser;
    sourceRef.current = source;
    setAudioState("ready");
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  function makeDrawExtras(type: "frequency" | "timeDomain") {
    return function drawExtras(
      canvasCtx: CanvasRenderingContext2D,
      dataArray: number[],
      height: number,
    ) {
      const sorted = [...dataArray].sort((a, b) => a - b);
      const info = {
        average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...dataArray),
        max: Math.max(...dataArray),
      };

      drawInfo(canvasCtx, info);

      writeInputValues(`audio.0.0.${type}.average`, info.average);
      writeInputValues(`audio.0.0.${type}.median`, info.median);
      writeInputValues(`audio.0.0.${type}.min`, info.min);
      writeInputValues(`audio.0.0.${type}.max`, info.max);
      writeInputValues(`audio.0.0.${type}.data`, dataArray);
    };
  }

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <div>{audioState}</div>
      {audioUrl && (
        <div style={{ margin: "0.5em 0" }}>
          <audio
            ref={audioElemRef}
            src={audioUrl}
            controls
            style={{ width: "100%" }}
          >
            <track kind="captions" label="No captions" />
          </audio>
        </div>
      )}

      <div className={styles.visualizers}>
        <div>
          <strong>Frequency</strong>
          <Frequency
            analyser={analyserRef.current}
            drawExtras={makeDrawExtras("frequency")}
          />
        </div>

        <div>
          <strong>Time Domain</strong>
          <TimeDomain
            analyser={analyserRef.current}
            drawExtras={makeDrawExtras("timeDomain")}
          />
        </div>
      </div>
    </div>
  );
}
