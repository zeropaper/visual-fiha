import { useEffect, useRef, useState } from "react";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

export default function MicrophoneAnalyzer({
  writeInputValues,
}: {
  writeInputValues: (path: string, value: any) => void;
}) {
  const [micState, setMicState] = useState<AudioContextState>("closed");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (audioCtxRef.current) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then((stream: MediaStream) => {
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        audioCtx.onstatechange = () => {
          setMicState(audioCtx.state);
          if (audioCtx.state === "closed") {
            audioCtxRef.current = null;
            analyserRef.current = null;
          }
        };
        if (!analyserRef.current) {
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyserRef.current = analyser;
        }
        try {
          const analyser = analyserRef.current!;
          analyser.minDecibels = audioConfig.minDecibels;
          analyser.maxDecibels = audioConfig.maxDecibels;
          analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
          analyser.fftSize = audioConfig.fftSize;
        } catch (err) {
          console.warn(err);
        }
      })
      .catch((e: any) => {
        setMicState("closed");
        console.error(e);
      });
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current
          .close()
          .catch((err) => console.error("Audio context close error:", err));
        audioCtxRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
    };
  }, []);

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
