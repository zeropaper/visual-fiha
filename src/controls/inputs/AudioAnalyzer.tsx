import { useEffect, useRef } from "react";
import styles from "./AudioFilesAnalyzer.module.css";
import { Frequency, TimeDomain, drawInfo } from "./CanvasVisualizer";

const audioConfig = {
  minDecibels: -120,
  maxDecibels: 80,
  smoothingTimeConstant: 0.85,
  fftSize: 1024,
};

export function AudioAnalyzer({
  audioUrl,
  fileName,
  track,
  writeInputValues,
  forwardedAudioRef,
  onAudioDurationChange,
}: {
  audioUrl: string;
  fileName: string;
  track: string;
  writeInputValues: (path: string, value: any) => void;
  forwardedAudioRef?: (el: HTMLAudioElement | null) => void;
  onAudioDurationChange: (duration: number) => void;
}) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio context and nodes
  function cleanupAudio() {
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
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Clean up when component unmounts or audioUrl changes
    return () => {
      cleanupAudio();
      // Do NOT revokeObjectURL here; it's handled in handleFileChange
    };
  }, [audioUrl]);

  // Setup audio context and analyser only after audio is loaded
  function handleLoadedMetadata() {
    cleanupAudio();
    if (!audioElemRef.current) return;
    try {
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaElementSource(audioElemRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.minDecibels = audioConfig.minDecibels;
      analyser.maxDecibels = audioConfig.maxDecibels;
      analyser.smoothingTimeConstant = audioConfig.smoothingTimeConstant;
      analyser.fftSize = audioConfig.fftSize;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (error) {
      console.error("Error creating MediaElementSourceNode:", error);
    }
  }

  function makeDrawExtras(type: "frequency" | "timeDomain") {
    return function drawExtras(
      canvasCtx: CanvasRenderingContext2D,
      dataArray: number[],
    ) {
      const sorted = [...dataArray].sort((a, b) => a - b);
      const info = {
        average: dataArray.reduce((a, b) => a + b, 0) / dataArray.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...dataArray),
        max: Math.max(...dataArray),
      };

      drawInfo(canvasCtx, info);

      writeInputValues(`audio.${track}.0.${type}.average`, info.average);
      writeInputValues(`audio.${track}.0.${type}.median`, info.median);
      writeInputValues(`audio.${track}.0.${type}.min`, info.min);
      writeInputValues(`audio.${track}.0.${type}.max`, info.max);
      writeInputValues(`audio.${track}.0.${type}.data`, dataArray);
    };
  }

  // Notify parent of audio duration changes
  useEffect(() => {
    if (audioElemRef.current) {
      const handleDurationChange = () => {
        onAudioDurationChange(audioElemRef.current?.duration || 0);
      };

      const currentEl = audioElemRef.current;
      currentEl.addEventListener("loadedmetadata", handleDurationChange);

      return () => {
        currentEl.removeEventListener("loadedmetadata", handleDurationChange);
      };
    }
  }, [onAudioDurationChange]);

  return (
    <details open className={styles.track}>
      <summary>{`${track} - ${fileName}`}</summary>
      <audio
        key={audioUrl}
        ref={(el) => {
          audioElemRef.current = el;
          if (forwardedAudioRef) forwardedAudioRef(el);
        }}
        src={audioUrl}
        controls
        style={{ display: "none" }}
        onError={() => {
          console.error("Error loading audio file:", audioUrl);
        }}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <track kind="captions" label="No captions" />
      </audio>

      <div className={styles.visualizers}>
        <Frequency
          analyser={analyserRef.current}
          drawExtras={makeDrawExtras("frequency")}
        />

        <TimeDomain
          analyser={analyserRef.current}
          drawExtras={makeDrawExtras("timeDomain")}
        />
      </div>
    </details>
  );
}
